'use client'

import { useRouter } from 'next/navigation'

export default function ScanPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Oculis</span>
        <button
          onClick={() => router.push('/opticians')}
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          ← Retour
        </button>
      </header>

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 gap-8 max-w-sm mx-auto w-full">

        {/* Info section — 3 columns */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[
            { icon: '👁️', title: 'Forme du visage', desc: 'Détectée depuis ta photo' },
            { icon: '💡', title: 'Montures adaptées', desc: 'Selon ton style et budget' },
            { icon: '📍', title: 'Près de toi', desc: 'Opticiens locaux avec tes montures' },
          ].map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-1.5">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-xs font-semibold text-[#0A2540] leading-tight">{item.title}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Camera viewport */}
        <div className="w-72 h-72 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center relative">
          {/* Face outline SVG */}
          <svg
            width="160"
            height="200"
            viewBox="0 0 160 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-30"
          >
            {/* Head/face outline */}
            <ellipse cx="80" cy="95" rx="62" ry="78" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" />
            {/* Left eye */}
            <ellipse cx="54" cy="82" rx="12" ry="7" stroke="#1E3A8A" strokeWidth="2" />
            {/* Right eye */}
            <ellipse cx="106" cy="82" rx="12" ry="7" stroke="#1E3A8A" strokeWidth="2" />
            {/* Nose bridge line */}
            <path d="M80 92 L76 110 L84 110" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Mouth */}
            <path d="M62 128 Q80 142 98 128" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Left ear */}
            <path d="M18 85 Q10 95 18 110" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Right ear */}
            <path d="M142 85 Q150 95 142 110" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button className="w-full bg-[#1E3A8A] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#162d6b] transition-colors">
            📷 Scanner mon visage
          </button>
          <button className="text-sm text-gray-400 hover:text-gray-500 transition-colors">
            ou uploader une photo
          </button>
        </div>

      </div>
    </main>
  )
}
