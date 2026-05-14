'use client'

export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { FiglaLogo } from '@/app/components/FiglaLogo'

type CameraState = 'requesting' | 'active' | 'denied'

const SCAN_TIPS = [
  { icon: '☀️', title: 'Bonne lumière', desc: 'Éclairage naturel ou face à une lampe' },
  { icon: '🧍', title: 'Visage centré', desc: 'Garde la tête droite, regard vers la caméra' },
  { icon: '😐', title: 'Expression neutre', desc: 'Pas de sourire pour des mesures précises' },
  { icon: '📏', title: '30–50 cm', desc: "Distance idéale entre ton visage et l'écran" },
]

export default function ScanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const { session } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraState, setCameraState] = useState<CameraState>('requesting')
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

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

  async function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1]

    setError('')
    setAnalyzing(true)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const data = await res.json()
      console.log('analyze response:', JSON.stringify({
        faceShape: data.faceShape,
        shapeProbabilities: data.shapeProbabilities,
        topShapes: data.topShapes,
      }))

      if (!res.ok) {
        if (data.error === 'no_face') {
          setError('Aucun visage détecté — recentre ton visage')
        } else {
          setError('Une erreur est survenue — réessaie')
        }
        setAnalyzing(false)
        return
      }

      streamRef.current?.getTracks().forEach((t) => t.stop())

      if (session?.user?.id) {
        console.log('Sending to /api/scans:', {
          shape_probabilities: data.shapeProbabilities,
          top_shapes: data.topShapes,
        })
        const scanResponse = await fetch('/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: session.user.id,
            face_shape: data.faceShape,
            confidence: data.confidence,
            gender: data.gender,
            age: data.age,
            measurements: data.measurements,
            ratios: data.ratios,
            shape_probabilities: data.shapeProbabilities,
            top_shapes: data.topShapes,
          }),
        })
        const scanResult = await scanResponse.json()
        console.log('Scan saved:', scanResult)
      }

      if (from === 'profile') {
        router.push('/profile?updated=true')
      } else {
        router.push(`/results?shape=${data.faceShape}&confidence=${data.confidence}&ipd=${data.measurements?.ipd ?? data.ipd}&ratio=${data.ratios?.heightWidth ?? data.ratio}&gender=${data.gender}`)
      }
    } catch {
      setError('Une erreur est survenue — réessaie')
      setAnalyzing(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0A2540', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Glow backgrounds */}
      <div style={{ position: 'absolute', right: -200, top: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,140,255,.28) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: -120, bottom: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,140,255,.14) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', position: 'relative', zIndex: 1 }}>
        <button
          onClick={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 16, fontFamily: 'inherit' }}
        >
          ←
        </button>
        <FiglaLogo size={26} variant="inv" />
        <div style={{ width: 36 }} />
      </header>

      {/* Body — 1-col mobile, 2-col desktop */}
      <div
        className="grid md:grid-cols-[1fr_1fr]"
        style={{ flex: 1, gap: 32, padding: '0 24px 40px', position: 'relative', zIndex: 1, alignItems: 'center', maxWidth: 920, margin: '0 auto', width: '100%' }}
      >
        {/* Tips — desktop only */}
        <div className="hidden md:flex" style={{ flexDirection: 'column', gap: 14 }}>
          <div style={{ marginBottom: 6 }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5B8CFF', margin: '0 0 10px' }}>Guide de scan</p>
            <h2 style={{ color: '#fff', fontSize: 30, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-.015em', margin: 0 }}>Pour un scan<br/>précis</h2>
          </div>
          {SCAN_TIPS.map((tip) => (
            <div key={tip.title} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
              <div>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 3px', lineHeight: 1 }}>{tip.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0, lineHeight: 1.45 }}>{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Camera column */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

          {/* Viewport with corner guides */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
            {/* Corner brackets */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
              <span key={c} style={{
                position: 'absolute',
                width: 26, height: 26, zIndex: 2,
                ...(c[0] === 't' ? { top: -2 } : { bottom: -2 }),
                ...(c[1] === 'l' ? { left: -2 } : { right: -2 }),
                borderColor: '#5B8CFF', borderStyle: 'solid', borderWidth: 0,
                ...(c === 'tl' ? { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 7 }
                  : c === 'tr' ? { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 7 }
                  : c === 'bl' ? { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 7 }
                  : { borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 7 }),
              }} />
            ))}

            {/* Camera box */}
            <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Live video */}
              {cameraState !== 'denied' && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              )}

              {/* Requesting */}
              {cameraState === 'requesting' && (
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#5B8CFF', borderTopColor: 'transparent' }} />
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Accès caméra…</p>
                </div>
              )}

              {/* Denied */}
              {cameraState === 'denied' && (
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '0 24px', textAlign: 'center' }}>
                  <span style={{ fontSize: 32, opacity: 0.35 }}>🚫</span>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
                    Accès caméra refusé —{' '}
                    <label style={{ color: '#5B8CFF', fontWeight: 600, cursor: 'pointer' }}>
                      Uploader une photo
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => router.push('/results')} />
                    </label>
                  </p>
                </div>
              )}

              {/* Face SVG with landmark dots */}
              {cameraState === 'active' && (
                <svg
                  width="160" height="200" viewBox="0 0 160 200" fill="none"
                  style={{ position: 'absolute', inset: 0, margin: 'auto', zIndex: 10, opacity: 0.75, pointerEvents: 'none' }}
                >
                  <ellipse cx="80" cy="95" rx="62" ry="78" stroke="#5B8CFF" strokeWidth="1.5" strokeDasharray="6 4" />
                  <circle cx="54" cy="82" r="3" fill="#5B8CFF" />
                  <circle cx="106" cy="82" r="3" fill="#5B8CFF" />
                  <circle cx="80" cy="108" r="2.5" fill="#5B8CFF" />
                  <circle cx="68" cy="128" r="2" fill="#5B8CFF" />
                  <circle cx="92" cy="128" r="2" fill="#5B8CFF" />
                  <circle cx="80" cy="60" r="2" fill="#5B8CFF" opacity="0.6" />
                </svg>
              )}

              {/* Status pill */}
              {cameraState === 'active' && (
                <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(91,140,255,0.18)', border: '1px solid rgba(91,140,255,0.35)', borderRadius: 999, padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 7, zIndex: 10, whiteSpace: 'nowrap' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5B8CFF', display: 'block', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#5B8CFF', fontWeight: 600, letterSpacing: '.02em' }}>Caméra prête</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile tips — compact scrollable row */}
          <div className="md:hidden" style={{ display: 'flex', gap: 8, width: '100%', overflowX: 'auto', paddingBottom: 2 }}>
            {SCAN_TIPS.map((tip) => (
              <div key={tip.title} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px', flexShrink: 0, textAlign: 'center', minWidth: 76 }}>
                <div style={{ fontSize: 18, marginBottom: 5 }}>{tip.icon}</div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, margin: 0, lineHeight: 1.2 }}>{tip.title}</p>
              </div>
            ))}
          </div>

          {/* Hidden canvas */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Error */}
          {error && (
            <p style={{ fontSize: 12, color: '#EF4444', textAlign: 'center', margin: '-8px 0 0' }}>{error}</p>
          )}

          {/* CTA */}
          <div style={{ width: '100%' }}>
            {analyzing ? (
              <div style={{ width: '100%', background: '#5B8CFF', color: '#0A2540', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span>Analyse en cours</span>
                <span style={{ display: 'flex', gap: 4 }}>
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="animate-bounce" style={{ width: 6, height: 6, background: '#0A2540', borderRadius: '50%', display: 'inline-block', animationDelay: `${d}ms` }} />
                  ))}
                </span>
              </div>
            ) : (
              <button
                onClick={capture}
                disabled={cameraState !== 'active'}
                style={{ width: '100%', background: '#5B8CFF', color: '#0A2540', padding: '16px', borderRadius: 14, fontWeight: 700, fontSize: 15, border: 'none', cursor: cameraState !== 'active' ? 'not-allowed' : 'pointer', opacity: cameraState !== 'active' ? 0.45 : 1, fontFamily: 'inherit', boxShadow: cameraState === 'active' ? '0 8px 22px -8px rgba(91,140,255,.55)' : 'none' }}
              >
                📷 Scanner mon visage
              </button>
            )}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 500, padding: '12px 0', cursor: 'pointer' }}>
              ou uploader une photo
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={() => router.push('/results')} />
            </label>
          </div>
        </div>
      </div>
    </main>
  )
}
