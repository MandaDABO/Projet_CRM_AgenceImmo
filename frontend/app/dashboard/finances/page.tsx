'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FiTrendingUp, FiDollarSign, FiFileText, FiCheckCircle, FiUsers } from 'react-icons/fi';

export default function FinancesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCA: 0, totalComm: 0 });

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (data) {
        setInvoices(data);
        const ca = data.reduce((acc, curr) => acc + curr.montant_total, 0);
        const comm = data.reduce((acc, curr) => acc + curr.commission_agence, 0);
        setStats({ totalCA: ca, totalComm: comm });
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-black text-slate-800 mb-10 tracking-tight text-center lg:text-left">
        PERFORMANCE<span className="text-emerald-600">FINANCIÈRE</span>
      </h1>

      {/* CARTES DE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume de ventes (CA)</p>
            <p className="text-4xl font-black text-slate-900">{stats.totalCA.toLocaleString()} €</p>
          </div>
          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 text-2xl">
            <FiTrendingUp />
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 flex items-center justify-between text-white transition-transform hover:scale-[1.01]">
          <div>
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Commissions Agence</p>
            <p className="text-4xl font-black">{stats.totalComm.toLocaleString()} €</p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-white text-2xl">
            <FiDollarSign />
          </div>
        </div>
      </div>

      {/* TABLEAU DES TRANSACTIONS MIS À JOUR */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-slate-700 flex items-center gap-2"><FiFileText /> Journal des Ventes</h2>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
            <FiCheckCircle /> {invoices.length} Dossiers clôturés
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-50/30">
              <tr>
                <th className="px-8 py-4">Projet / Bien</th>
                <th className="px-8 py-4">Parties (Vendeur ➔ Acheteur)</th>
                <th className="px-8 py-4">Prix de Vente</th>
                <th className="px-8 py-4">Honoraires</th>
                <th className="px-8 py-4">Date de clôture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-800">
                    {inv.projet_nom}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">V</span> {inv.vendeur_nom}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold mt-1">
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">A</span> {inv.acheteur_nom || "N/A"}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900">{inv.montant_total.toLocaleString()} €</td>
                  <td className="px-8 py-5">
                    <span className="font-black text-emerald-600">+{inv.commission_agence.toLocaleString()} €</span>
                  </td>
                  <td className="px-8 py-5 text-slate-400 text-xs font-bold uppercase">
                    {new Date(inv.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}