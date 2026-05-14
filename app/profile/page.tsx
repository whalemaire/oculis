'use client'

export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/components/AuthProvider'

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

  const fetchScan = async () => {
    if (!session?.user?.id) return
    console.log('fetchScan called for user:', session.user.id)
    const { data, error } = await supabase
      .from('scan')
      .select('*')
      .eq('user_id', session.user.id)
      .order('id', { ascending: false })
      .limit(1)

    console.log('fetchScan raw data:', data)
    console.log('fetchScan error:', error)
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

      console.log('contexts fetched:', JSON.stringify(data?.map(c => ({ name: c.name, style: c.style }))))

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

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/opticians')
  }

  const setPassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Les mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg('Minimum 8 caractères')
      return
    }
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
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10B981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '100px',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          ✓ Scan mis à jour avec succès
        </div>
      )}
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Mon profil</span>
        <button
          onClick={() => router.push('/opticians')}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          ← Retour à la map
        </button>
      </header>

      <div className="max-w-xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Section 0 — Progression */}
        {session && progressScore < 100 && (
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-base md:text-lg font-bold text-[#0A2540]">Ta progression</p>
              <span className="text-sm font-bold text-[#1E3A8A]">{progressScore}%</span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div
                className="bg-[#1E3A8A] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressScore}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className={`text-center p-2 md:p-3 rounded-xl ${progressSteps.account ? 'bg-green-50' : 'bg-gray-50'}`}>
                <p className="text-lg md:text-xl">{progressSteps.account ? '✅' : '👤'}</p>
                <p className="text-[10px] md:text-xs font-semibold text-[#0A2540]">Compte</p>
                <p className="text-[9px] md:text-[10px] text-gray-400">+20%</p>
              </div>
              <div className={`text-center p-2 md:p-3 rounded-xl ${progressSteps.scan ? 'bg-green-50' : 'bg-gray-50'}`}>
                <p className="text-lg md:text-xl">{progressSteps.scan ? '✅' : '📷'}</p>
                <p className="text-[10px] md:text-xs font-semibold text-[#0A2540]">Scan</p>
                <p className="text-[9px] md:text-[10px] text-gray-400">+30%</p>
              </div>
              <div className={`text-center p-2 md:p-3 rounded-xl ${progressSteps.context ? 'bg-green-50' : 'bg-gray-50'}`}>
                <p className="text-lg md:text-xl">{progressSteps.context ? '✅' : '🎯'}</p>
                <p className="text-[10px] md:text-xs font-semibold text-[#0A2540]">Contexte</p>
                <p className="text-[9px] md:text-[10px] text-gray-400">+50%</p>
              </div>
            </div>

            {progressScore < 100 && (
              <button
                onClick={() => {
                  if (!progressSteps.scan) router.push('/scan')
                  else if (!progressSteps.context) router.push('/contexts/new')
                }}
                className="mt-4 w-full bg-[#1E3A8A] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d6b] transition-colors"
              >
                {!progressSteps.scan ? '📷 Faire mon scan facial' : '🎯 Créer mon premier contexte'}
              </button>
            )}
          </div>
        )}

        {/* Section 1 — Mes mensurations */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base md:text-lg font-bold text-[#0A2540]">Mes mensurations faciales</p>
            {scanData && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#1E3A8A]">
                1 scan biométrique
              </span>
            )}
          </div>

          {!scanData ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <span className="text-4xl opacity-30">📷</span>
              <p className="text-sm text-gray-400">Aucun scan pour l'instant</p>
              <button
                onClick={() => router.push('/scan')}
                className="mt-1 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d6b] transition-colors"
              >
                📷 Faire mon premier scan
              </button>
            </div>
          ) : (
            <div className="space-y-3">
<span className="inline-block bg-[#0A2540] text-white text-base font-bold px-4 py-1.5 rounded-full capitalize">
                {scanData.face_shape}
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                  Ratio {scanData.ratio}
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                  PD {scanData.ipd}mm
                </span>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                  Confiance {scanData.confidence}%
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Scanné le {new Date(scanData.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <button
                onClick={() => router.push('/scan?from=profile')}
                className="border border-[#1E3A8A] text-[#1E3A8A] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#EEF2FF] transition-colors"
              >
                🔄 Refaire le scan
              </button>
            </div>
          )}
        </div>

        {/* Section 2 — Mes contextes */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base md:text-lg font-bold text-[#0A2540]">Mes contextes</p>
            <button
              onClick={() => router.push('/contexts/new')}
              className="text-sm text-[#1E3A8A] font-medium hover:underline"
            >
              + Nouveau
            </button>
          </div>

          {contexts.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <span className="text-4xl opacity-30">🎯</span>
              <p className="text-sm text-gray-400 max-w-xs">
                Crée ton premier contexte pour obtenir des recommandations personnalisées
              </p>
              <button
                onClick={() => router.push('/contexts/new')}
                className="mt-1 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d6b] transition-colors"
              >
                Créer un contexte
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {contexts.map((ctx) => (
                <div key={ctx.id}>
                  <div
                    onClick={() => goToResults(ctx)}
                    className="relative flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-[#1E3A8A]/30 hover:bg-[#F8F9FF] cursor-pointer transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[#0A2540] text-sm">{ctx.name}</p>
                        {ctx.is_active && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Actif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {[ctx.correction, ctx.style, ctx.usage, ctx.budget].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      {ctx.name !== 'Mon profil de base' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteModal(ctx.id) }}
                          className="text-gray-300 hover:text-gray-400 transition-colors text-base leading-none"
                        >
                          🗑️
                        </button>
                      )}
                      <span className="text-[#1E3A8A] text-sm">→</span>
                    </div>
                  </div>

                  {showDeleteModal === ctx.id && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: 'white', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                        <p style={{ fontSize: '20px', marginBottom: '8px' }}>🗑️</p>
                        <h3 style={{ color: '#0A2540', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Supprimer ce contexte ?</h3>
                        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>"{ctx.name}" sera définitivement supprimé.</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            onClick={() => setShowDeleteModal(null)}
                            style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', color: '#0A2540', fontWeight: '500', cursor: 'pointer', background: 'white' }}
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => deleteContext(ctx.id)}
                            style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#EF4444', color: 'white', fontWeight: '500', cursor: 'pointer' }}
                          >
                            Oui, supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3 — Mon compte */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100">
          <p className="text-base md:text-lg font-bold text-[#0A2540] mb-4">Mon compte</p>
          <div className="divide-y divide-gray-50">

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-base">📧</span>
                <div>
                  <p className="text-sm font-medium text-[#0A2540]">Email</p>
                  <p className="text-xs text-gray-400">{session?.user?.email ?? '—'}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">vérifié</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-base">📱</span>
                <div>
                  <p className="text-sm font-medium text-[#0A2540]">Téléphone</p>
                  <p className="text-xs text-gray-400">Non renseigné</p>
                </div>
              </div>
              <button className="text-xs text-[#1E3A8A] font-semibold hover:underline">
                Ajouter
              </button>
            </div>

          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm text-[#1E3A8A] font-medium"
            >
              🔑 {showPasswordForm ? 'Annuler' : 'Définir un mot de passe'}
            </button>

            {showPasswordForm && (
              <div className="mt-3 space-y-2">
                <input
                  type="password"
                  placeholder="Nouveau mot de passe (min 8 car.)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
                <input
                  type="password"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                />
                {passwordMsg && (
                  <p className={`text-xs ${passwordMsg.includes('✓') ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordMsg}
                  </p>
                )}
                <button
                  onClick={setPassword}
                  className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-xl text-sm font-medium"
                >
                  Enregistrer
                </button>
              </div>
            )}
          </div>

          <button
            onClick={signOut}
            className="mt-4 w-full text-sm text-red-400 hover:text-red-500 font-medium py-2.5 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
          >
            Se déconnecter
          </button>
        </div>

      </div>
    </main>
  )
}
