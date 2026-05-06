'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type CameraState = 'requesting' | 'active' | 'denied'

export const metadata = {
  title: 'Scanner mon visage — Oculis',
  description: 'Analysez la forme de votre visage en quelques secondes pour obtenir des recommandations de montures personnalisées.',
}

export default function ScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraState, setCameraState] = useState<CameraState>('requesting')

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCameraState('active')
      } catch {
        if (!cancelled) setCameraState('denied')
      }
    }

    startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    router.push('/results')
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Oculis</span>
        <button
          onClick={() => router.push('/opticians')}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          ← Retour
        </button>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 gap-8 max-w-sm mx-auto w-full">

        {/* Info section — 3 columns */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[
            { icon: '👁️', title: 'Forme du visage', desc: 'Détectée depuis ta photo' },
            { icon: '💡', title: 'Montures adaptées', desc: 'Selon ton style et budget' },
            { icon: '📍', title: 'Près de toi', desc: 'Opticiens locaux avec tes montures' },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-1.5">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-xs font-semibold text-[#0A2540] leading-tight">{item.title}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Camera viewport */}
        <div className="w-72 h-72 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden relative flex items-center justify-center">

          {/* Live video */}
          {cameraState !== 'denied' && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
          )}

          {/* Requesting state */}
          {cameraState === 'requesting' && (
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Accès caméra…</p>
            </div>
          )}

          {/* Denied state */}
          {cameraState === 'denied' && (
            <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
              <span className="text-3xl opacity-40">🚫</span>
              <p className="text-xs text-gray-500 leading-relaxed">
                Accès caméra refusé —{' '}
                <label className="text-[#1E3A8A] font-semibold cursor-pointer hover:underline">
                  Uploader une photo
                  <input type="file" accept="image/*" className="sr-only" onChange={() => router.push('/results')} />
                </label>
              </p>
            </div>
          )}

          {/* Face outline SVG overlay */}
          {cameraState === 'active' && (
            <svg
              width="160"
              height="200"
              viewBox="0 0 160 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0 m-auto z-10 opacity-60 pointer-events-none"
            >
              <ellipse cx="80" cy="95" rx="62" ry="78" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" />
              <ellipse cx="54" cy="82" rx="12" ry="7" stroke="white" strokeWidth="1.5" />
              <ellipse cx="106" cy="82" rx="12" ry="7" stroke="white" strokeWidth="1.5" />
              <path d="M80 92 L76 110 L84 110" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M62 128 Q80 142 98 128" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M18 85 Q10 95 18 110" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M142 85 Q150 95 142 110" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={capture}
            disabled={cameraState !== 'active'}
            className="w-full bg-[#1E3A8A] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📷 Scanner mon visage
          </button>
          <label className="text-sm text-gray-400 hover:text-gray-500 transition-colors cursor-pointer">
            ou uploader une photo
            <input type="file" accept="image/*" className="sr-only" onChange={() => router.push('/results')} />
          </label>
        </div>

      </div>
    </main>
  )
}
