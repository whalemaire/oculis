'use client'

export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, useMemo } from 'react'
import noSSR from 'next/dynamic'
import { useAuth } from '@/app/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getRecommendations } from '@/lib/recommendationEngine'
import { FiglaLogo } from '@/app/components/FiglaLogo'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const OPTICIANS = [
  {
    id: 1, name: 'Optique Lumière', address: '12 rue de Rivoli, Paris 1er',
    distance: 0.4, lat: 48.8566, lng: 2.3522,
    rating: 4.8, reviews: 124, openUntil: '19:00', isOpen: true,
    isPartner: true,
    frames: ['Wayfarer', 'Aviateur', 'Rectangulaire', 'Browline', 'Rond', 'Rectangulaire fin']
  },
  {
    id: 2, name: 'Vision Plus Opticiens', address: '45 avenue Montaigne, Paris 8e',
    distance: 1.1, lat: 48.8661, lng: 2.3044,
    rating: 4.5, reviews: 89, openUntil: '20:00', isOpen: true,
    isPartner: true,
    frames: ['Cat-eye', 'Oversized', 'Géométrique', 'Aviateur', 'Rimless', 'Rectangulaire fin']
  },
  {
    id: 3, name: 'Atelier du Regard', address: '8 rue des Martyrs, Paris 9e',
    distance: 1.9, lat: 48.8796, lng: 2.3380,
    rating: 4.2, reviews: 56, openUntil: '18:30', isOpen: false,
    isPartner: false,
    frames: ['Rond', 'Ovale fin', 'Rond fin', 'Cat-eye', 'Wayfarer']
  },
  {
    id: 4, name: 'Maison Lartigue', address: '14 rue de Bretagne, Paris 3e',
    distance: 2.1, lat: 48.8627, lng: 2.3599,
    rating: 4.9, reviews: 312, openUntil: '19:30', isOpen: true,
    isPartner: true,
    frames: ['Rectangulaire', 'Aviateur', 'Browline', 'Clubmaster', 'Wayfarer', 'Géométrique']
  },
  {
    id: 5, name: 'Verre & Lumière', address: '22 rue Saint-Gilles, Paris 3e',
    distance: 2.3, lat: 48.8579, lng: 2.3606,
    rating: 4.6, reviews: 178, openUntil: '19:00', isOpen: true,
    isPartner: false,
    frames: ['Rimless', 'Rectangulaire fin', 'Ovale fin', 'Rond fin', 'Géométrique']
  },
  {
    id: 6, name: 'Optic Saint-Germain', address: '34 rue de Rennes, Paris 6e',
    distance: 2.8, lat: 48.8503, lng: 2.3286,
    rating: 4.7, reviews: 203, openUntil: '20:00', isOpen: true,
    isPartner: true,
    frames: ['Cat-eye', 'Rond', 'Oversized', 'Aviateur', 'Rectangulaire', 'Browline']
  },
  {
    id: 7, name: 'Les Lunettes du Marais', address: '5 rue des Francs-Bourgeois, Paris 4e',
    distance: 3.1, lat: 48.8570, lng: 2.3555,
    rating: 4.4, reviews: 91, openUntil: '19:00', isOpen: true,
    isPartner: false,
    frames: ['Wayfarer', 'Clubmaster', 'Browline', 'Rectangulaire', 'Rond']
  },
  {
    id: 8, name: 'Optique Bastille', address: '18 boulevard Beaumarchais, Paris 11e',
    distance: 3.5, lat: 48.8553, lng: 2.3671,
    rating: 4.3, reviews: 67, openUntil: '19:30', isOpen: true,
    isPartner: false,
    frames: ['Rectangulaire', 'Aviateur', 'Cat-eye', 'Wayfarer', 'Géométrique', 'Oversized']
  },
  {
    id: 9, name: 'Grand Optic Haussman', address: '64 boulevard Haussmann, Paris 9e',
    distance: 1.4, lat: 48.8743, lng: 2.3295,
    rating: 4.6, reviews: 445, openUntil: '20:30', isOpen: true,
    isPartner: true,
    frames: ['Rectangulaire', 'Rond', 'Aviateur', 'Cat-eye', 'Wayfarer', 'Browline', 'Rimless', 'Oversized', 'Géométrique', 'Clubmaster']
  },
  {
    id: 10, name: 'Optic 2000 République', address: '2 place de la République, Paris 11e',
    distance: 2.6, lat: 48.8674, lng: 2.3632,
    rating: 4.1, reviews: 234, openUntil: '19:00', isOpen: true,
    isPartner: false,
    frames: ['Rectangulaire', 'Rond', 'Aviateur', 'Wayfarer', 'Cat-eye', 'Browline']
  },
]

const FRAME_FILTERS = [
  'All', 'Rectangulaire', 'Rectangulaire fin', 'Aviateur', 'Rond',
  'Rond fin', 'Ovale fin', 'Cat-eye', 'Wayfarer', 'Géométrique',
  'Rimless', 'Browline', 'Clubmaster', 'Oversized', 'Wrap'
]

type Optician = (typeof OPTICIANS)[number]

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-accent' : 'text-border'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function MapboxMapInner({ opticians, onMarkerClick, onMapReady, onLocate }: {
  opticians: Optician[]
  onMarkerClick?: (id: number) => void
  onMapReady?: (map: mapboxgl.Map) => void
  onLocate?: () => void
}) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const onMarkerClickRef = useRef(onMarkerClick)

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
  }, [onMarkerClick])

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [2.3522, 48.8566],
      zoom: 12,
    })

    opticians.forEach((opt) => {
      const marker = new mapboxgl.Marker({ color: '#102A72' })
        .setLngLat([opt.lng, opt.lat])
        .addTo(map.current!)

      marker.getElement().addEventListener('click', () => {
        onMarkerClickRef.current?.(opt.id)
      })
    })

    onMapReady?.(map.current)

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {onLocate && (
        <button
          onClick={onLocate}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10,
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: '500',
            color: '#0A2540',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap'
          }}
        >
          📍 Me localiser
        </button>
      )}
    </div>
  )
}

const LeafletMap = noSSR(
  () => Promise.resolve({ default: MapboxMapInner }),
  { ssr: false }
)

export default function OpticiansPage() {
  const router = useRouter()
  const params = useSearchParams()
  const contextIdFromUrl = params.get('contextId')
  const framesFromUrl = params.get('frames')
  const { session } = useAuth()
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [contexts, setContexts] = useState<any[]>([])
  const [activeContext, setActiveContext] = useState<any>(null)
  const [showContextDropdown, setShowContextDropdown] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const contextAppliedRef = useRef(false)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapRefMobile = useRef<mapboxgl.Map | null>(null)

  const requestLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords
        setUserLocation([longitude, latitude])
        ;[mapRef.current, mapRefMobile.current].forEach(m => {
          if (!m) return
          m.flyTo({ center: [longitude, latitude], zoom: 13, duration: 1500 })
          new mapboxgl.Marker({ color: '#3B82F6', scale: 0.8 })
            .setLngLat([longitude, latitude])
            .addTo(m)
        })
      },
      (error) => { console.log('Erreur:', error.message) },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
    )
  }

  console.log('contexts:', contexts)
  console.log('activeContext:', activeContext)
  console.log('session:', session?.user?.id)

  const USAGE_EMOJI: Record<string, string> = {
    'Quotidien': '👓',
    'Écrans': '💻',
    'Sport': '🏃',
    'Fashion': '☀️',
  }

  useEffect(() => {
    if (!session?.user?.id) return
    supabase
      .from('feedback')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setFeedbackList(data) })
  }, [session])

  useEffect(() => {
    if (!session?.user?.id) return
    const loadContexts = async () => {
      await fetch(`/api/contexts?user_id=${session.user.id}`)
      const { data } = await supabase
        .from('context')
        .select('*')
        .eq('user_id', session.user.id)
      if (data) {
        const sorted = [...data].sort((a, b) => {
          if (a.name === 'Mon profil de base') return -1
          if (b.name === 'Mon profil de base') return 1
          return 0
        })
        setContexts(sorted)
        if (!contextIdFromUrl) {
          setActiveContext(null)
          setShowBanner(false)
          setActiveFilters([])
        }
      }
    }
    loadContexts()
  }, [session])

  useEffect(() => {
    if (!framesFromUrl) return
    const englishToFrench: Record<string, string> = {
      'Round': 'Rond', 'Oval': 'Ovale fin', 'Rectangular': 'Rectangulaire',
      'Aviator': 'Aviateur', 'Geometric': 'Géométrique', 'Wayfarer': 'Wayfarer',
      'Cat-eye': 'Cat-eye', 'Oversized': 'Oversized', 'Rimless': 'Rimless',
      'Browline': 'Browline', 'Clubmaster': 'Clubmaster', 'Wrap': 'Wrap',
    }
    const frameList = framesFromUrl.split(',')
      .map(f => decodeURIComponent(f.trim()))
      .map(f => englishToFrench[f] || f)
      .filter((v, i, a) => a.indexOf(v) === i)
      .filter(f => FRAME_FILTERS.includes(f))
    setActiveFilters(frameList)
    setShowFilters(true)
  }, [framesFromUrl])

  useEffect(() => {
    contextAppliedRef.current = false
  }, [contextIdFromUrl])

  useEffect(() => {
    if (!contextIdFromUrl || contexts.length === 0 || !session?.user?.id) return
    if (contextAppliedRef.current) return

    const ctx = contexts.find(c => c.id === contextIdFromUrl)
    if (!ctx) return

    contextAppliedRef.current = true
    console.log('Applying context from URL:', ctx.name)
    setActiveContext(ctx)
    setShowBanner(true)

    supabase
      .from('scan')
      .select('*')
      .eq('user_id', session.user.id)
      .limit(1)
      .then(({ data }) => {
        const scanData = data?.[0]
        if (scanData) {
          const scanWithProbs = {
            ...scanData,
            shape_probabilities: scanData.shape_probabilities
              ? JSON.parse(scanData.shape_probabilities)
              : undefined,
            top_shapes: scanData.top_shapes
              ? JSON.parse(scanData.top_shapes)
              : undefined,
          }
          const recs = getRecommendations(scanWithProbs, ctx, feedbackList, contextIdFromUrl || undefined)
          const frameNames = recs
            .map(r => r.name)
            .filter((v, i, a) => a.indexOf(v) === i)
          setActiveFilters(frameNames)
        }
      })
  }, [contextIdFromUrl, contexts, session?.user?.id])

  const switchContext = async (contextId: string) => {
    await supabase
      .from('context')
      .update({ is_active: false })
      .eq('user_id', session!.user.id)

    await supabase
      .from('context')
      .update({ is_active: true })
      .eq('id', contextId)

    const newActive = contexts.find((c) => c.id === contextId)
    setActiveContext(newActive)
    setShowContextDropdown(false)
    setShowBanner(true)

    const { data: scanArray } = await supabase
      .from('scan')
      .select('*')
      .eq('user_id', session!.user.id)
      .limit(1)

    const scanData = scanArray?.[0]

    if (scanData && newActive) {
      const scanWithProbs = {
        ...scanData,
        shape_probabilities: scanData.shape_probabilities
          ? JSON.parse(scanData.shape_probabilities)
          : undefined,
        top_shapes: scanData.top_shapes
          ? JSON.parse(scanData.top_shapes)
          : undefined,
      }
      const recs = getRecommendations(scanWithProbs, newActive, feedbackList, contextId || undefined)
      const frameNames = recs
        .map(r => r.name)
        .filter((v, i, a) => a.indexOf(v) === i)
      setActiveFilters(frameNames)
    }
  }

  const framesParam = params.get('frames')
  const scanFrames = framesParam ? framesParam.split(',') : []

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10
  }

  const opticiansSorted = useMemo(() => {
    if (!userLocation) return OPTICIANS

    return [...OPTICIANS]
      .map(opt => ({
        ...opt,
        distance: getDistance(
          userLocation[1], userLocation[0],
          opt.lat, opt.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance)
  }, [userLocation])

  const filteredOpticians = activeFilters.length === 0
    ? opticiansSorted
    : opticiansSorted.filter(opt =>
        activeFilters.some(filter => opt.frames.includes(filter))
      )

  const selected = opticiansSorted.find((o) => o.id === selectedId) ?? null
  const userType = (session ? 'user' : null) as 'user' | 'optician' | null

  console.log('selectedId:', selectedId, 'selected:', selected)

  const generateContextSummary = (ctx: any) => {
    const correction = ctx.correction === 'Vue' ? 'lunettes de vue'
      : ctx.correction === 'Soleil' ? 'lunettes de soleil'
      : ctx.correction === 'Les deux' ? 'lunettes de vue et soleil'
      : 'lunettes'

    const style = ctx.style?.toLowerCase() || ''
    const usage = ctx.usage?.toLowerCase() || ''
    const budget = ctx.budget || ''

    return `${correction} · style ${style} · usage ${usage} · ${budget}`
  }

  const handleOpticianClick = (id: number) => {
    if (!session) { setShowAuthModal(true); return }
    setSelectedId(prev => prev === id ? null : id)
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Header — desktop only */}
      <header className="hidden md:flex items-center justify-between px-6 py-3.5 border-b border-border bg-white z-10 relative">
        <FiglaLogo size={26} />
        <div className="flex items-center gap-2">
          {userType === null && (
            <>
              <button
                onClick={() => router.push('/scan')}
                className="bg-secondary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary-alt transition-colors"
              >
                📷 Scan
              </button>
              <button
                onClick={() => router.push('/login')}
                className="border border-border text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/opticians-signup')}
                className="border border-secondary text-secondary px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary-lighter transition-colors"
              >
                Vous êtes opticien ?
              </button>
            </>
          )}
          {userType === 'user' && (
            <>
              {contexts.length === 0 ? (
                <button
                  onClick={() => router.push('/contexts/new')}
                  className="border border-secondary text-secondary px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary-lighter transition-colors"
                >
                  Créer mon profil →
                </button>
              ) : (
                <div className="relative" style={{ position: 'relative', zIndex: 99999 }}>
                  {/* Mobile — icône compacte */}
                  <button
                    onClick={() => setShowContextDropdown(!showContextDropdown)}
                    className="md:hidden bg-[#102A72] text-white p-2 rounded-full text-sm"
                  >
                    {USAGE_EMOJI[activeContext?.usage] ?? '🎯'}
                  </button>
                  {/* Desktop — bouton complet */}
                  <button
                    onClick={() => setShowContextDropdown(!showContextDropdown)}
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-secondary-lighter border border-secondary-light text-secondary rounded-xl text-sm font-semibold hover:bg-secondary-light transition-colors"
                  >
                    <span>{USAGE_EMOJI[activeContext?.usage] ?? '🎯'}</span>
                    <span>{activeContext?.name ?? 'Contexte'}</span>
                    <span className="text-xs opacity-70">▾</span>
                  </button>

                  {showContextDropdown && (
                    <>
                      <div
                        className="fixed inset-0"
                        style={{ zIndex: 99998 }}
                        onClick={() => setShowContextDropdown(false)}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          width: '260px',
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          boxShadow: '0 4px 24px rgba(10,37,64,0.15)',
                          border: '1px solid #E2E8F0',
                          zIndex: 99999,
                          overflow: 'hidden'
                        }}
                      >
                        {contexts.map((ctx) => (
                          <button
                            key={ctx.id}
                            onClick={() => switchContext(ctx.id)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', fontSize: '14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <span style={{ color: '#0A2540', fontWeight: '500' }}>{ctx.name}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {ctx.name === 'Mon profil de base' && <span style={{ fontSize: '12px' }}>🔒</span>}
                              {activeContext?.id === ctx.id && <span style={{ color: '#102A72' }}>✓</span>}
                            </span>
                          </button>
                        ))}
                        <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '4px', paddingTop: '4px' }}>
                          <button
                            onClick={() => { setShowContextDropdown(false); router.push('/contexts/new') }}
                            style={{ width: '100%', padding: '10px 16px', fontSize: '14px', color: '#102A72', fontWeight: '500', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            + Nouveau contexte
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={() => router.push('/profile')}
                className="md:hidden border border-border text-primary p-2 rounded-full text-sm"
              >
                👤
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="hidden md:block border border-border text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface transition-colors"
              >
                Mon profil
              </button>
            </>
          )}
          {userType === 'optician' && (
            <button
              onClick={() => router.push('/optician-dashboard')}
              className="border border-border text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface transition-colors"
            >
              Mon espace
            </button>
          )}
        </div>
      </header>

      {/* Onboarding banner + Context banner — desktop only */}
      <div className="hidden md:block">
        {!session && (
          <div style={{
            background: 'linear-gradient(135deg, #0A2540 0%, #102A72 100%)',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', margin: 0 }}>
                👓 Trouve les lunettes faites pour toi
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '2px 0 0' }}>
                Scanne ton visage en 10 secondes
              </p>
            </div>
            <button
              onClick={() => router.push('/scan')}
              style={{
                background: 'white',
                color: '#0A2540',
                padding: '8px 20px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Commencer →
            </button>
          </div>
        )}

        {activeContext && showBanner && (
          <div className="flex items-center justify-between px-5 py-2 bg-secondary-lighter border-b border-secondary-light text-xs text-secondary">
            <span>🎯 {activeContext.name} — {generateContextSummary(activeContext)}</span>
            <button
              onClick={() => { setShowBanner(false); setActiveContext(null); setActiveFilters([]) }}
              className="ml-3 text-secondary/60 hover:text-secondary font-bold text-sm leading-none"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* MOBILE LAYOUT */}
      <div className="md:hidden flex flex-col" style={{ height: '100dvh' }}>

        {/* Header mobile */}
        <header className="flex items-center justify-between px-4 bg-white border-b border-gray-100 z-10" style={{ height: '56px', flexShrink: 0 }}>
          <FiglaLogo size={22} />
          <div className="flex gap-2">
            {session ? (
              <>
                <button
                  onClick={() => setShowContextDropdown(!showContextDropdown)}
                  className="bg-[#E6EEFF] text-[#102A72] px-3 py-1.5 rounded-full text-xs font-medium"
                >
                  🎯 {activeContext?.name || 'Contexte'}
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="bg-gray-100 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                >
                  👤
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/scan')}
                  className="bg-[#102A72] text-white px-3 py-1.5 rounded-full text-xs font-medium"
                >
                  📷 Scan
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="border border-[#102A72] text-[#102A72] px-3 py-1.5 rounded-full text-xs font-medium"
                >
                  Se connecter
                </button>
              </>
            )}
          </div>
          {showContextDropdown && (
            <>
              <div
                className="fixed inset-0"
                style={{ zIndex: 99998 }}
                onClick={() => setShowContextDropdown(false)}
              />
              <div
                style={{
                  position: 'fixed',
                  top: '61px',
                  left: '8px',
                  right: '8px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 4px 24px rgba(10,37,64,0.15)',
                  border: '1px solid #E2E8F0',
                  zIndex: 99999,
                  overflow: 'hidden'
                }}
              >
                {contexts.map((ctx) => (
                  <button
                    key={ctx.id}
                    onClick={() => switchContext(ctx.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', fontSize: '14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span style={{ color: '#0A2540', fontWeight: '500' }}>{ctx.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {ctx.name === 'Mon profil de base' && <span style={{ fontSize: '12px' }}>🔒</span>}
                      {activeContext?.id === ctx.id && <span style={{ color: '#102A72' }}>✓</span>}
                    </span>
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={() => { setShowContextDropdown(false); router.push('/contexts/new') }}
                    style={{ width: '100%', padding: '10px 16px', fontSize: '14px', color: '#102A72', fontWeight: '500', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    + Nouveau contexte
                  </button>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1, minHeight: 0 }}>
          <LeafletMap opticians={opticiansSorted} onMarkerClick={handleOpticianClick} onMapReady={(m) => { mapRefMobile.current = m }} onLocate={requestLocation} />
        </div>

        {/* Bottom sheet */}
        <div style={{ height: '260px', flexShrink: 0, background: 'white', borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', overflowY: 'auto' }}>
          {!userLocation && (
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-700 text-center">
              📍 Autorise la géolocalisation pour voir les opticiens près de toi
            </div>
          )}
          {/* Filter pills */}
          <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {FRAME_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => {
                  if (f === 'All') { setActiveFilters([]); return }
                  setActiveFilters(prev =>
                    prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
                  )
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all border ${
                  activeFilters.includes(f)
                    ? 'bg-[#102A72] text-white border-[#102A72]'
                    : f === 'All' && activeFilters.length === 0
                    ? 'bg-[#102A72] text-white border-[#102A72]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Optician cards */}
          <div className="px-4 pb-4 space-y-2">
            {filteredOpticians.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleOpticianClick(opt.id)}
                className={`rounded-xl border p-3 cursor-pointer transition-all ${
                  selectedId === opt.id
                    ? 'border-secondary bg-secondary-lighter/40 shadow-[inset_3px_0_0_0_#0A2540]'
                    : 'border-border bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-primary text-sm truncate">{opt.name}</p>
                  <span className="text-xs text-muted flex-shrink-0">{opt.distance}</span>
                </div>
                <p className="text-xs text-muted mt-0.5 truncate">{opt.address}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-medium ${opt.isOpen ? 'text-success' : 'text-red-400'}`}>
                    {opt.isOpen ? `Ouvert · jusqu'à ${opt.openUntil}` : 'Fermé'}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    activeFilters.length === 0 || opt.frames.some(f => activeFilters.includes(f))
                      ? 'bg-secondary-light text-secondary'
                      : 'bg-accent-light text-accent-dark'
                  }`}>
                    {activeFilters.length === 0 || opt.frames.some(f => activeFilters.includes(f)) ? 'Match' : 'Partiel'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail drawer mobile — overlays everything */}
        {selected && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 9999,
            overflowY: 'auto',
            padding: '24px'
          }}>
            <button
              onClick={() => setSelectedId(null)}
              className="mb-4 flex items-center gap-2 text-gray-500 text-sm"
            >
              ← Retour
            </button>
            <h2 className="text-2xl font-bold" style={{ color: '#0A2540', marginBottom: '4px' }}>
              {selected.name}
            </h2>
            <p className="text-sm" style={{ color: '#64748B', marginBottom: '16px' }}>
              {selected.address} · {selected.distance}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span className="text-xs font-medium" style={{ background: '#E6EEFF', color: '#102A72', padding: '4px 12px', borderRadius: '100px' }}>
                ✓ Perfect match
              </span>
              <span className="text-xs font-medium" style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: '100px' }}>
                ✓ In stock
              </span>
              <span className="text-xs font-medium" style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: '100px' }}>
                Ouvert jusqu'à {selected.openUntil}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ color: '#F59E0B' }}>★★★★★</span>
              <span style={{ fontWeight: '600', color: '#0A2540' }}>{selected.rating}</span>
              <span className="text-sm" style={{ color: '#64748B' }}>({selected.reviews} avis)</span>
            </div>
            <p className="text-xs font-medium" style={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Montures disponibles
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {selected.frames?.map((frame: string) => (
                <div key={frame} className="text-xs" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 16px', color: '#0A2540' }}>
                  {frame}
                </div>
              ))}
            </div>
            <button style={{ width: '100%', background: '#102A72', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '600', marginBottom: '8px', border: 'none', cursor: 'pointer' }}>
              Réserver un essayage
            </button>
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${selected.address}`, '_blank')}
              style={{ width: '100%', background: 'white', color: '#0A2540', padding: '14px', borderRadius: '12px', fontWeight: '600', border: '1px solid #E2E8F0', cursor: 'pointer' }}
            >
              Itinéraire →
            </button>
          </div>
        )}
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex" style={{ height: 'calc(100vh - 61px)', overflow: 'hidden' }}>

        {/* Left panel — scroll indépendant */}
        <div className="w-[40%] h-full overflow-y-auto border-r border-gray-100">
          {!userLocation && (
            <div className="bg-blue-50 border-b border-blue-100 px-5 py-2 text-xs text-blue-700 text-center">
              📍 Autorise la géolocalisation pour voir les opticiens près de toi
            </div>
          )}
          <div className="px-5 pt-5 pb-4 space-y-4">

            {/* Search */}
            <input
              type="text"
              placeholder="Search by district, name, or postal code..."
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-secondary transition-colors"
            />

            {/* Frame filters */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {activeFilters.length > 0
                    ? `${activeFilters.length} filtre(s) actif(s) : ${activeFilters.join(', ')}`
                    : 'Tous les opticiens'}
                </p>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#102A72] border border-[#102A72] px-3 py-1.5 rounded-full"
                >
                  🔧 Filtres {showFilters ? '▲' : '▼'}
                </button>
              </div>

              {showFilters && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {FRAME_FILTERS.map(f => (
                    <button
                      key={f}
                      onClick={() => {
                        if (f === 'All') { setActiveFilters([]); return }
                        setActiveFilters(prev =>
                          prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
                        )
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        activeFilters.includes(f)
                          ? 'bg-[#102A72] text-white border-[#102A72]'
                          : f === 'All' && activeFilters.length === 0
                          ? 'bg-[#102A72] text-white border-[#102A72]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#102A72]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Count */}
            <p className="text-xs text-muted font-medium">8 opticians · within 30 km</p>
          </div>

          {/* Optician cards */}
          <div className="px-5 pb-5 space-y-3">
            {filteredOpticians.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleOpticianClick(opt.id)}
                className={`rounded-card border p-4 cursor-pointer transition-all ${
                  selectedId === opt.id
                    ? 'border-secondary bg-secondary-lighter/40 shadow-[inset_3px_0_0_0_#0A2540]'
                    : 'border-border bg-white hover:-translate-y-px hover:shadow-panel'
                }`}
              >
                {/* Row 1 — dot + name + distance */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeFilters.length === 0 || opt.frames.some(f => activeFilters.includes(f)) ? 'bg-secondary' : 'bg-accent'}`} />
                  <p className="font-bold text-primary text-sm leading-tight flex-1 truncate">{opt.name}</p>
                  <span className="text-xs text-muted flex-shrink-0">{opt.distance}</span>
                </div>

                {/* Row 2 — address */}
                <p className="text-xs text-muted mb-2.5 pl-4 truncate">{opt.address}</p>

                {/* Row 3 — stars + reviews + match badge */}
                <div className="flex items-center gap-1.5 mb-2.5 pl-4">
                  <Stars rating={opt.rating} />
                  <span className="text-xs text-muted">{opt.rating} ({opt.reviews})</span>
                  <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-pill flex-shrink-0 ${
                    activeFilters.length === 0 || opt.frames.some(f => activeFilters.includes(f))
                      ? 'bg-secondary-light text-secondary'
                      : 'bg-accent-light text-accent-dark'
                  }`}>
                    {activeFilters.length === 0 || opt.frames.some(f => activeFilters.includes(f)) ? 'Perfect match' : 'Partial match'}
                  </span>
                </div>

                {/* Row 4 — open status + view store */}
                <div className="flex items-center justify-between pl-4">
                  <span className={`text-[10px] font-medium ${opt.isOpen ? 'text-success' : 'text-red-400'}`}>
                    {opt.isOpen ? `Open · until ${opt.openUntil}` : `Closed · opens 9:00`}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpticianClick(opt.id) }}
                    className="text-xs font-semibold text-secondary hover:underline flex-shrink-0"
                  >
                    View store →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — map fixe */}
        <div className="flex-1 h-full relative" style={{ zIndex: 1 }}>

          {/* Mapbox map */}
          <div style={{ height: '100%', width: '100%', position: 'relative', zIndex: 1 }}>
            <LeafletMap opticians={opticiansSorted} onMarkerClick={handleOpticianClick} onMapReady={(m) => { mapRef.current = m }} onLocate={requestLocation} />
          </div>

          {/* Detail drawer — overlays map */}
          {selected && (
            <div style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '380px',
              height: '100vh',
              backgroundColor: 'white',
              zIndex: 9999,
              overflowY: 'auto',
              boxShadow: '-4px 0 24px rgba(10,37,64,0.12)',
              padding: '24px'
            }}>
              <button
                onClick={() => setSelectedId(null)}
                className="mb-4 flex items-center gap-2 text-gray-500 text-sm"
              >
                ← Retour
              </button>
              <h2 className="text-2xl font-bold" style={{ color: '#0A2540', marginBottom: '4px' }}>
                {selected.name}
              </h2>
              <p className="text-sm" style={{ color: '#64748B', marginBottom: '16px' }}>
                {selected.address} · {selected.distance}
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="text-xs font-medium" style={{ background: '#E6EEFF', color: '#102A72', padding: '4px 12px', borderRadius: '100px' }}>
                  ✓ Perfect match
                </span>
                <span className="text-xs font-medium" style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: '100px' }}>
                  ✓ In stock
                </span>
                <span className="text-xs font-medium" style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: '100px' }}>
                  Open until {selected.openUntil}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ color: '#F59E0B' }}>★★★★★</span>
                <span style={{ fontWeight: '600', color: '#0A2540' }}>{selected.rating}</span>
                <span className="text-sm" style={{ color: '#64748B' }}>({selected.reviews} reviews)</span>
              </div>

              <p className="text-xs font-medium" style={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Available frame styles
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {selected.frames?.map((frame: string) => (
                  <div key={frame} className="text-xs" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 16px', color: '#0A2540' }}>
                    {frame}
                  </div>
                ))}
              </div>

              <button style={{ width: '100%', background: '#102A72', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '600', marginBottom: '8px', border: 'none', cursor: 'pointer' }}>
                Reserve a fitting
              </button>
              <button
                onClick={() => window.open(`https://maps.google.com/?q=${selected.address}`, '_blank')}
                style={{ width: '100%', background: 'white', color: '#0A2540', padding: '14px', borderRadius: '12px', fontWeight: '600', border: '1px solid #E2E8F0', cursor: 'pointer' }}
              >
                Get directions →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth modal — non-connected users */}
      {showAuthModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-subtle text-lg leading-none"
            >
              ×
            </button>
            <div className="text-center space-y-4">
              <span className="text-4xl">🔒</span>
              <h2 className="text-xl font-bold text-primary">Connecte-toi pour voir les opticiens</h2>
              <p className="text-sm text-muted">Crée un compte gratuit pour accéder aux opticiens près de toi</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-secondary text-white py-3 rounded-xl font-semibold text-sm hover:bg-secondary-alt transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full text-sm text-secondary hover:underline"
              >
                Créer un compte →
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
