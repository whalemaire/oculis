'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getRecommendations } from '@/lib/recommendationEngine'

const OPTICIANS = [
  {
    id: 1,
    name: 'Optique Lumière',
    address: '12 rue de Rivoli, Paris 1er',
    lat: 48.8603,
    lng: 2.3477,
    distance: '0.4 km',
    rating: 4.8,
    reviews: 124,
    match: 'perfect',
    inStock: true,
    open: true,
    openUntil: '19:00',
    frames: ['Rectangular', 'Aviator', 'Round'],
    phone: '+33 1 42 36 12 34',
  },
  {
    id: 2,
    name: 'Vision Plus Opticiens',
    address: '45 avenue Montaigne, Paris 8e',
    lat: 48.8661,
    lng: 2.3044,
    distance: '1.1 km',
    rating: 4.5,
    reviews: 89,
    match: 'partial',
    inStock: true,
    open: true,
    openUntil: '20:00',
    frames: ['Aviator', 'Cat-eye'],
    phone: '+33 1 47 23 56 78',
  },
  {
    id: 3,
    name: 'Atelier du Regard',
    address: '8 rue des Martyrs, Paris 9e',
    lat: 48.8798,
    lng: 2.3450,
    distance: '1.9 km',
    rating: 4.2,
    reviews: 56,
    match: 'partial',
    inStock: false,
    open: false,
    openUntil: '18:30',
    frames: ['Round', 'Rectangular'],
    phone: '+33 1 53 16 89 00',
  },
]

const FRAME_FILTERS = ['All', 'Rectangular', 'Aviator', 'Round', 'Cat-eye', 'Wayfarer', 'Browline', 'Geometric', 'Rimless', 'Oversized', 'Clubmaster']

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

function LeafletMapInner({ opticians, onMarkerClick }: { opticians: Optician[], onMarkerClick?: (id: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const onMarkerClickRef = useRef(onMarkerClick)

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
  }, [onMarkerClick])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require('leaflet') as typeof import('leaflet')

    // Fix webpack-broken default icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    const map = L.map(containerRef.current).setView([48.8566, 2.3522], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    opticians.forEach((opt) => {
      L.marker([opt.lat, opt.lng])
        .addTo(map)
        .bindPopup(`<b>${opt.name}</b><br/>${opt.address}`)
        .on('click', () => onMarkerClickRef.current?.(opt.id))
    })

    mapRef.current = map

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      document.head.removeChild(link)
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}

const LeafletMap = dynamic(
  () => Promise.resolve({ default: LeafletMapInner }),
  { ssr: false }
)

export default function OpticiansPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { session } = useAuth()
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [contexts, setContexts] = useState<any[]>([])
  const [activeContext, setActiveContext] = useState<any>(null)
  const [showContextDropdown, setShowContextDropdown] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

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
      .from('context')
      .select('*')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        if (data) {
          setContexts(data)
          setActiveContext(null)
          setShowBanner(false)
          setActiveFilters([])
        }
      })
  }, [session])

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
      const frameTranslation: Record<string, string> = {
        'Rectangulaire': 'Rectangular',
        'Rectangulaire fin': 'Rectangular',
        'Aviateur': 'Aviator',
        'Rond': 'Round',
        'Rond fin': 'Round',
        'Cat-eye': 'Cat-eye',
        'Wayfarer': 'Wayfarer',
        'Géométrique': 'Geometric',
        'Rimless': 'Rimless',
        'Oversized': 'Oversized',
        'Browline': 'Browline',
        'Clubmaster': 'Clubmaster',
        'Ovale fin': 'Round',
        'Wrap': 'Aviator',
      }

      const recs = getRecommendations(scanData, newActive)
      console.log('recs from engine:', recs)
      console.log('noms avant traduction:', recs.map(r => r.name))
      const frameNames = recs
        .map(r => frameTranslation[r.name] || r.name)
        .filter((v, i, a) => a.indexOf(v) === i)
      console.log('frameNames after translation:', frameNames)
      setActiveFilters(frameNames)
    }
  }

  const framesParam = params.get('frames')
  const scanFrames = framesParam ? framesParam.split(',') : []

  const filteredOpticians = scanFrames.length > 0
    ? OPTICIANS.filter((opt) => opt.frames.some((f) => scanFrames.some((sf) => sf.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(sf.toLowerCase()))))
    : activeFilters.length === 0
      ? OPTICIANS
      : OPTICIANS.filter((opt) => opt.frames.some((f) => activeFilters.includes(f)))

  const selected = OPTICIANS.find((o) => o.id === selectedId) ?? null
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
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-white z-10 relative">
        <span className="text-xl font-bold text-primary">Oculis</span>
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
                <div className="relative">
                  <button
                    onClick={() => setShowContextDropdown(!showContextDropdown)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-secondary-lighter border border-secondary-light text-secondary rounded-xl text-sm font-semibold hover:bg-secondary-light transition-colors"
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
                          position: 'fixed',
                          top: '60px',
                          right: '16px',
                          width: '220px',
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
                            {activeContext?.id === ctx.id && <span style={{ color: '#1E3A8A' }}>✓</span>}
                          </button>
                        ))}
                        <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '4px', paddingTop: '4px' }}>
                          <button
                            onClick={() => { setShowContextDropdown(false); router.push('/contexts/new') }}
                            style={{ width: '100%', padding: '10px 16px', fontSize: '14px', color: '#1E3A8A', fontWeight: '500', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
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
                className="border border-border text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface transition-colors"
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

      {/* Onboarding banner — non connecté */}
      {!session && (
        <div style={{
          background: 'linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%)',
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

      {/* Context banner */}
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

      {/* Split layout */}
      <div className="flex flex-1 min-h-0">

        {/* Left panel */}
        <div className="w-2/5 flex flex-col border-r border-border overflow-y-auto">
          <div className="px-5 pt-5 pb-4 space-y-4">

            {/* Search */}
            <input
              type="text"
              placeholder="Search by district, name, or postal code..."
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-secondary transition-colors"
            />

            {/* Frame filters */}
            <div className="flex flex-wrap gap-2">
              {FRAME_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    if (f === 'All') { setActiveFilters([]); return }
                    setActiveFilters(prev =>
                      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
                    )
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    f === 'All'
                      ? activeFilters.length === 0
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-white text-muted border-border hover:border-muted'
                      : activeFilters.includes(f)
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-white text-muted border-border hover:border-muted'
                  }`}
                >
                  {f}
                </button>
              ))}
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
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.match === 'perfect' ? 'bg-secondary' : 'bg-accent'}`} />
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
                    opt.match === 'perfect'
                      ? 'bg-secondary-light text-secondary'
                      : 'bg-accent-light text-accent-dark'
                  }`}>
                    {opt.match === 'perfect' ? 'Perfect match' : 'Partial match'}
                  </span>
                </div>

                {/* Row 4 — open status + view store */}
                <div className="flex items-center justify-between pl-4">
                  <span className={`text-[10px] font-medium ${opt.open ? 'text-success' : 'text-red-400'}`}>
                    {opt.open ? `Open · until ${opt.openUntil}` : `Closed · opens 9:00`}
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

        {/* Right panel — map or detail */}
        <div className="flex-1 relative" style={{ position: 'relative', zIndex: 1 }}>

          {/* Leaflet map — always visible */}
          <div className="absolute inset-0">
            <LeafletMap opticians={OPTICIANS} onMarkerClick={handleOpticianClick} />
          </div>

          {/* Detail drawer — overlays map */}
          {selected && (
            <div style={{
              position: 'fixed',
              top: '61px',
              right: 0,
              width: '380px',
              height: 'calc(100vh - 61px)',
              backgroundColor: 'white',
              zIndex: 9999,
              overflowY: 'auto',
              boxShadow: '-4px 0 24px rgba(10,37,64,0.12)',
              padding: '24px'
            }}>
              <h2 className="text-2xl font-bold" style={{ color: '#0A2540', marginBottom: '4px' }}>
                {selected.name}
              </h2>
              <p className="text-sm" style={{ color: '#64748B', marginBottom: '16px' }}>
                {selected.address} · {selected.distance}
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="text-xs font-medium" style={{ background: '#EEF2FF', color: '#1E3A8A', padding: '4px 12px', borderRadius: '100px' }}>
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

              <p className="text-sm" style={{ color: '#0A2540', marginBottom: '24px' }}>{selected.phone}</p>

              <button style={{ width: '100%', background: '#1E3A8A', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '600', marginBottom: '8px', border: 'none', cursor: 'pointer' }}>
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
                onClick={() => router.push('/login')}
                className="w-full text-sm text-secondary hover:underline"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
