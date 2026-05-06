export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#F4F6F9]">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Mon profil</span>
      </header>
      <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-xl font-bold">A</div>
            <div>
              <p className="font-bold text-[#0A2540]">Mon compte</p>
              <p className="text-sm text-gray-400">email@exemple.com</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="font-semibold text-[#0A2540] mb-3">Mes scans</p>
          <p className="text-gray-400 text-sm">Aucun scan pour l'instant</p>
        </div>
      </div>
    </main>
  )
}
