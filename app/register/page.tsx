'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FiglaLogo } from '@/app/components/FiglaLogo'

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

  const baseInput: React.CSSProperties = { width: '100%', height: 46, paddingLeft: 44, paddingRight: 16, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 14, fontFamily: 'inherit', color: '#0F172A', outline: 'none' }
  const inputPR: React.CSSProperties = { ...baseInput, paddingRight: 56 }

  return (
    <main style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left — brand pitch (desktop only) */}
      <div className="hidden md:flex" style={{ flexDirection: 'column', justifyContent: 'space-between', flex: 1, position: 'relative', overflow: 'hidden', background: '#0A2540', padding: '52px 56px 48px' }}>
        <div style={{ position: 'absolute', right: -140, bottom: -140, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,140,255,.45) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 44, bottom: 36, opacity: .07, pointerEvents: 'none' }}>
          <FiglaLogo size={320} variant="inv" showWordmark={false} />
        </div>
        <FiglaLogo size={32} variant="inv" />
        <div style={{ position: 'relative', maxWidth: 360 }}>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: '#5B8CFF', marginBottom: 16 }}>Commence en 30 secondes</p>
          <h2 style={{ color: '#fff', fontSize: 34, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.015em', margin: '0 0 14px' }}>Un scan, des recommandations<br/>pour toute la vie.</h2>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Crée ton profil, scanne ton visage, et retrouve les montures faites pour toi à chaque fois que tu en cherches.</p>
        </div>
        <div style={{ display: 'flex', gap: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.1)', position: 'relative' }}>
          {[['Gratuit', 'Pour toujours'], ['30 sec', 'Pour scanner'], ['100%', 'Privé']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-.02em' }}>{n}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-col justify-center w-full md:w-[480px] flex-shrink-0 bg-white" style={{ padding: '48px 52px' }}>
        <div className="md:hidden" style={{ marginBottom: 32 }}>
          <FiglaLogo size={28} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0A2540', letterSpacing: '-.018em', margin: '0 0 6px' }}>Créer ton compte</h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Pour sauvegarder tes résultats et accéder aux opticiens.</p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={e => { e.preventDefault(); register() }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0A2540', marginBottom: 8 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6" strokeLinecap="round"/></svg>
              <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} style={baseInput}
                onFocus={e => { e.target.style.borderColor = '#5B8CFF'; e.target.style.boxShadow = '0 0 0 4px #F1F5FF' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0A2540', marginBottom: 8 }}>Mot de passe (min 8 car.)</label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
              <input type={showPassword ? 'text' : 'password'} placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} style={inputPR}
                onFocus={e => { e.target.style.borderColor = '#5B8CFF'; e.target.style.boxShadow = '0 0 0 4px #F1F5FF' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12 }}>{showPassword ? 'Cacher' : 'Voir'}</button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0A2540', marginBottom: 8 }}>Confirmer le mot de passe</label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round"/></svg>
              <input type={showConfirm ? 'text' : 'password'} placeholder="Confirmer" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && register()} style={inputPR}
                onFocus={e => { e.target.style.borderColor = '#5B8CFF'; e.target.style.boxShadow = '0 0 0 4px #F1F5FF' }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12 }}>{showConfirm ? 'Cacher' : 'Voir'}</button>
            </div>
          </div>

          {error === 'already_exists' ? (
            <p style={{ margin: 0, fontSize: 12, color: '#EF4444' }}>
              Ce compte existe déjà,{' '}
              <button type="button" onClick={() => router.push('/login')} style={{ color: '#102A72', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: 'inherit' }}>connecte-toi →</button>
            </p>
          ) : error ? (
            <p style={{ margin: 0, fontSize: 12, color: '#EF4444' }}>{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={!email || !password || !confirm || loading}
            style={{ width: '100%', height: 50, background: '#102A72', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: (!email || !password || !confirm || loading) ? 'not-allowed' : 'pointer', boxShadow: '0 8px 22px -8px rgba(16,42,114,.55)', opacity: (!email || !password || !confirm || loading) ? 0.45 : 1, fontFamily: 'inherit', marginTop: 4 }}
          >
            {loading ? 'Création…' : 'Créer mon compte →'}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
            Déjà un compte ?{' '}
            <button onClick={() => router.push('/login')} style={{ color: '#102A72', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              Se connecter →
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}
