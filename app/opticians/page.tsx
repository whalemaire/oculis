export default function OpticiansPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Oculis</span>
        <button className="bg-[#1E3A8A] text-white px-4 py-2 rounded-xl text-sm font-medium">
          📷 Scan
        </button>
      </header>
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <p className="text-gray-400">Map des opticiens</p>
      </div>
    </main>
  )
}
