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

const CELEBRITIES = {
  oval: {
    male: [
      { name: 'George Clooney', profession: 'Acteur' },
      { name: 'Ryan Gosling', profession: 'Acteur' },
      { name: 'David Beckham', profession: 'Footballeur' },
    ],
    female: [
      { name: 'Bella Hadid', profession: 'Mannequin' },
      { name: 'Beyoncé', profession: 'Chanteuse' },
      { name: 'Jessica Alba', profession: 'Actrice' },
    ]
  },
  round: {
    male: [
      { name: 'Leonardo DiCaprio', profession: 'Acteur' },
      { name: 'Jack Black', profession: 'Acteur' },
      { name: 'Elijah Wood', profession: 'Acteur' },
    ],
    female: [
      { name: 'Selena Gomez', profession: 'Chanteuse' },
      { name: 'Adele', profession: 'Chanteuse' },
      { name: 'Chrissy Teigen', profession: 'Mannequin' },
    ]
  },
  square: {
    male: [
      { name: 'Brad Pitt', profession: 'Acteur' },
      { name: 'Tom Hardy', profession: 'Acteur' },
      { name: 'Arnold Schwarzenegger', profession: 'Acteur' },
    ],
    female: [
      { name: 'Angelina Jolie', profession: 'Actrice' },
      { name: 'Demi Moore', profession: 'Actrice' },
      { name: 'Keira Knightley', profession: 'Actrice' },
    ]
  },
  heart: {
    male: [
      { name: 'Ryan Reynolds', profession: 'Acteur' },
      { name: 'Justin Timberlake', profession: 'Chanteur' },
      { name: 'Zac Efron', profession: 'Acteur' },
    ],
    female: [
      { name: 'Reese Witherspoon', profession: 'Actrice' },
      { name: 'Scarlett Johansson', profession: 'Actrice' },
      { name: 'Halle Berry', profession: 'Actrice' },
    ]
  },
  oblong: {
    male: [
      { name: 'Adam Driver', profession: 'Acteur' },
      { name: 'Ben Stiller', profession: 'Acteur' },
      { name: 'Keanu Reeves', profession: 'Acteur' },
    ],
    female: [
      { name: 'Sarah Jessica Parker', profession: 'Actrice' },
      { name: 'Liv Tyler', profession: 'Actrice' },
      { name: 'Tilda Swinton', profession: 'Actrice' },
    ]
  }
}


export default function ResultsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { session } = useAuth()
  const [showToast, setShowToast] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [activeContext, setActiveContext] = useState<any>(null)
  const [hasContext, setHasContext] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    supabase
      .from('context')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1)
      .then(({ data }) => setHasContext(!!data && data.length > 0))
  }, [session])

  const from = params.get('from')
  const contextId = params.get('contextId')
  const shape = params.get('shape') ?? 'oval'
  const confidence = params.get('confidence') ?? '85'
  const ipd = params.get('ipd') ?? '64'
  const ratio = params.get('ratio') ?? '1.10'
  const gender = params.get('gender') === 'Female' ? 'female' : 'male'
  const shapeLabel = shape.charAt(0).toUpperCase() + shape.slice(1) + ' Face'
  const celebrities = CELEBRITIES[shape as keyof typeof CELEBRITIES]?.[gender] || CELEBRITIES.oval.male
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
      const { data: contextData } = contextId
        ? await supabase.from('context').select('*').eq('id', contextId).single()
        : await supabase.from('context').select('*').eq('user_id', session.user.id).eq('is_active', true).single()

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
    if (from === 'profile') return
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
          onClick={() => router.push(from === 'profile' ? '/profile' : '/scan')}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          ← Retour
        </button>
      </header>

      <div className="max-w-xl mx-auto w-full px-5 py-6 space-y-6">

        {/* Completion banner — non connecté (30%) */}
        {!session && from !== 'profile' && (
          <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ color: '#92400E', fontWeight: '600', fontSize: '14px', margin: 0 }}>Profil complété à 30%</p>
              <span style={{ background: '#F59E0B', color: 'white', borderRadius: '100px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>30%</span>
            </div>
            <div style={{ background: '#FDE68A', borderRadius: '100px', height: '6px', marginBottom: '12px' }}>
              <div style={{ background: '#F59E0B', borderRadius: '100px', height: '6px', width: '30%', transition: 'width 0.5s ease' }}/>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#92400E' }}>
              <span>✅ Scan fait</span>
              <span style={{ color: '#D97706' }}>·</span>
              <span>⬜ Compte créé</span>
              <span style={{ color: '#D97706' }}>·</span>
              <span>⬜ Contexte créé</span>
            </div>
          </div>
        )}

        {/* Completion banner — connecté sans contexte (50%) */}
        {session && !hasContext && from !== 'profile' && (
          <div style={{ background: '#EEF2FF', border: '1px solid #1E3A8A', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ color: '#1E3A8A', fontWeight: '600', fontSize: '14px', margin: 0 }}>Profil complété à 50%</p>
              <span style={{ background: '#1E3A8A', color: 'white', borderRadius: '100px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>50%</span>
            </div>
            <div style={{ background: '#C7D2FE', borderRadius: '100px', height: '6px', marginBottom: '12px' }}>
              <div style={{ background: '#1E3A8A', borderRadius: '100px', height: '6px', width: '50%', transition: 'width 0.5s ease' }}/>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#1E3A8A' }}>
              <span>✅ Scan fait</span>
              <span>·</span>
              <span>✅ Compte créé</span>
              <span>·</span>
              <span>⬜ Contexte créé</span>
            </div>
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
            {celebrities.map((celeb) => (
              <div
                key={celeb.name}
                className="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center gap-2 w-36"
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-400">
                  {celeb.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-[#0A2540] leading-tight">{celeb.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{celeb.profession}</p>
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
              onClick={() => router.push(`/opticians?contextId=${contextId || ''}`)}
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
