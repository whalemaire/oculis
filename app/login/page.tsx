'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Tab = 'phone' | 'email'

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('phone')

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
          {activeTab === 'phone' ? (
            <>
              {/* Phone input */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1E3A8A] transition-colors">
                <span className="px-4 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 font-medium select-none">
                  +33
                </span>
                <input
                  type="tel"
                  placeholder="6 12 34 56 78"
                  className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none bg-white"
                />
              </div>
              <button className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors">
                Envoyer le code →
              </button>
            </>
          ) : (
            <>
              {/* Email input */}
              <input
                type="email"
                placeholder="ton@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#1E3A8A] transition-colors"
              />
              <button className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors">
                Envoyer le lien →
              </button>
            </>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={() => router.push('/results')}
          className="text-sm text-gray-400 hover:text-gray-500 transition-colors text-center"
        >
          Peut-être plus tard →
        </button>

      </div>
    </main>
  )
}
