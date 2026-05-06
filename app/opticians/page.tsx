'use client'

import { useRouter } from 'next/navigation'

export default function OpticiansPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Oculis</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/profile')}
            className="border border-gray-200 text-[#0A2540] px-4 py-2 rounded-xl text-sm font-medium"
          >
            Mon profil
          </button>
          <button
            onClick={() => router.push('/scan')}
            className="bg-[#1E3A8A] text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            📷 Scan
          </button>
        </div>
      </header>
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <p className="text-gray-400">Map des opticiens</p>
      </div>
    </main>
  )
}
