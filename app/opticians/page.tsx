'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/components/AuthProvider'

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

const FILTERS = ['All', 'Rectangular', 'Aviator', 'Round', 'Cat-eye']

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

function LeafletMapInner({ opticians }: { opticians: Optician[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

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
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const framesParam = params.get('frames')
  const scanFrames = framesParam ? framesParam.split(',') : []

  const filteredOpticians = scanFrames.length > 0
    ? OPTICIANS.filter((opt) => opt.frames.some((f) => scanFrames.some((sf) => sf.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(sf.toLowerCase()))))
    : activeFilter === 'All'
      ? OPTICIANS
      : OPTICIANS.filter((opt) => opt.frames.includes(activeFilter))

  const selected = filteredOpticians.find((o) => o.id === selectedId) ?? null

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-white z-10 relative">
        <span className="text-xl font-bold text-primary">Oculis</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/scan')}
            className="bg-secondary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary-alt transition-colors"
          >
            📷 Scan
          </button>
          {session ? (
            <button
              onClick={() => router.push('/profile')}
              className="border border-border text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface transition-colors"
            >
              Mon profil
            </button>
          ) : (
            <button
              onClick={() => router.push('/opticians-signup')}
              className="border border-secondary text-secondary px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary-lighter transition-colors"
            >
              Vous êtes opticien ?
            </button>
          )}
        </div>
      </header>

      {/* Scan filter banner */}
      {framesParam && (
        <div className="flex items-center justify-between px-5 py-2 bg-secondary-lighter border-b border-secondary-light text-xs text-secondary">
          <span>Résultats filtrés pour ton scan · <span className="font-semibold">{framesParam}</span></span>
          <button
            onClick={() => router.push('/opticians')}
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
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeFilter === f
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
                onClick={() => setSelectedId(opt.id === selectedId ? null : opt.id)}
                className={`rounded-card border p-4 cursor-pointer transition-all ${
                  selectedId === opt.id
                    ? 'border-secondary bg-secondary-lighter/40 shadow-card'
                    : 'border-border bg-white hover:border-muted hover:shadow-card'
                }`}
              >
                {/* Name + badges */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="font-bold text-primary text-sm leading-tight">{opt.name}</p>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
                      opt.match === 'perfect'
                        ? 'bg-secondary-light text-secondary'
                        : 'bg-accent-light text-accent-dark'
                    }`}>
                      {opt.match === 'perfect' ? 'Perfect match' : 'Partial match'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
                      opt.inStock ? 'bg-success-light text-success-dark' : 'bg-surface text-muted'
                    }`}>
                      {opt.inStock ? '✓ In stock' : 'Call to check'}
                    </span>
                  </div>
                </div>

                {/* Address */}
                <p className="text-xs text-muted mb-2">{opt.address}</p>

                {/* Rating + open status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Stars rating={opt.rating} />
                    <span className="text-xs text-muted">{opt.rating} ({opt.reviews})</span>
                  </div>
                  <span className={`text-[10px] font-medium ${opt.open ? 'text-success' : 'text-accent'}`}>
                    {opt.open ? `Open · until ${opt.openUntil}` : `Closed · opens 9:00`}
                  </span>
                </div>

                {/* View store button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedId(opt.id) }}
                  className="mt-3 w-full text-center text-xs font-semibold text-secondary hover:underline"
                >
                  View store →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — map or detail */}
        <div className="flex-1 relative">

          {/* Leaflet map */}
          {!selected && (
            <div className="absolute inset-0">
              <LeafletMap opticians={OPTICIANS} />
            </div>
          )}

          {/* Detail panel */}
          {selected && (
            <div className="h-full overflow-y-auto p-8">
              <button
                onClick={() => setSelectedId(null)}
                className="text-sm text-muted hover:text-subtle mb-6 flex items-center gap-1"
              >
                ← Retour à la carte
              </button>

              <div className="max-w-md space-y-6">
                {/* Name + badges */}
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2">{selected.name}</h2>
                  <p className="text-muted text-sm mb-3">{selected.address} · {selected.distance}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-pill ${
                      selected.match === 'perfect' ? 'bg-secondary-light text-secondary' : 'bg-accent-light text-accent-dark'
                    }`}>
                      {selected.match === 'perfect' ? '✓ Perfect match' : '~ Partial match'}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-pill ${
                      selected.inStock ? 'bg-success-light text-success-dark' : 'bg-surface text-muted'
                    }`}>
                      {selected.inStock ? '✓ In stock' : 'Call to check stock'}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-pill ${
                      selected.open ? 'bg-success-light text-success-dark' : 'bg-accent-light text-accent-dark'
                    }`}>
                      {selected.open ? `Open until ${selected.openUntil}` : 'Closed'}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Stars rating={selected.rating} />
                  <span className="text-sm font-semibold text-primary">{selected.rating}</span>
                  <span className="text-sm text-muted">({selected.reviews} reviews)</span>
                </div>

                {/* Frame styles */}
                <div>
                  <p className="text-sm font-semibold text-primary mb-3">Available frame styles</p>
                  <div className="flex gap-3">
                    {selected.frames.map((frame) => (
                      <div key={frame} className="flex flex-col items-center gap-1.5 bg-white border border-border rounded-xl px-4 py-3">
                        <div className="w-10 h-5 bg-surface rounded" />
                        <span className="text-xs text-muted">{frame}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phone */}
                <p className="text-sm text-muted">{selected.phone}</p>

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                  <button className="w-full bg-secondary text-white py-3 rounded-xl font-semibold text-sm hover:bg-secondary-alt transition-colors">
                    Reserve a fitting
                  </button>
                  <button className="w-full border border-border text-primary py-3 rounded-xl font-semibold text-sm hover:bg-surface transition-colors">
                    Get directions →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
