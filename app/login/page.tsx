'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Tab = 'phone' | 'email'
type EmailStep = 'input' | 'sent'
type PhoneStep = 'input' | 'verify'


export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/opticians'
  const [activeTab, setActiveTab] = useState<Tab>('phone')

  // Email state
  const [email, setEmail] = useState('')
  const [emailStep, setEmailStep] = useState<EmailStep>('input')
  const [emailError, setEmailError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Phone state
  const [phone, setPhone] = useState('')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('input')
  const [phoneError, setPhoneError] = useState('')
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  async function sendEmailOtp() {
    setEmailError('')
    setEmailLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    setEmailLoading(false)
    if (error) {
      setEmailError(error.message)
    } else {
      setEmailStep('sent')
    }
  }

  async function sendPhoneOtp() {
    setPhoneError('')
    setPhoneLoading(true)
    const fullPhone = '+33' + phone.replace(/\s/g, '')
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone })
    setPhoneLoading(false)
    if (error) {
      setPhoneError(error.message)
    } else {
      setPhoneStep('verify')
    }
  }

  async function verifyPhoneOtp() {
    setPhoneError('')
    setPhoneLoading(true)
    const token = otp.join('')
    const fullPhone = '+33' + phone.replace(/\s/g, '')
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token, type: 'sms' })
    setPhoneLoading(false)
    if (error) {
      setPhoneError(error.message)
    } else {
      router.push(redirect)
    }
  }

  function handleOtpInput(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) {
      otpRefs[index + 1].current?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus()
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F6F9] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8 flex flex-col gap-6">

        {/* Logo */}
        <p className="text-center text-2xl font-extrabold text-[#0A2540]">Oculis</p>

        {/* Title */}
        <div className="text-center space-y-1.5">
          <h1 className="text-lg font-bold text-[#0A2540]">Créer ton compte</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Pour voir tes résultats et trouver les opticiens près de toi
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['phone', 'email'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-[#1E3A8A] border-b-2 border-[#1E3A8A] -mb-px'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'phone' ? 'Téléphone' : 'Email'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex flex-col gap-4">

          {/* ── EMAIL TAB ── */}
          {activeTab === 'email' && (
            <>
              {emailStep === 'input' ? (
                <>
                  <input
                    type="email"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendEmailOtp()}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#1E3A8A] transition-colors"
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 -mt-1">{emailError}</p>
                  )}
                  <button
                    onClick={sendEmailOtp}
                    disabled={!email || emailLoading}
                    className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {emailLoading ? 'Envoi…' : 'Envoyer le lien →'}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <span className="text-3xl">📧</span>
                  <p className="text-sm font-semibold text-[#0A2540]">Vérifie ta boîte mail</p>
                  <p className="text-sm text-gray-400">
                    Un lien de connexion a été envoyé à{' '}
                    <span className="text-[#1E3A8A] font-medium">{email}</span>
                  </p>
                  <button
                    onClick={() => { setEmailStep('input'); setEmailError('') }}
                    className="text-xs text-gray-400 hover:text-gray-500 mt-2"
                  >
                    Changer d'adresse
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── PHONE TAB ── */}
          {activeTab === 'phone' && (
            <>
              {phoneStep === 'input' ? (
                <>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1E3A8A] transition-colors">
                    <span className="px-4 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 font-medium select-none">
                      +33
                    </span>
                    <input
                      type="tel"
                      placeholder="6 12 34 56 78"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendPhoneOtp()}
                      className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none bg-white"
                    />
                  </div>
                  {phoneError && (
                    <p className="text-xs text-red-500 -mt-1">{phoneError}</p>
                  )}
                  <button
                    onClick={sendPhoneOtp}
                    disabled={!phone || phoneLoading}
                    className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {phoneLoading ? 'Envoi…' : 'Envoyer le code →'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 text-center">
                    Code envoyé au <span className="font-semibold text-[#0A2540]">+33{phone}</span>
                  </p>

                  {/* OTP inputs */}
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpInput(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-10 h-12 text-center text-lg font-bold text-[#0A2540] border border-gray-200 rounded-xl outline-none focus:border-[#1E3A8A] transition-colors"
                      />
                    ))}
                  </div>

                  {phoneError && (
                    <p className="text-xs text-red-500 text-center -mt-1">{phoneError}</p>
                  )}

                  <button
                    onClick={verifyPhoneOtp}
                    disabled={otp.join('').length < 6 || phoneLoading}
                    className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {phoneLoading ? 'Vérification…' : 'Vérifier le code'}
                  </button>

                  <button
                    onClick={() => { setPhoneStep('input'); setOtp(['', '', '', '', '', '']); setPhoneError('') }}
                    className="text-xs text-gray-400 hover:text-gray-500 text-center"
                  >
                    ← Modifier le numéro
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={() => router.push('/opticians')}
          className="text-sm text-gray-400 hover:text-gray-500 transition-colors text-center"
        >
          Peut-être plus tard →
        </button>

      </div>
    </main>
  )
}
