'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/app/components/AuthProvider'

export default function ProfilePage() {
  const router = useRouter()
  const { session } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [scans, setScans] = useState<any[]>([])
  const [contexts, setContexts] = useState<any[]>([])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchScans = async () => {
      const { data, error } = await supabase
        .from('scan')
        .select('*')
        .eq('user_id', session.user.id)
        .order('id', { ascending: false })

      console.log('data:', data)
      console.log('error:', error)

      if (data) setScans(data)
    }

    const fetchContexts = async () => {
      const { data } = await supabase
        .from('context')
        .select('id')
        .eq('user_id', session.user.id)
      if (data) setContexts(data)
    }

    fetchScans()
    fetchContexts()
  }, [session])

  const hasScans = scans.length > 0
  const hasContexts = contexts.length > 0
  const completionPercent = hasScans && hasContexts ? 100 : hasScans ? 60 : 20
  const completionBarColor = hasScans && hasContexts ? 'bg-success' : hasScans ? 'bg-accent' : 'bg-red-400'
  const completionTextColor = hasScans && hasContexts ? 'text-success' : hasScans ? 'text-accent' : 'text-red-400'
  const completionMessage = hasScans && hasContexts
    ? null
    : hasScans
      ? 'Crée un contexte pour affiner tes recommandations →'
      : 'Fais ton premier scan →'
  const completionLink = hasScans ? '/contexts/new' : '/scan'

  console.log('session user id:', session?.user?.id)
  console.log('scans:', scans)

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/opticians')
  }

  return (
    <main className="min-h-screen bg-[#F4F6F9]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Mon profil</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/opticians')}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
          >
            ← Retour à la map
          </button>
          <button
            onClick={signOut}
            className="text-sm text-red-400 hover:text-red-500 font-medium transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 py-6 space-y-4">

        {/* Section 1 — Infos personnelles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-l-[3px] border-[#1E3A8A] p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                A
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0A2540] text-base mb-2">Adrien</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>📧</span>
                    <span>email@exemple.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>📱</span>
                    <button className="text-[#1E3A8A] font-medium hover:underline">
                      Ajouter un téléphone →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400 font-medium">Profil complété</span>
                <span className={`text-xs font-semibold ${completionTextColor}`}>{completionPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${completionBarColor}`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              {completionMessage && (
                <button
                  onClick={() => router.push(completionLink)}
                  className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors text-left"
                >
                  {completionMessage}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 2 — Mes scans */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-[#0A2540]">Mes scans</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/contexts/new')}
                className="text-sm text-[#1E3A8A] font-medium hover:underline"
              >
                + Nouveau contexte
              </button>
              <button
                onClick={() => router.push('/scan')}
                className="text-sm text-[#1E3A8A] font-medium hover:underline"
              >
                Nouveau scan →
              </button>
            </div>
          </div>

          {scans.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <span className="text-4xl opacity-30">📷</span>
              <p className="text-sm text-gray-400">Aucun scan pour l'instant</p>
              <button
                onClick={() => router.push('/scan')}
                className="mt-1 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d6b] transition-colors"
              >
                Démarrer mon premier scan
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {scans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                      {scan.face_shape}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#0A2540]">{scan.confidence}% confiance</p>
                      <p className="text-xs text-gray-400">
                        {new Date(scan.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/results?shape=${scan.face_shape}&confidence=${scan.confidence}&ipd=${scan.ipd}&ratio=${scan.ratio}`)}
                    className="text-sm text-[#1E3A8A] font-semibold hover:underline flex-shrink-0"
                  >
                    Voir →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3 — Compte */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="font-bold text-[#0A2540] mb-4">Compte</p>
          <div className="divide-y divide-gray-50">

            {/* Nom */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-base">👤</span>
                <div>
                  <p className="text-sm font-medium text-[#0A2540]">Nom</p>
                  <p className="text-xs text-gray-400">Adrien</p>
                </div>
              </div>
              <button className="text-xs text-[#1E3A8A] font-semibold hover:underline">
                Modifier
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-base">📧</span>
                <div>
                  <p className="text-sm font-medium text-[#0A2540]">Email</p>
                  <p className="text-xs text-gray-400">email@exemple.com</p>
                </div>
              </div>
              <button className="text-xs text-[#1E3A8A] font-semibold hover:underline">
                Modifier
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-base">🔔</span>
                <div>
                  <p className="text-sm font-medium text-[#0A2540]">Notifications</p>
                  <p className="text-xs text-gray-400">{notifications ? 'Activées' : 'Désactivées'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Toggle */}
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    notifications ? 'bg-[#1E3A8A]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      notifications ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <button className="text-xs text-[#1E3A8A] font-semibold hover:underline">
                  Modifier
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}
