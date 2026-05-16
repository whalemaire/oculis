'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/app/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getTopFrames } from '@/lib/frameScoring'

type Step = 'celebrities' | 'swipe' | 'continue'

const CELEBRITY_SLIDES_BY_GENDER = {
  male: [
    { name: 'Brad Pitt',      style: 'Rectangulaire', image: '🎬', description: 'Visage carré · Style classique' },
    { name: 'Ryan Gosling',   style: 'Wayfarer',      image: '🎭', description: 'Visage ovale · Style moderne' },
    { name: 'Tom Hardy',      style: 'Aviateur',      image: '💪', description: 'Visage carré · Style premium' },
    { name: 'David Beckham',  style: 'Rectangulaire', image: '⚽', description: 'Visage ovale · Style iconique' },
    { name: 'Keanu Reeves',   style: 'Rond',          image: '🕶️', description: 'Visage allongé · Style décontracté' },
  ],
  female: [
    { name: 'Bella Hadid',      style: 'Cat-eye',      image: '💫', description: 'Visage ovale · Style fashion' },
    { name: 'Angelina Jolie',   style: 'Aviateur',     image: '⭐', description: 'Visage carré · Style iconique' },
    { name: 'Beyoncé',          style: 'Oversized',    image: '👑', description: 'Visage ovale · Style glamour' },
    { name: 'Audrey Hepburn',   style: 'Cat-eye',      image: '🌟', description: 'Visage ovale · Style élégant' },
    { name: 'Rihanna',          style: 'Géométrique',  image: '🎵', description: 'Visage cœur · Style avant-garde' },
  ]
}

export default function DiscoveryPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { session } = useAuth()

  const contextId  = params.get('contextId')
  const shape      = params.get('shape') ?? 'oval'
  const confidence = params.get('confidence') ?? '85'
  const ipd        = params.get('ipd') ?? '64'
  const ratio      = params.get('ratio') ?? '0.8'
  const gender     = params.get('gender') ?? 'Male'

  const [step, setStep]               = useState<Step>('celebrities')
  const [showSummary, setShowSummary] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [swipeIndex, setSwipeIndex]   = useState(0)
  const [round, setRound]             = useState(1)
  const [likes, setLikes]             = useState<string[]>([])
  const [dislikes, setDislikes]       = useState<string[]>([])
  const [swipeFrames, setSwipeFrames] = useState<any[]>([])
  const [celebritySlides, setCelebritySlides] = useState(CELEBRITY_SLIDES_BY_GENDER.male)
  const [dragX, setDragX]             = useState(0)
  const [isDragging, setIsDragging]   = useState(false)
  const dragStartX = useRef(0)

  // Auto-slide célébrités
  useEffect(() => {
    if (step !== 'celebrities') return
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= celebritySlides.length - 1) {
          clearInterval(interval)
          setTimeout(() => setShowSummary(true), 500)
          return prev
        }
        return prev + 1
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [step])

  // Charger scan + contexte → calculer swipeFrames
  useEffect(() => {
    if (!session?.user?.id) return

    const loadFrames = async () => {
      const { data: scanArray } = await supabase
        .from('scan')
        .select('*')
        .eq('user_id', session.user.id)
        .limit(1)

      const scan = scanArray?.[0]
      if (!scan) {
        console.log('No scan found')
        return
      }

      console.log('Scan loaded:', scan.face_shape, scan.gender)

      const genderKey = scan?.gender === 'Female' ? 'female' : 'male'
      setCelebritySlides(CELEBRITY_SLIDES_BY_GENDER[genderKey])

      let context = {}
      if (contextId) {
        const { data: ctx } = await supabase
          .from('context')
          .select('*')
          .eq('id', contextId)
          .single()
        if (ctx) context = ctx
      }

      let parsedProbs = undefined
      try {
        const raw = scan.shape_probabilities
        if (typeof raw === 'string') {
          const parsed = JSON.parse(raw)
          parsedProbs = typeof parsed === 'string' ? JSON.parse(parsed) : parsed
        } else if (typeof raw === 'object') {
          parsedProbs = raw
        }
      } catch (e) {
        console.log('Error parsing shape_probabilities:', e)
      }

      const scanWithProbs = {
        ...scan,
        shape_probabilities: parsedProbs
      }

      console.log('parsedProbs:', parsedProbs)
      const frames = getTopFrames(scanWithProbs, context, 20)
      console.log('Frames result:', frames.length)
      setSwipeFrames(frames)
    }

    loadFrames()
  }, [session, contextId])

  const currentFrame = swipeFrames[swipeIndex]
  const remainingFrames = swipeFrames.length - (swipeIndex + 1)

  const handleSwipe = (direction: 'like' | 'dislike') => {
    if (!currentFrame) return
    if (direction === 'like') setLikes(prev => [...prev, currentFrame.id])
    else setDislikes(prev => [...prev, currentFrame.id])

    if (session?.user?.id) {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          frame_id: currentFrame.id,
          frame_style: currentFrame.style,
          signal_type: direction,
          weight: direction === 'like' ? 2.0 : -2.0,
          context_id: contextId || null,
        }),
      })
    }

    setDragX(0)
    if ((swipeIndex + 1) % 5 === 0) {
      setStep('continue')
    } else {
      setSwipeIndex(prev => prev + 1)
    }
  }

  const triggerSwipe = (direction: 'like' | 'dislike') => {
    setDragX(direction === 'like' ? 220 : -220)
    setTimeout(() => handleSwipe(direction), 280)
  }

  const resultsUrl = `/results?contextId=${contextId}&shape=${shape}&confidence=${confidence}&ipd=${ipd}&ratio=${ratio}&gender=${gender}&from=discovery`

  // ─── ÉTAPE 1 — Célébrités ───────────────────────────────────────────────────
  if (step === 'celebrities') {
    // Écran résumé après le carousel
    if (showSummary) {
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>Ton style ressemble à</p>
          <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', textAlign: 'center', marginBottom: '32px' }}>Ces personnalités iconiques</h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '40px', width: '100%', maxWidth: '320px' }}>
            {celebritySlides.map((celeb, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{celeb.image}</div>
                <p style={{ color: 'white', fontSize: '11px', fontWeight: '600', lineHeight: 1.3 }}>{celeb.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '4px' }}>{celeb.style}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('swipe')}
            style={{ background: 'white', color: '#0A2540', padding: '16px 48px', borderRadius: '100px', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Découvrir mes montures →
          </button>
        </div>
      )
    }

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Des personnalités comme toi portent
        </p>
        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '800', textAlign: 'center', marginBottom: '40px' }}>
          Des montures {celebritySlides[currentSlide].style}
        </h1>

        {/* Card célébrité */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', textAlign: 'center', width: '280px', marginBottom: '40px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.5s ease' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>{celebritySlides[currentSlide].image}</div>
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>{celebritySlides[currentSlide].name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{celebritySlides[currentSlide].description}</p>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
          {celebritySlides.map((_, i) => (
            <div key={i} style={{ width: i === currentSlide ? '24px' : '8px', height: '8px', borderRadius: '100px', background: i === currentSlide ? 'white' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>
    )
  }

  // ─── ÉTAPE 3 — Continue / résultats ─────────────────────────────────────────
  if (step === 'continue') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Round {round} terminé !</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px' }}>
          {likes.length} montures aimées · {dislikes.length} ignorées
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '40px' }}>
          Plus tu continues, plus les recommandations s'affinent
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
          {remainingFrames >= 5 ? (
            <button
              onClick={() => { setRound(prev => prev + 1); setStep('swipe') }}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', fontWeight: '600', cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}
            >
              Continuer (+5 montures) 🔄
            </button>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '16px' }}>
              Tu as exploré toutes les montures disponibles ✓
            </p>
          )}
          <button
            onClick={() => router.push(resultsUrl)}
            style={{ background: 'white', color: '#0A2540', padding: '16px', borderRadius: '16px', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit' }}
          >
            Voir mes résultats →
          </button>
        </div>
      </div>
    )
  }

  // ─── ÉTAPE 2 — Swipe ────────────────────────────────────────────────────────
  if (!currentFrame) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F6F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Chargement des montures…</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '4px' }}>
        Round {round} · {(swipeIndex % 5) + 1}/5
      </p>
      <h2 style={{ color: '#0A2540', fontSize: '22px', fontWeight: '700', marginBottom: '32px' }}>
        Cette monture te parle ?
      </h2>

      {/* Card swipeable */}
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          width: '300px',
          boxShadow: '0 8px 32px rgba(10,37,64,0.12)',
          transform: `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
          cursor: 'grab',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseDown={(e) => { setIsDragging(true); dragStartX.current = e.clientX }}
        onMouseMove={(e) => { if (isDragging) setDragX(e.clientX - dragStartX.current) }}
        onMouseUp={() => {
          setIsDragging(false)
          if (dragX > 80) triggerSwipe('like')
          else if (dragX < -80) triggerSwipe('dislike')
          else setDragX(0)
        }}
        onMouseLeave={() => {
          if (isDragging) {
            setIsDragging(false)
            if (dragX > 80) triggerSwipe('like')
            else if (dragX < -80) triggerSwipe('dislike')
            else setDragX(0)
          }
        }}
        onTouchStart={(e) => { dragStartX.current = e.touches[0].clientX }}
        onTouchMove={(e) => { setDragX(e.touches[0].clientX - dragStartX.current) }}
        onTouchEnd={() => {
          if (dragX > 80) triggerSwipe('like')
          else if (dragX < -80) triggerSwipe('dislike')
          else setDragX(0)
        }}
      >
        {dragX > 30 && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#10B981', color: 'white', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '18px', opacity: Math.min(dragX / 80, 1) }}>
            LIKE 👍
          </div>
        )}
        {dragX < -30 && (
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#EF4444', color: 'white', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '18px', opacity: Math.min(-dragX / 80, 1) }}>
            NOPE 👎
          </div>
        )}

        {/* SVG lunettes */}
        <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', background: '#F4F6F9', borderRadius: '16px' }}>
          <svg width="80" height="48" viewBox="0 0 80 48">
            <rect x="2" y="8" width="30" height="22" rx="6" fill="none" stroke="#0A2540" strokeWidth="3" />
            <rect x="48" y="8" width="30" height="22" rx="6" fill="none" stroke="#0A2540" strokeWidth="3" />
            <line x1="32" y1="19" x2="48" y2="19" stroke="#0A2540" strokeWidth="3" />
            <line x1="2" y1="19" x2="0" y2="19" stroke="#0A2540" strokeWidth="3" />
            <line x1="78" y1="19" x2="80" y2="19" stroke="#0A2540" strokeWidth="3" />
          </svg>
        </div>

        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>{currentFrame.brand}</p>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0A2540', marginBottom: '8px' }}>{currentFrame.model}</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
          {currentFrame.material} · {currentFrame.weight_grams}g · {currentFrame.price_range}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {currentFrame.style_tags.slice(0, 3).map((tag: string) => (
            <span key={tag} style={{ fontSize: '11px', border: '1px solid #1E3A8A', color: '#1E3A8A', padding: '2px 8px', borderRadius: '100px' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Boutons */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '32px' }}>
        <button
          onClick={() => triggerSwipe('dislike')}
          style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', border: '2px solid #EF4444', color: '#EF4444', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'inherit' }}
        >
          👎
        </button>
        <button
          onClick={() => triggerSwipe('like')}
          style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', border: '2px solid #10B981', color: '#10B981', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'inherit' }}
        >
          👍
        </button>
      </div>

      <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '16px' }}>Glisse ou utilise les boutons</p>

      <button
        onClick={() => router.push(resultsUrl)}
        style={{ marginTop: '24px', color: '#94A3B8', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
      >
        Passer → voir mes résultats
      </button>
    </div>
  )
}
