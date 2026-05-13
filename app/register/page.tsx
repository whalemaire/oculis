'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function register() {
    setError('')
    if (password.length < 8) {
      setError('Le mot de passe doit faire au minimum 8 caractères')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
        setError('already_exists')
      } else {
        setError(error.message)
      }
    } else {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        const { data: scans } = await supabase
          .from('scan')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1)
        if (!scans || scans.length === 0) {
          router.push('/scan')
        } else {
          router.push('/contexts/new')
        }
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8 flex flex-col gap-6">

        <p className="text-center text-2xl font-extrabold text-[#0A2540]">Oculis</p>

        <div className="text-center space-y-1.5">
          <h1 className="text-lg font-bold text-[#0A2540]">Créer ton compte</h1>
          <p className="text-sm text-gray-400">Pour sauvegarder tes résultats</p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="ton@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#1E3A8A] transition-colors"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe (min 8 car.)"
              value={password}
              onChange={e => setPassword(e.target.value)}
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

          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirmer le mot de passe"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && register()}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#1E3A8A] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base"
            >
              {showConfirm ? '🙈' : '👁'}
            </button>
          </div>

          {error === 'already_exists' ? (
            <p className="text-xs text-red-500 -mt-1">
              Ce compte existe déjà,{' '}
              <button onClick={() => router.push('/login')} className="underline font-medium">
                connecte-toi →
              </button>
            </p>
          ) : error ? (
            <p className="text-xs text-red-500 -mt-1">{error}</p>
          ) : null}

          <button
            onClick={register}
            disabled={!email || !password || !confirm || loading}
            className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Déjà un compte ?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-[#1E3A8A] font-semibold hover:underline"
            >
              Se connecter →
            </button>
          </p>
        </div>

      </div>
    </main>
  )
}
