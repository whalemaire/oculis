export default function ScanPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Oculis</span>
      </header>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-73px)] gap-6 px-6">
        <div className="w-72 h-72 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center">
          <span className="text-gray-300 text-sm">Centre ton visage ici</span>
        </div>
        <button className="w-full max-w-sm bg-[#1E3A8A] text-white py-3 rounded-xl font-medium">
          📷 Scanner mon visage
        </button>
        <p className="text-gray-400 text-sm">ou uploader une photo</p>
      </div>
    </main>
  )
}
