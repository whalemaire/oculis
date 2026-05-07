'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'

const recommendations: Record<string, { name: string; score: number }[]> = {
  oval: [
    { name: 'Modernist Rectangular', score: 92 },
    { name: 'Pilot Aviator', score: 86 },
    { name: 'Round Académie', score: 78 },
  ],
  round: [
    { name: 'Rectangular Bold', score: 94 },
    { name: 'Wayfarer Classic', score: 88 },
    { name: 'Cat-eye Modern', score: 75 },
  ],
  square: [
    { name: 'Round Soft', score: 93 },
    { name: 'Oval Vintage', score: 85 },
    { name: 'Aviator Slim', score: 79 },
  ],
  oblong: [
    { name: 'Wayfarer Large', score: 91 },
    { name: 'Round Classic', score: 84 },
    { name: 'Cat-eye Bold', score: 77 },
  ],
}

const SVG_RECT = (
  <svg width="96" height="40" viewBox="0 0 96 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="38" height="24" rx="4" stroke="#0A2540" strokeWidth="2.5" />
    <rect x="54" y="8" width="38" height="24" rx="4" stroke="#0A2540" strokeWidth="2.5" />
    <line x1="42" y1="20" x2="54" y2="20" stroke="#0A2540" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="0" y1="14" x2="4" y2="14" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" />
    <line x1="92" y1="14" x2="96" y2="14" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const SVG_AVIATOR = (
  <svg width="96" height="48" viewBox="0 0 96 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 16 Q4 36 23 36 Q42 36 42 20 Q42 8 23 8 Q4 8 4 16Z" stroke="#0A2540" strokeWidth="2.5" fill="none" />
    <path d="M54 16 Q54 36 73 36 Q92 36 92 20 Q92 8 73 8 Q54 8 54 16Z" stroke="#0A2540" strokeWidth="2.5" fill="none" />
    <line x1="42" y1="16" x2="54" y2="16" stroke="#0A2540" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="0" y1="12" x2="4" y2="14" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" />
    <line x1="92" y1="14" x2="96" y2="12" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const SVG_ROUND = (
  <svg width="96" height="44" viewBox="0 0 96 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="23" cy="22" r="18" stroke="#0A2540" strokeWidth="2.5" fill="none" />
    <circle cx="73" cy="22" r="18" stroke="#0A2540" strokeWidth="2.5" fill="none" />
    <line x1="41" y1="22" x2="55" y2="22" stroke="#0A2540" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="0" y1="16" x2="5" y2="18" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" />
    <line x1="91" y1="18" x2="96" y2="16" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

function framesvg(name: string) {
  const n = name.toLowerCase()
  if (n.includes('aviator') || n.includes('pilot')) return SVG_AVIATOR
  if (n.includes('round') || n.includes('oval') || n.includes('académie')) return SVG_ROUND
  return SVG_RECT
}

function frameTags(name: string): string[] {
  const n = name.toLowerCase()
  if (n.includes('aviator') || n.includes('pilot')) return ['Vintage', 'Iconique', 'Casual']
  if (n.includes('round') || n.includes('oval')) return ['Artistique', 'Rétro', 'Doux']
  if (n.includes('cat-eye')) return ['Mode', 'Audacieux', 'Féminin']
  return ['Classique', 'Polyvalent', 'Business']
}

function frameDesc(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('aviator') || n.includes('pilot')) return 'Style intemporel aux lentilles tombantes. Ajoute du caractère à votre visage.'
  if (n.includes('round') || n.includes('oval')) return 'Forme douce et artistique qui contraste élégamment avec vos traits.'
  if (n.includes('cat-eye')) return 'Monture rétro et audacieuse qui met en valeur le regard.'
  return 'Structure nette et équilibrée qui souligne le regard avec élégance.'
}

const CELEBRITIES = [
  { initial: 'GC', name: 'George Clooney', job: 'Acteur' },
  { initial: 'BH', name: 'Bella Hadid', job: 'Mannequin' },
  { initial: 'RG', name: 'Ryan Gosling', job: 'Acteur' },
]


export default function ResultsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { session } = useAuth()
  const [showToast, setShowToast] = useState(false)

  const shape = params.get('shape') ?? 'oval'
  const confidence = params.get('confidence') ?? '85'
  const ipd = params.get('ipd') ?? '64'
  const ratio = params.get('ratio') ?? '1.10'
  const shapeLabel = shape.charAt(0).toUpperCase() + shape.slice(1) + ' Face'
  const frames = recommendations[shape] ?? recommendations.oval
  const topMatch = frames[0]

  useEffect(() => {
    if (!session?.user?.id) return

    fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session.user.id,
        face_shape: shape,
        confidence: Number(confidence),
        ipd: Number(ipd),
        ratio: Number(ratio),
      }),
    })
  }, [session])

  useEffect(() => {
    const show = setTimeout(() => setShowToast(true), 1000)
    const hide = setTimeout(() => setShowToast(false), 4000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  return (
    <main className="min-h-screen bg-[#F4F6F9] flex flex-col pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Oculis</span>
        <button
          onClick={() => router.push('/scan')}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          ← Retour
        </button>
      </header>

      <div className="max-w-xl mx-auto w-full px-5 py-6 space-y-6">

        {/* Section 1 — Forme du visage */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center gap-3">
          <span className="bg-[#1E3A8A] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
            {shapeLabel}
          </span>
          <p className="text-6xl font-extrabold text-[#1E3A8A] leading-none">{confidence}%</p>
          <p className="text-sm text-gray-400">Basé sur 106 points de détection</p>

          {/* Landmark pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {[`106 landmarks`, `Ratio ${ratio}`, `PD ${ipd} mm`].map((pill) => (
              <span key={pill} className="text-[11px] font-medium bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Section 2 — Célébrités */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Visages similaires
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {CELEBRITIES.map((celeb) => (
              <div
                key={celeb.name}
                className="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center gap-2 w-36"
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-400">
                  {celeb.initial}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-[#0A2540] leading-tight">{celeb.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{celeb.job}</p>
                </div>
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Même forme
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 — Montures recommandées */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Montures recommandées
          </p>
          <div className="space-y-3">
            {frames.map((frame) => (
              <div
                key={frame.name}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                {/* Illustration */}
                <div className="w-full h-20 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                  {framesvg(frame.name)}
                </div>

                {/* Name + score */}
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-[#0A2540]">{frame.name}</p>
                  <span className="text-sm font-bold text-[#1E3A8A]">{frame.score}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
                  <div
                    className="h-1.5 bg-[#1E3A8A] rounded-full transition-all"
                    style={{ width: `${frame.score}%` }}
                  />
                </div>

                {/* Description */}
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{frameDesc(frame.name)}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {frameTags(frame.name).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium border border-[#1E3A8A] text-[#1E3A8A] px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-3.5">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Top Match</p>
            <p className="text-sm font-bold text-[#1E3A8A] leading-tight truncate">
              {topMatch.name} · {topMatch.score}% · Maison Lartigue 0.4 km
            </p>
          </div>
          <button
            onClick={() => router.push(`/opticians?frames=${recommendations[shape as keyof typeof recommendations]?.map((r: any) => r.name).join(',')}`)}
            className="flex-shrink-0 bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors whitespace-nowrap"
          >
            Find the frames →
          </button>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed bottom-24 right-5 flex items-center gap-2 bg-green-500 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all duration-500 ${
          showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <span>✓</span>
        <span>Saved to your scans</span>
      </div>
    </main>
  )
}
