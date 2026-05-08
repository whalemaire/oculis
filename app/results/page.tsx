'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getRecommendations } from '@/lib/recommendationEngine'

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
  if (n.includes('aviateur')) return SVG_AVIATOR
  if (n.includes('rond') || n.includes('ovale')) return SVG_ROUND
  return SVG_RECT
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
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [activeContext, setActiveContext] = useState<any>(null)

  const shape = params.get('shape') ?? 'oval'
  const confidence = params.get('confidence') ?? '85'
  const ipd = params.get('ipd') ?? '64'
  const ratio = params.get('ratio') ?? '1.10'
  const shapeLabel = shape.charAt(0).toUpperCase() + shape.slice(1) + ' Face'
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

  // UseEffect 1 — sans session, utilise les params URL
  useEffect(() => {
    if (session) return
    const urlShape = params.get('shape') || 'oval'
    const recs = getRecommendations(
      { face_shape: urlShape, confidence: 85, ratio: 0.8, ipd: 64 },
      { style: 'Classique', usage: 'Quotidien', correction: 'Vue', budget: '100-300€', material: 'Peu importe', colors: 'Neutres', personality: 'Discret', frame_weight: 'Peu importe' }
    )
    setRecommendations(recs)
  }, [])

  // UseEffect 2 — avec session, utilise Supabase
  useEffect(() => {
    if (!session?.user?.id) return

    const loadRecommendations = async () => {
      const { data: contextData } = await supabase
        .from('context')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single()

      const { data: scanArray } = await supabase
        .from('scan')
        .select('*')
        .eq('user_id', session.user.id)
        .limit(1)

      const scanData = scanArray?.[0] || null
      console.log('scanData corrigé:', scanData)

      console.log('session:', session?.user?.id)
      console.log('contextData:', contextData)
      console.log('scanData:', scanData)

      if (contextData) setActiveContext(contextData)

      if (scanData && contextData) {
        const recs = getRecommendations(scanData, contextData)
        console.log('recommendations:', recs)
        setRecommendations(recs)
      } else if (scanData) {
        const recs = getRecommendations(scanData, {
          style: 'Classique',
          usage: 'Quotidien',
          correction: 'Vue',
          budget: '100-300€',
          material: 'Peu importe',
          colors: 'Neutres',
          personality: 'Discret',
          frame_weight: 'Peu importe',
        })
        console.log('recommendations:', recs)
        setRecommendations(recs)
      }
    }

    loadRecommendations()
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

        {/* Completion banner — non connecté */}
        {!session && (
          <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#92400E', fontWeight: '600', fontSize: '14px' }}>Profil complété à 10%</p>
              <p style={{ color: '#B45309', fontSize: '12px' }}>Crée un compte pour affiner tes résultats</p>
            </div>
            <div style={{ background: '#F59E0B', borderRadius: '100px', padding: '4px 8px', fontSize: '12px', color: 'white', fontWeight: '600' }}>10%</div>
          </div>
        )}

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
            {recommendations.map((rec) => (
              <div
                key={rec.name}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                {/* Illustration */}
                <div className="w-full h-20 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                  {framesvg(rec.name)}
                </div>

                {/* Name + score */}
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-[#0A2540]">{rec.name}</p>
                  <span className="text-sm font-bold text-[#1E3A8A]">{rec.score}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
                  <div
                    className="h-1.5 bg-[#1E3A8A] rounded-full transition-all"
                    style={{ width: `${rec.score}%` }}
                  />
                </div>

                {/* Description */}
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{rec.explanation}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {rec.tags.map((tag: string) => (
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
        <div className="max-w-xl mx-auto flex flex-col gap-2">
          {!session ? (
            <>
              <button
                onClick={() => router.push('/login?redirect=/contexts/new')}
                className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors"
              >
                Créer un contexte pour affiner →
              </button>
              <button
                onClick={() => router.push('/opticians')}
                className="w-full border border-gray-200 text-gray-500 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Voir les opticiens quand même →
              </button>
            </>
          ) : !activeContext ? (
            <>
              <button
                onClick={() => router.push('/contexts/new')}
                className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors"
              >
                Créer un contexte pour affiner →
              </button>
              <button
                onClick={() => router.push('/opticians')}
                className="w-full border border-gray-200 text-gray-500 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Voir les opticiens →
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push(`/opticians?frames=${recommendations.map((r) => r.name).join(',')}`)}
              className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors"
            >
              Trouver ces montures près de moi →
            </button>
          )}
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
