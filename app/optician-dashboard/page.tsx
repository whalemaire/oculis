export const metadata = {
  title: 'Espace opticien — Figla',
  description: 'Gérez votre boutique et votre stock de montures sur la plateforme Figla.',
}

export default function OpticianDashboardPage() {
  return (
    <main className="min-h-screen bg-[#F4F6F9]">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <span className="text-xl font-bold text-[#0A2540]">Figla</span>
        <span className="text-sm text-gray-400">Espace opticien</span>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-[#0A2540]">Mon espace</h1>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="font-semibold text-[#0A2540] mb-1">Ma boutique</p>
          <p className="text-gray-400 text-sm">Aucune boutique enregistrée</p>
          <button className="mt-4 bg-[#1E3A8A] text-white px-4 py-2 rounded-xl text-sm font-medium">
            + Enregistrer ma boutique
          </button>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="font-semibold text-[#0A2540] mb-1">Mon stock</p>
          <p className="text-gray-400 text-sm">Ajoutez vos montures disponibles</p>
          <button className="mt-4 border border-[#1E3A8A] text-[#1E3A8A] px-4 py-2 rounded-xl text-sm font-medium">
            + Ajouter des montures
          </button>
        </div>
      </div>
    </main>
  )
}
