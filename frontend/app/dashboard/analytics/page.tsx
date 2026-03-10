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
    caEvolution: [], // NOUVEAU
    statsVille: [],
    statsSecteur: [],
    statsSource: [], // NOUVEAU (Marketing)
    topClients: [],
    leaderboard: [], // NOUVEAU
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
        const wonLeads = leads.filter(l => l.statut === 'Gagné');
        const currentLeads = leads.filter(l => !['Gagné', 'Perdu'].includes(l.statut));

        // --- 1. STATS VENTES & EVOLUTION (POINT 7.1) ---
        const ca = wonLeads.reduce((sum, l) => sum + (Number(l.valeur_estimee) || 0), 0);
        const pValue = currentLeads.reduce((sum, l) => sum + (Number(l.valeur_estimee) || 0), 0);
        
        const stages = ['Prospect', 'Qualification', 'Proposition envoyée', 'Négociation', 'Gagné', 'Perdu'];
        const pipelineData = stages.map(stage => ({
          name: stage,
          total: leads.filter(l => l.statut === stage).length
        }));

        // Évolution mensuelle
        const evolutionMap = wonLeads.reduce((acc: any, l) => {
          const month = new Date(l.created_at).toLocaleString('fr-FR', { month: 'short' });
          acc[month] = (acc[month] || 0) + (Number(l.valeur_estimee) || 0);
          return acc;
        }, {});
        const caEvolution = Object.entries(evolutionMap).map(([name, total]) => ({ name, total }));

        // --- 2. CLASSEMENT COMMERCIAUX (POINT 7.3) ---
        const leaderMap = wonLeads.reduce((acc: any, l) => {
          const name = l.commercial_nom || 'Agent X';
          if (!acc[name]) acc[name] = { name, ca: 0, ventes: 0 };
          acc[name].ca += (Number(l.valeur_estimee) || 0);
          acc[name].ventes += 1;
          return acc;
        }, {});
        const leaderboard = Object.values(leaderMap).sort((a: any, b: any) => b.ca - a.ca);

        // --- 3. MARKETING : SOURCES (POINT 7.6) ---
        const sourceMap = leads.reduce((acc: any, l) => {
          const src = l.source_lead || 'Direct';
          acc[src] = (acc[src] || 0) + 1;
          return acc;
        }, {});
        const statsSource = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

        // --- RESTE DES STATS CLIENTS (POINT 7.2) ---
        const villeMap = wonLeads.reduce((acc: any, c) => {
          acc[c.ville || 'Nanterre'] = (acc[c.ville || 'Nanterre'] || 0) + 1;
          return acc;
        }, {});
        const statsVille = Object.keys(villeMap).map(v => ({ name: v, value: villeMap[v] }));

        setStats({
          pipelineData,
          caEvolution,
          leaderboard,
          statsSource,
          statsVille,
          totalCA: ca,
          pipelineValue: pValue,
          conversionRate: leads.length > 0 ? (wonLeads.length / leads.length * 100).toFixed(1) : 0,
          totalLeads: leads.length,
          totalClients: wonLeads.length,
          panierMoyen: wonLeads.length > 0 ? ca / wonLeads.length : 0,
          clientsActifs: wonLeads.length, // Simplifié pour le test
          topClients: wonLeads.sort((a,b) => b.valeur_estimee - a.valeur_estimee).slice(0,3)
        });
      }
    };
    fetchStats();
  }, []);

  if (!isClient) return null;

  return (
    <div className="p-8 space-y-12 bg-slate-50 min-h-screen font-sans">
      
      {/* SECTION 1 : PERFORMANCE COMMERCIALE */}
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-800 border-b pb-4">📈 1. Performance & Ventes</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="CA Total" value={`${stats.totalCA.toLocaleString()} €`} color="text-indigo-600" />
          <StatCard title="Transformation" value={`${stats.conversionRate} %`} color="text-emerald-600" />
          <StatCard title="Panier Moyen" value={`${Math.round(stats.panierMoyen).toLocaleString()} €`} color="text-purple-600" />
          <StatCard title="Valeur Pipeline" value={`${stats.pipelineValue.toLocaleString()} €`} color="text-orange-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartContainer title="Évolution du Chiffre d'Affaires">
            <LineChart data={stats.caEvolution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} dot={{r: 6}} />
            </LineChart>
          </ChartContainer>

          <ChartContainer title="Pipeline par Étape">
            <BarChart data={stats.pipelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" fontSize={10}/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ChartContainer>
        </div>
      </section>

      {/* SECTION 2 : LEADERBOARD & MARKETING */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-6 text-slate-800">🥇 Classement des Commerciaux</h2>
          <div className="space-y-4">
            {stats.leaderboard.map((comm: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-slate-300">#{i+1}</span>
                  <div>
                    <p className="font-bold text-slate-700">{comm.name}</p>
                    <p className="text-xs text-slate-500">{comm.ventes} ventes conclues</p>
                  </div>
                </div>
                <span className="font-black text-indigo-600">{comm.ca.toLocaleString()} €</span>
              </div>
            ))}
          </div>
        </div>

        <ChartContainer title="Source des Leads (Marketing)">
          <PieChart>
            <Pie data={stats.statsSource} innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" label>
              {stats.statsSource.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartContainer>
      </section>

      {/* SECTION 3 : CLIENTS */}
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-800 border-b pb-4">👥 2. Analyse Clients</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ChartContainer title="Répartition par Ville">
            <PieChart>
              <Pie data={stats.statsVille} dataKey="value" nameKey="name" label>
                {stats.statsVille.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip/><Legend/>
            </PieChart>
          </ChartContainer>
          
          {/* Top Clients LTV */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
            <h2 className="text-lg font-bold mb-6 text-slate-700">🏆 Top Clients (Lifetime Value)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.topClients.map((c: any, i: number) => (
                <div key={i} className="p-4 bg-indigo-50 rounded-xl border-t-4 border-indigo-500">
                   <p className="text-xs font-bold text-indigo-400 uppercase">Client Elite</p>
                   <p className="font-bold text-slate-700 mt-1">{c.nom}</p>
                   <p className="text-xl font-black text-indigo-600 mt-2">{Number(c.valeur_estimee).toLocaleString()} €</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helpers
function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:scale-105 transition-transform">
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
      <p className={`text-3xl font-black mt-2 ${color}`}>{value}</p>
    </div>
  );
}

function ChartContainer({ title, children }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
      <h2 className="text-lg font-bold mb-6 text-slate-700">{title}</h2>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  );
}