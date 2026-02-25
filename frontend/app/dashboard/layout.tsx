import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-8">ImmoCRM 🏠</h2>
        <nav className="space-y-4">
          <Link href="/dashboard" className="block hover:text-blue-300">Tableau de bord</Link>
          <Link href="/dashboard/contacts" className="block hover:text-blue-300">Contacts (Clients)</Link>
          <Link href="/dashboard/entreprises" className="block hover:text-blue-300">Entreprises</Link>
          <Link href="/dashboard/leads" className="block hover:text-blue-300">Leads (Ventes)</Link>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}