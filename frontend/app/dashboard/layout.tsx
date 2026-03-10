'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiTrendingUp, 
  FiDollarSign, 
  FiSettings,
  FiLogOut,
  FiCheckSquare,
  FiBarChart2 // Nouvelle icône pour Analytics
} from 'react-icons/fi';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/');
    } else {
      console.error("Erreur déconnexion:", error.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white p-8 shadow-2xl flex flex-col sticky top-0 h-screen">
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2 text-white">
            IMMOCRM <span className="text-indigo-500">.</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Immobilier Pro v1.0</p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Menu Principal</p>
          
          <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-slate-300 hover:text-white group">
            <FiHome className="text-indigo-400 group-hover:scale-110 transition-transform"/> Tableau de bord
          </Link>

          {/* AJOUT DE L'ONGLET ANALYTICS ICI */}
          <Link href="/dashboard/analytics" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-slate-300 hover:text-white group">
            <FiBarChart2 className="text-indigo-400 group-hover:scale-110 transition-transform"/> Statistiques (Analytics)
          </Link>

          <Link href="/dashboard/tasks" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-slate-300 hover:text-white group">
            <FiCheckSquare className="text-indigo-400 group-hover:scale-110 transition-transform"/> Tâches & Rappels
          </Link>

          <Link href="/dashboard/leads" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-slate-300 hover:text-white group">
            <FiTrendingUp className="text-indigo-400 group-hover:scale-110 transition-transform"/> Pipeline (Ventes)
          </Link>

          <div className="pt-6">
            <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Gestion Assets</p>
            
            <Link href="/dashboard/contacts" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-slate-300 hover:text-white group">
              <FiUsers className="text-indigo-400 group-hover:scale-110 transition-transform"/> Contacts Clients
            </Link>

            <Link href="/dashboard/entreprises" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-slate-300 hover:text-white group">
              <FiBriefcase className="text-indigo-400 group-hover:scale-110 transition-transform"/> Entreprises
            </Link>
          </div>

          <div className="pt-6">
            <p className="text-slate-500 text-[10px] font-black uppercase mb-4 tracking-widest">Analyse & Cash</p>
            
            <Link href="/dashboard/finances" className="flex items-center gap-3 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-600 transition-all font-black text-indigo-400 hover:text-white group">
              <FiDollarSign className="group-hover:rotate-12 transition-transform"/> Finances & Factures
            </Link>
          </div>
        </nav>

        {/* Footer Sidebar avec Logout */}
        <div className="mt-auto pt-6 border-t border-slate-800 space-y-2">
          <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 text-slate-500 hover:text-white transition-colors font-bold text-sm">
            <FiSettings /> Paramètres
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-bold text-sm rounded-xl uppercase tracking-widest"
          >
            <FiLogOut /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}