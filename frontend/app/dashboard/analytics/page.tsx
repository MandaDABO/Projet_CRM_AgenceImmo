'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState<any>({
    pipelineData: [],
    caByCommercial: [],
    caByProduct: [],
    caEvolution: [],
    statsVille: [],
    statsSecteur: [],
    topClients: [],
    totalCA: 0,
    pipelineValue: 0,
    conversionRate: 0,
    totalLeads: 0,
    totalClients: 0,
    panierMoyen: 0,
    clientsActifs: 0
  });

  useEffect(() => {
    setIsClient(true);
    const fetchStats = async () => {
      const { data: leads } = await supabase.from('leads').select('*');
      
      if (leads) {
        // --- FILTRES DE BASE ---
        const wonLeads = leads.filter(l => l.statut === 'Gagné');
        const currentLeads = leads.filter(l => !['Gagné', 'Perdu'].includes(l.statut));

        // --- 1. STATS VENTES (POINT 7.1) ---
        const ca = wonLeads.reduce((sum, l) => sum + (Number(l.valeur_estimee) || 0), 0);
        const pValue = currentLeads.reduce((sum, l) => sum + (Number(l.valeur_estimee) || 0), 0);
        
        const stages = ['Prospect', 'Qualification', 'Proposition envoyée', 'Négociation', 'Gagné', 'Perdu'];
        const pipelineData = stages.map(stage => ({
          name: stage,
          total: leads.filter(l => l.statut === stage).length
        }));

        const caByCommercial = Object.entries(wonLeads.reduce((acc: any, l) => {
          const name = l.commercial_nom || 'Non assigné';
          acc[name] = (acc[name] || 0) + (Number(l.valeur_estimee) || 0);
          return acc;
        }, {})).map(([name, value]) => ({ name, value }));

        const caByProduct = Object.entries(wonLeads.reduce((acc: any, l) => {
          const cat = l.categorie_service || 'Autres';
          acc[cat] = (acc[cat] || 0) + (Number(l.valeur_estimee) || 0);
          return acc;
        }, {})).map(([name, value]) => ({ name, value }));

        // --- 2. STATS CLIENTS (POINT 7.2) ---
        const villeMap = wonLeads.reduce((acc: any, c) => {
          acc[c.ville || 'Nanterre'] = (acc[c.ville || 'Nanterre'] || 0) + 1;
          return acc;
        }, {});
        const statsVille = Object.keys(villeMap).map(v => ({ name: v, value: villeMap[v] }));

        const secteurMap = wonLeads.reduce((acc: any, c) => {
          acc[c.secteur_activite || 'Privé'] = (acc[c.secteur_activite || 'Privé'] || 0) + 1;
          return acc;
        }, {});
        const statsSecteur = Object.keys(secteurMap).map(s => ({ name: s, value: secteurMap[s] }));

        const topClients = [...wonLeads]
          .sort((a, b) => Number(b.valeur_estimee) - Number(a.valeur_estimee))
          .slice(0, 3)
          .map(c => ({ name: c.nom, total: c.valeur_estimee }));

        // --- MISE À JOUR DE L'ÉTAT ---
        setStats({
          pipelineData,
          caByCommercial,
          caByProduct,
          statsVille,
          statsSecteur,
          topClients,
          totalCA: ca,
          pipelineValue: pValue,
          conversionRate: leads.length > 0 ? (wonLeads.length / leads.length * 100).toFixed(1) : 0,
          totalLeads: leads.length,
          totalClients: wonLeads.length,
          panierMoyen: wonLeads.length > 0 ? ca / wonLeads.length : 0,
          clientsActifs: wonLeads.filter(c => c.est_actif !== false).length
        });
      }
    };
    fetchStats();
  }, []);

  if (!isClient) return null;

  return (
    <div className="p-8 space-y-12 bg-slate-50 min-h-screen">
      {/* SECTION 1 : VENTES */}
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-800 border-b pb-4">📊 1. Statistiques Commerciales</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="CA Total" value={`${stats.totalCA.toLocaleString()} €`} color="text-indigo-600" />
          <StatCard title="Pipeline" value={`${stats.pipelineValue.toLocaleString()} €`} color="text-slate-600" />
          <StatCard title="Conversion" value={`${stats.conversionRate} %`} color="text-emerald-600" />
          <StatCard title="Leads" value={stats.totalLeads} color="text-orange-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartContainer title="Pipeline par étape"><BarChart data={stats.pipelineData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" fontSize={10}/><YAxis/><Tooltip/><Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]}/></BarChart></ChartContainer>
          <ChartContainer title="CA par Type de Bien">
            <PieChart>
              <Pie data={stats.caByProduct} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {stats.caByProduct.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${v.toLocaleString()} €`}/><Legend/>
            </PieChart>
          </ChartContainer>
        </div>
      </section>

      {/* SECTION 2 : CLIENTS (POINT 7.2) */}
      <section className="space-y-6 pt-6">
        <h1 className="text-3xl font-bold text-slate-800 border-b pb-4">👥 2. Statistiques Clients</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Clients" value={stats.totalClients} color="text-blue-600" />
          <StatCard title="Panier Moyen" value={`${Math.round(stats.panierMoyen).toLocaleString()} €`} color="text-purple-600" />
          <StatCard title="Clients Actifs" value={stats.clientsActifs} color="text-green-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ChartContainer title="Par Ville">
            <PieChart>
              <Pie data={stats.statsVille} dataKey="value" nameKey="name" label>
                {stats.statsVille.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip/><Legend/>
            </PieChart>
          </ChartContainer>
          <ChartContainer title="Secteurs d'activité">
            <BarChart data={stats.statsSecteur} layout="vertical">
              <XAxis type="number" hide/><YAxis dataKey="name" type="category" fontSize={10} width={80}/><Tooltip/><Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}/></BarChart>
          </ChartContainer>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold mb-6 text-slate-700 font-sans">🏆 Clients les plus rentables (LTV)</h2>
            <div className="space-y-4">
              {stats.topClients.map((c: any, i: number) => (
                <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-lg border-l-4 border-indigo-500">
                  <span className="font-bold text-slate-700">{c.name}</span>
                  <span className="text-indigo-600 font-black">{Number(c.total).toLocaleString()} €</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Composants helpers
function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><p className="text-slate-500 text-xs font-bold uppercase">{title}</p><p className={`text-3xl font-black mt-2 ${color}`}>{value}</p></div>
  );
}
function ChartContainer({ title, children }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col"><h2 className="text-lg font-bold mb-6 text-slate-700">{title}</h2><div className="flex-1 w-full min-h-0"><ResponsiveContainer>{children}</ResponsiveContainer></div></div>
  );
}