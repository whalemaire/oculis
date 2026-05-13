'use client'

export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/opticians'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  async function signIn() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Email ou mot de passe incorrect')
    } else {
      router.push(redirect)
    }
  }

  async function sendForgotLink() {
    if (!email) return
    await supabase.auth.signInWithOtp({ email })
    setForgotSent(true)
  }

  return (
    <main className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8 flex flex-col gap-6">

        <p className="text-center text-2xl font-extrabold text-[#0A2540]">Oculis</p>

        <div className="text-center space-y-1.5">
          <h1 className="text-lg font-bold text-[#0A2540]">Bon retour 👋</h1>
          <p className="text-sm text-gray-400">Connecte-toi à ton compte</p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="ton@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && signIn()}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#1E3A8A] transition-colors"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && signIn()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#1E3A8A] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base"
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          {error && <p className="text-xs text-red-500 -mt-1">{error}</p>}

          <button
            onClick={signIn}
            disabled={!email || !password || loading}
            className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

          <div className="text-center">
            {forgotSent ? (
              <p className="text-xs text-green-600">Lien envoyé ✓</p>
            ) : (
              <button onClick={sendForgotLink} className="text-xs text-[#1E3A8A] hover:underline">
                Mot de passe oublié ?
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Pas encore de compte ?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-[#1E3A8A] font-semibold hover:underline"
            >
              Créer mon compte →
            </button>
          </p>
          <button
            onClick={() => router.push('/opticians')}
            className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
          >
            Peut-être plus tard →
          </button>
        </div>

      </div>
    </main>
  )
}
