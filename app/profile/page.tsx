'use client'

export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/components/AuthProvider'

const USAGE_EMOJI: Record<string, string> = {
  'Quotidien': '👓',
  'Écrans':    '💻',
  'Sport':     '🏃',
  'Fashion':   '☀️',
}
const CTX_INDEX_BG = ['#E6EEFF', '#F3E8FF', '#FFF3E8', '#FFFBE8']

type Tab = 'profil' | 'contextes' | 'parametres'
const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profil',     label: 'Mon profil',    icon: '👤' },
  { id: 'contextes',  label: 'Mes contextes', icon: '🎯' },
  { id: 'parametres', label: 'Paramètres',    icon: '⚙️' },
]

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const updated = searchParams.get('updated')
  const { session } = useAuth()
  const [scanData, setScanData] = useState<any>(null)
  const [contexts, setContexts] = useState<any[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [progressScore, setProgressScore] = useState(0)
  const [progressSteps, setProgressSteps] = useState({ scan: false, account: false, context: false })
  const [showToast, setShowToast] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('profil')
  const [editingAge, setEditingAge] = useState(false)
  const [customAge, setCustomAge] = useState<number | null>(null)

  const fetchScan = async () => {
    if (!session?.user?.id) return
    const { data } = await supabase
      .from('scan')
      .select('*')
      .eq('user_id', session.user.id)
      .order('id', { ascending: false })
      .limit(1)
    if (data?.[0]) setScanData(data[0])
  }

  useEffect(() => {
    if (updated === 'true') {
      fetchScan()
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }, [updated, session])

  useEffect(() => {
    fetchScan()
    if (!session?.user?.id) return
    const fetchContexts = async () => {
      const { data } = await supabase
        .from('context')
        .select('*')
        .eq('user_id', session.user.id)
        .order('id', { ascending: false })
      if (data) {
        const sorted = [...data].sort((a, b) => {
          if (a.name === 'Mon profil de base') return -1
          if (b.name === 'Mon profil de base') return 1
          return 0
        })
        setContexts(sorted)
      }
    }
    fetchContexts()
  }, [session])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/opticians')
  }

  const handleSetPassword = async () => {
    if (newPassword !== confirmPassword) { setPasswordMsg('Les mots de passe ne correspondent pas'); return }
    if (newPassword.length < 8) { setPasswordMsg('Minimum 8 caractères'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPasswordMsg('Erreur : ' + error.message)
    else {
      setPasswordMsg('Mot de passe défini ✓')
      setShowPasswordForm(false)
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const deleteContext = async (id: string) => {
    await supabase.from('context').delete().eq('id', id)
    setContexts((prev) => prev.filter((c) => c.id !== id))
    setShowDeleteModal(null)
  }

  useEffect(() => {
    if (!session?.user?.id) return
    const hasScan = !!scanData
    const hasAccount = !!session?.user?.id
    const hasContext = contexts.filter(c => c.name !== 'Mon profil de base').length > 0
    let score = 0
    if (hasScan) score += 30
    if (hasAccount) score += 20
    if (hasContext) score += 50
    setProgressScore(score)
    setProgressSteps({ scan: hasScan, account: hasAccount, context: hasContext })
  }, [session, scanData, contexts])

  const goToResults = (ctx: any) => {
    router.push(`/results?from=profile&contextId=${ctx.id}&shape=${scanData?.face_shape || 'oval'}&confidence=${scanData?.confidence || 85}&ipd=${scanData?.ipd || 64}&ratio=${scanData?.ratio || 0.8}&gender=${scanData?.gender || 'Male'}`)
  }

  return (
    <main className="min-h-screen bg-[#F4F6F9]">
      {showToast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: 'white', padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          ✓ Scan mis à jour avec succès
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100">
        <span className="text-lg font-bold text-[#0A2540]">Mon profil</span>
        <button onClick={() => router.push('/opticians')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
          ← Retour à la map
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', minHeight: '100vh' }}>

          {/* ── Left nav — desktop only ── */}
          <div className="hidden md:block" style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '24px' }}>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              {/* Avatar + user info */}
              <div className="text-center p-5 border-b border-gray-50">
                <div className="w-16 h-16 bg-[#0A2540] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <p className="font-bold text-[#0A2540] text-base leading-tight">
                  {session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate px-2">{session?.user?.email}</p>
                {scanData && (
                  <span className="text-xs text-[#102A72] bg-[#E6EEFF] px-2 py-1 rounded-full mt-2 inline-block">
                    1 scan biométrique
                  </span>
                )}
              </div>

              {/* Nav items */}
              <nav>
                {NAV_ITEMS.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors text-left ${
                      activeTab === item.id ? 'bg-[#F1F5FF] text-[#102A72]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0A2540]'
                    } ${i < NAV_ITEMS.length - 1 ? 'border-b border-gray-50' : ''}`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="space-y-4" style={{ flex: 1, minWidth: 0 }}>

            {/* Mobile tab bar */}
            <div className="md:hidden flex bg-white rounded-xl border border-gray-100 p-1 gap-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === item.id ? 'bg-[#102A72] text-white' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* ══ TAB: Mon profil ══ */}
            {activeTab === 'profil' && (
              <>
                {/* Progression */}
                {session && progressScore < 100 && (
                  <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-lg font-bold text-[#0A2540]">Ta progression</p>
                      <span className="text-sm font-bold text-[#102A72]">{progressScore}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                      <div className="bg-[#102A72] h-2 rounded-full transition-all duration-500" style={{ width: `${progressScore}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { done: progressSteps.account, icon: '👤', label: 'Compte',   points: '+20%' },
                        { done: progressSteps.scan,    icon: '📷', label: 'Scan',     points: '+30%' },
                        { done: progressSteps.context, icon: '🎯', label: 'Contexte', points: '+50%' },
                      ].map(step => (
                        <div key={step.label} className={`rounded-xl p-4 text-center ${step.done ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <div className={`text-2xl mb-1 font-bold ${step.done ? 'text-green-500' : 'text-gray-400'}`}>
                            {step.done ? '✓' : step.icon}
                          </div>
                          <p className="text-xs font-semibold text-[#0A2540]">{step.label}</p>
                          <p className="text-xs text-gray-400">{step.points}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { if (!progressSteps.scan) router.push('/scan'); else if (!progressSteps.context) router.push('/contexts/new') }}
                      className="mt-4 w-full bg-[#102A72] text-white py-2.5 rounded-xl text-sm font-semibold"
                    >
                      {!progressSteps.scan ? '📷 Faire mon scan facial' : '🎯 Créer mon premier contexte'}
                    </button>
                  </div>
                )}

                {/* Mensurations */}
                {!scanData ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-[#0A2540]">Mes mensurations faciales</h2>
                    </div>
                    <div className="flex flex-col items-center py-8 gap-3">
                      <span className="text-4xl opacity-30">📷</span>
                      <p className="text-sm text-gray-400">Aucun scan pour l'instant</p>
                      <button onClick={() => router.push('/scan')} className="mt-1 bg-[#102A72] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                        📷 Faire mon premier scan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold text-[#0A2540]">Mes mensurations faciales</h2>
                      <span className="text-xs bg-[#EEF2FF] text-[#1E3A8A] px-3 py-1 rounded-full font-medium">1 scan biométrique</span>
                    </div>

                    {/* Forme + probabilités */}
                    <div className="mb-5">
                      <div className="flex items-center gap-3 mb-3">
                        <svg width="40" height="24" viewBox="0 0 40 24">
                          <rect x="1" y="1" width="16" height="14" rx="3" fill="none" stroke="#0A2540" strokeWidth="2"/>
                          <rect x="23" y="1" width="16" height="14" rx="3" fill="none" stroke="#0A2540" strokeWidth="2"/>
                          <line x1="17" y1="8" x2="23" y2="8" stroke="#0A2540" strokeWidth="2"/>
                        </svg>
                        <span className="bg-[#0A2540] text-white px-4 py-1.5 rounded-full font-bold text-sm capitalize">
                          {scanData.face_shape}
                        </span>
                      </div>

                      {scanData.shape_probabilities && (() => {
                        const probs = typeof scanData.shape_probabilities === 'string'
                          ? JSON.parse(scanData.shape_probabilities)
                          : scanData.shape_probabilities
                        return (
                          <div className="space-y-2">
                            {Object.entries(probs)
                              .filter(([, v]) => (v as number) > 0)
                              .sort(([, a], [, b]) => (b as number) - (a as number))
                              .map(([shape, prob]) => (
                                <div key={shape} className="flex items-center gap-3">
                                  <span className="text-xs text-gray-400 w-16 capitalize">{shape}</span>
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                                    <div
                                      className="h-1.5 bg-[#1E3A8A] rounded-full transition-all"
                                      style={{ width: `${prob}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-[#0A2540] w-8 text-right">{prob as number}%</span>
                                </div>
                              ))}
                          </div>
                        )
                      })()}
                    </div>

                    {/* Grid de mesures */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      <div className="bg-[#F4F6F9] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">PD</p>
                        <p className="text-base font-bold text-[#0A2540]">{scanData.ipd}mm</p>
                      </div>
                      <div className="bg-[#F4F6F9] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Ratio</p>
                        <p className="text-base font-bold text-[#0A2540]">{scanData.ratio}</p>
                      </div>
                      <div className="bg-[#F4F6F9] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Largeur</p>
                        <p className="text-base font-bold text-[#0A2540]">{scanData.face_width}px</p>
                      </div>
                      <div className="bg-[#F4F6F9] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Confiance</p>
                        <p className="text-base font-bold text-[#0A2540]">{scanData.confidence}%</p>
                      </div>
                    </div>

                    {/* Prédictions IA */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="bg-[#F4F6F9] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Genre</p>
                        <p className="text-sm font-bold text-[#0A2540]">{scanData.gender === 'Male' ? '👨 Homme' : '👩 Femme'}</p>
                      </div>
                      <div className="bg-[#F4F6F9] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Âge estimé</p>
                        {editingAge ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              defaultValue={customAge || scanData.age}
                              className="w-12 text-center text-sm font-bold text-[#0A2540] bg-white border border-[#1E3A8A] rounded-lg p-0.5"
                              onBlur={async (e) => {
                                const newAge = parseInt(e.target.value)
                                setCustomAge(newAge)
                                setEditingAge(false)
                                await supabase.from('scan').update({ age: newAge }).eq('user_id', session?.user?.id)
                              }}
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <p className="text-sm font-bold text-[#0A2540]">~{customAge || scanData.age} ans</p>
                            <button onClick={() => setEditingAge(true)} className="text-gray-300 hover:text-gray-400 text-xs">✏️</button>
                          </div>
                        )}
                      </div>
                      <div className="bg-[#F4F6F9] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Symétrie</p>
                        <p className="text-sm font-bold text-[#0A2540]">{scanData.ratio_symmetry ? `${Math.round(scanData.ratio_symmetry * 100)}%` : '—'}</p>
                      </div>
                    </div>

                    {/* Dimensions détaillées */}
                    <div className="border-t border-gray-50 pt-4 mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Dimensions faciales</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Front', value: scanData.forehead_width },
                          { label: 'Mâchoire', value: scanData.jaw_width },
                          { label: 'Pommettes', value: scanData.cheek_width },
                          { label: 'Nez', value: scanData.nose_width },
                        ].map(({ label, value }) => value ? (
                          <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                            <span className="text-xs text-gray-400">{label}</span>
                            <span className="text-xs font-semibold text-[#0A2540]">{value}px</span>
                          </div>
                        ) : null)}
                      </div>
                    </div>

                    {/* Date + bouton */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Scanné le {new Date(scanData.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <button
                        onClick={() => router.push('/scan?from=profile')}
                        className="border border-[#1E3A8A] text-[#1E3A8A] px-4 py-2 rounded-xl text-xs font-medium hover:bg-[#EEF2FF] transition-colors flex items-center gap-1.5"
                      >
                        🔄 Refaire le scan
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ══ TAB: Mes contextes ══ */}
            {activeTab === 'contextes' && (
              <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-lg font-bold text-[#0A2540]">Mes contextes</p>
                  <button onClick={() => router.push('/contexts/new')} className="text-sm font-semibold text-[#102A72] hover:underline">
                    + Nouveau
                  </button>
                </div>

                {contexts.length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-3 text-center">
                    <span className="text-4xl opacity-30">🎯</span>
                    <p className="text-sm text-gray-400 max-w-xs">Crée ton premier contexte pour obtenir des recommandations personnalisées</p>
                    <button onClick={() => router.push('/contexts/new')} className="mt-1 bg-[#102A72] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                      Créer un contexte
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {contexts.map((ctx, idx) => {
                      const emoji = USAGE_EMOJI[ctx.usage] ?? '🎯'
                      const iconBg = CTX_INDEX_BG[idx % CTX_INDEX_BG.length]
                      const isActive = !!ctx.is_active
                      return (
                        <div key={ctx.id}>
                          <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isActive ? 'bg-[#F1F5FF] border-[#102A72]/25' : 'bg-white border-[#E2E8F0] hover:border-gray-300'}`}>
                            {/* Colored square icon */}
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                              {emoji}
                            </div>
                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-semibold text-[#0A2540]">{ctx.name}</p>
                                {isActive && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">● Actif</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate">
                                {[ctx.correction, ctx.style, ctx.usage].filter(Boolean).join(' · ')}
                              </p>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {ctx.name !== 'Mon profil de base' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setShowDeleteModal(ctx.id) }}
                                  className="p-1.5 text-gray-300 hover:text-gray-400 transition-colors leading-none"
                                  style={{ fontSize: 14 }}
                                >
                                  🗑️
                                </button>
                              )}
                              <button
                                onClick={() => goToResults(ctx)}
                                style={{ background: '#102A72', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1 }}
                              >
                                →
                              </button>
                            </div>
                          </div>

                          {showDeleteModal === ctx.id && (
                            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%', textAlign: 'center' }}>
                                <p style={{ fontSize: 20, marginBottom: 8 }}>🗑️</p>
                                <h3 style={{ color: '#0A2540', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Supprimer ce contexte ?</h3>
                                <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>"{ctx.name}" sera définitivement supprimé.</p>
                                <div style={{ display: 'flex', gap: 12 }}>
                                  <button onClick={() => setShowDeleteModal(null)} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', color: '#0A2540', fontWeight: 500, cursor: 'pointer', background: 'white', fontFamily: 'inherit' }}>Annuler</button>
                                  <button onClick={() => deleteContext(ctx.id)} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#EF4444', color: 'white', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Oui, supprimer</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══ TAB: Paramètres ══ */}
            {activeTab === 'parametres' && (
              <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
                <p className="text-lg font-bold text-[#0A2540] mb-4">Mon compte</p>

                {/* Email */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-base flex-shrink-0">✉️</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0A2540]">Email</p>
                    <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                  </div>
                  <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full flex-shrink-0">● Vérifié</span>
                </div>

                {/* Téléphone */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-50">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-base flex-shrink-0">📱</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0A2540]">Téléphone</p>
                    <p className="text-xs text-gray-400">{session?.user?.phone || 'Non renseigné'}</p>
                  </div>
                  <button className="text-xs font-medium text-[#102A72] flex-shrink-0">Ajouter →</button>
                </div>

                {/* Mot de passe */}
                <div className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-base flex-shrink-0">🔒</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0A2540]">Mot de passe</p>
                    <p className="text-xs text-gray-400">Aucun mot de passe défini</p>
                  </div>
                  <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-xs font-medium text-[#102A72] flex-shrink-0">Définir →</button>
                </div>

                {showPasswordForm && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                    <input type="password" placeholder="Nouveau mot de passe (min 8 car.)" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#102A72]" />
                    <input type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#102A72]" />
                    {passwordMsg && <p className={`text-xs ${passwordMsg.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>{passwordMsg}</p>}
                    <button onClick={handleSetPassword} className="w-full bg-[#102A72] text-white py-2.5 rounded-xl text-sm font-medium">
                      Enregistrer
                    </button>
                  </div>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full border border-red-100 text-red-400 py-3 rounded-xl text-sm font-medium mt-4 hover:bg-red-50 transition-colors"
                >
                  → Se déconnecter
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}
