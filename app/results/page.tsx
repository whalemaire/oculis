'use client'

export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getRecommendations } from '@/lib/recommendationEngine'
import { getTopFrames } from '@/lib/frameScoring'

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

  console.log('URL params:', {
    contextId: params.get('contextId'),
    shape: params.get('shape'),
    from: params.get('from'),
    fullUrl: typeof window !== 'undefined' ? window.location.href : 'SSR'
  })
  const [showToast, setShowToast] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [activeContext, setActiveContext] = useState<any>(null)
  const [hasContext, setHasContext] = useState(false)
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const [scanData, setScanData] = useState<any>(null)
  const [orderedRecs, setOrderedRecs] = useState<any[]>([])
  const [feedbackToast, setFeedbackToast] = useState<{ message: string, type: 'like' | 'dislike' } | null>(null)
  const [topFrames, setTopFrames] = useState<any[]>([])
  const [hasFeedback, setHasFeedback] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    supabase
      .from('context')
      .select('id')
      .eq('user_id', session.user.id)
      .limit(1)
      .then(({ data }) => setHasContext(!!data && data.length > 0))
  }, [session])

  useEffect(() => {
    if (!session?.user?.id) return
    fetch(`/api/feedback?user_id=${session.user.id}`)
      .then(r => r.json())
      .then(({ feedbacks: data }) => {
        const map: Record<string, string> = {}
        data?.forEach((f: any) => { map[f.frame_style] = f.signal_type })
        setFeedbacks(map)
        setFeedbackList(data || [])
      })
  }, [session])

  // Initialise l'ordre une seule fois
  useEffect(() => {
    if (recommendations.length > 0 && orderedRecs.length === 0) {
      setOrderedRecs(recommendations)
    }
  }, [recommendations])

  // Après feedback, update scores sans changer l'ordre
  useEffect(() => {
    if (recommendations.length > 0 && orderedRecs.length > 0) {
      setOrderedRecs(prev => prev.map(rec => {
        const updated = recommendations.find(r => r.name === rec.name)
        return updated || rec
      }))
    }
  }, [recommendations])

  const sendFeedback = async (frameName: string, signalType: 'like' | 'dislike') => {
    if (!session?.user?.id) return

    setFeedbacks(prev => ({ ...prev, [frameName]: signalType }))

    const newFeedback = {
      frame_style: frameName,
      signal_type: signalType,
      weight: signalType === 'like' ? 2.0 : -2.0,
      created_at: new Date().toISOString()
    }

    const updatedList = [
      ...feedbackList.filter(f => f.frame_style !== frameName),
      newFeedback
    ]
    setFeedbackList(updatedList)

    if (scanData && activeContext) {
      const recs = getRecommendations(scanData, activeContext, updatedList)
      setRecommendations(recs)

    }

    setHasFeedback(true)
    setFeedbackToast({
      message: signalType === 'like'
        ? 'Préférence enregistrée — tes prochains résultats seront affinés ✓'
        : 'Compris — on va proposer autre chose ✓',
      type: signalType
    })
    setTimeout(() => setFeedbackToast(null), 2500)

    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session.user.id,
        frame_style: frameName,
        signal_type: signalType,
        context_id: contextId || null,
      })
    })
  }

  const from = params.get('from')
  const contextId = params.get('contextId')
  const shape = params.get('shape') ?? 'oval'
  const confidence = params.get('confidence') ?? '85'
  const ipd = params.get('ipd') ?? '64'
  const ratio = params.get('ratio') ?? '1.10'
  const gender = params.get('gender') === 'Female' ? 'female' : 'male'
  const shapeLabel = shape.charAt(0).toUpperCase() + shape.slice(1) + ' Face'
  const celebrities = CELEBRITIES[shape as keyof typeof CELEBRITIES]?.[gender] || CELEBRITIES.oval.male
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

    const loadData = async () => {
      const { data: scanArray } = await supabase
        .from('scan')
        .select('*')
        .eq('user_id', session.user.id)
        .limit(1)
      const scan = scanArray?.[0]

      let context = null
      if (contextId) {
        const { data } = await supabase
          .from('context')
          .select('*')
          .eq('id', contextId)
          .single()
        context = data
      } else {
        const { data } = await supabase
          .from('context')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .limit(1)
        context = data?.[0]
      }

      console.log('Loading results with context:', context?.name, 'contextId from URL:', contextId)

      if (scan) {
        const scanWithProbs = {
          ...scan,
          shape_probabilities: scan.shape_probabilities
            ? JSON.parse(scan.shape_probabilities)
            : undefined,
          top_shapes: scan.top_shapes
            ? JSON.parse(scan.top_shapes)
            : undefined,
        }
        const frames = getTopFrames(
          {
            face_shape: scanWithProbs.face_shape,
            ipd: scanWithProbs.ipd,
            face_width: scanWithProbs.face_width,
            ratio: scanWithProbs.ratio,
            nose_width: scanWithProbs.nose_width,
            ratio_cheek_jaw: scanWithProbs.ratio_cheek_jaw,
            shape_probabilities: scanWithProbs.shape_probabilities,
            gender: scanWithProbs.gender,
            age: scanWithProbs.age,
            chin_height: scanWithProbs.chin_height,
            forehead_width: scanWithProbs.forehead_width,
            nose_length: scanWithProbs.nose_length,
            face_height: scanWithProbs.face_height,
          },
          context || {},
          6
        )
        setTopFrames(frames)
        setScanData(scanWithProbs)

        const recs = getRecommendations(scanWithProbs, context || {}, feedbackList)
        setRecommendations(recs)
      }
      if (context) setActiveContext(context)
    }

    loadData()
  }, [session, contextId])

  useEffect(() => {
    if (from === 'profile') return
    const show = setTimeout(() => setShowToast(true), 1000)
    const hide = setTimeout(() => setShowToast(false), 4000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [])

  return (
    <main className="min-h-screen bg-[#F4F6F9] flex flex-col pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-400 text-sm">←</button>
        <span className="font-bold text-[#0A2540]">Oculis</span>
        <button onClick={() => router.push('/profile')} className="text-gray-400 text-sm">👤</button>
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
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            {celebrities.map((celeb) => (
              <div
                key={celeb.name}
                className="min-w-[140px] md:min-w-0 flex-shrink-0 md:flex-shrink bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center gap-2"
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
          <style>{`@keyframes fadeOut { 0% { opacity: 1; transform: translateY(0); } 70% { opacity: 1; transform: translateY(-4px); } 100% { opacity: 0; transform: translateY(-8px); } }`}</style>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Montures recommandées
          </p>
          {hasFeedback && (
            <button
              onClick={() => {
                if (!scanData) return
                const ctx = activeContext || {
                  style: 'Classique', usage: 'Quotidien', correction: 'Vue',
                  budget: '100-300€', material: 'Peu importe',
                }
                const updated = getTopFrames(
                  {
                    face_shape: scanData.face_shape,
                    ipd: scanData.ipd,
                    face_width: scanData.face_width,
                    ratio: scanData.ratio,
                    nose_width: scanData.nose_width,
                    ratio_cheek_jaw: scanData.ratio_cheek_jaw,
                    shape_probabilities: scanData.shape_probabilities,
                    gender: scanData.gender,
                    age: scanData.age,
                    chin_height: scanData.chin_height,
                    forehead_width: scanData.forehead_width,
                    nose_length: scanData.nose_length,
                    face_height: scanData.face_height,
                  },
                  ctx,
                  6
                )
                  .map(frame => {
                    let feedbackBonus = 0
                    if (feedbacks[frame.style] === 'like') feedbackBonus += 15
                    if (feedbacks[frame.style] === 'dislike') feedbackBonus -= 25
                    feedbackList.forEach(fb => {
                      const SIMILARITY: Record<string, Record<string, number>> = {
                        'Rond': { 'Ovale fin': 0.8, 'Rond fin': 0.9 },
                        'Rond fin': { 'Rond': 0.9, 'Ovale fin': 0.8 },
                        'Rectangulaire': { 'Browline': 0.7, 'Wayfarer': 0.6 },
                        'Cat-eye': { 'Oversized': 0.7, 'Géométrique': 0.6 },
                        'Aviateur': { 'Ovale fin': 0.6, 'Wayfarer': 0.5 },
                      }
                      const similarity = SIMILARITY[fb.frame_style]?.[frame.style] || 0
                      if (similarity > 0) {
                        if (fb.signal_type === 'like') feedbackBonus += similarity * 10
                        if (fb.signal_type === 'dislike') feedbackBonus -= similarity * 15
                      }
                    })
                    return { ...frame, score: Math.min(98, Math.max(0, frame.score + feedbackBonus)) }
                  })
                  .sort((a, b) => b.score - a.score)
                setTopFrames(updated)
                setHasFeedback(false)
              }}
              className="w-full py-3 bg-[#0A2540] text-white rounded-xl font-medium text-sm mb-4"
            >
              Actualiser mes résultats
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topFrames.map((frame) => (
              <div key={frame.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-8 flex items-center justify-center relative">
                  <span className="absolute top-3 right-3 bg-[#1E3A8A] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {frame.score}%
                  </span>
                  {framesvg(frame.style)}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{frame.brand}</p>
                      <h3 className="font-bold text-[#0A2540]">{frame.model}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{frame.material} · {frame.weight_grams}g · {frame.price_range}</p>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
                    <div
                      className="h-1.5 bg-[#1E3A8A] rounded-full"
                      style={{ width: `${frame.score}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {frame.style_tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-[10px] border border-[#1E3A8A] text-[#1E3A8A] px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {session && (
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => sendFeedback(frame.style, 'like')}
                        className="flex-1 py-3 md:py-2 rounded-lg border text-base transition-all"
                        style={{
                          borderColor: feedbacks[frame.style] === 'like' ? '#10B981' : '#E2E8F0',
                          background: feedbacks[frame.style] === 'like' ? '#D1FAE5' : 'white'
                        }}
                      >👍</button>
                      <button
                        onClick={() => sendFeedback(frame.style, 'dislike')}
                        className="flex-1 py-3 md:py-2 rounded-lg border text-base transition-all"
                        style={{
                          borderColor: feedbacks[frame.style] === 'dislike' ? '#EF4444' : '#E2E8F0',
                          background: feedbacks[frame.style] === 'dislike' ? '#FEE2E2' : 'white'
                        }}
                      >👎</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 pb-safe">
        <div className="max-w-xl mx-auto flex flex-col gap-2">
          {!session ? (
            <>
              <button
                onClick={() => router.push('/register')}
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
          ) : (
            <>
              {session && hasContext && (
                <button
                  onClick={() => {
                    const frameStyles = topFrames
                      .slice(0, 3)
                      .map(f => f.style)
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .join(',')
                    router.push(`/opticians?contextId=${contextId || ''}&frames=${encodeURIComponent(frameStyles)}`)
                  }}
                  className="w-full bg-[#1E3A8A] text-white py-4 rounded-xl font-semibold text-base"
                >
                  Voir les opticiens →
                </button>
              )}
              {session && !hasContext && (
                <button
                  onClick={() => router.push('/contexts/new')}
                  className="w-full bg-[#1E3A8A] text-white py-4 rounded-xl font-semibold text-base"
                >
                  Créer un contexte pour affiner →
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast feedback */}
      {feedbackToast && (
        <div style={{
          position: 'fixed',
          bottom: '84px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: feedbackToast.type === 'like' ? '#10B981' : '#F97316',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '100px',
          fontSize: '13px',
          fontWeight: '600',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap'
        }}>
          {feedbackToast.message}
        </div>
      )}

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
