'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Enregistrement des composants Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function DashboardPage() {
  const [chartData, setChartData] = useState<any>(null);
  const [totalStats, setTotalStats] = useState({ montant: 0, count: 0 });

  useEffect(() => {
    async function getDashboardData() {
      const { data: leads } = await supabase.from('leads').select('statut, montant');

      if (leads) {
        // 1. Calcul des totaux pour les chiffres clés
        const totalAmount = leads.reduce((acc, curr) => acc + (curr.montant || 0), 0);
        setTotalStats({ montant: totalAmount, count: leads.length });

        // 2. Préparation des données pour les graphiques
        const distribution = leads.reduce((acc: any, curr) => {
          acc[curr.statut] = (acc[curr.statut] || 0) + (curr.montant || 0);
          return acc;
        }, {});

        setChartData({
          labels: Object.keys(distribution),
          datasets: [
            {
              label: 'Valeur par étape (€)',
              data: Object.values(distribution),
              backgroundColor: [
                '#3b82f6', // Bleu (Nouveau)
                '#6366f1', // Indigo (Estimation)
                '#f59e0b', // Ambre (Mandat)
                '#8b5cf6', // Violet (Visites)
                '#f43f5e', // Rose (Compromis)
                '#10b981', // Emeraude (Vendu)
              ],
              borderWidth: 1,
            },
          ],
        });
      }
    }
    getDashboardData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Tableau de Bord Commercial</h1>

      {/* CHIFFRES CLÉS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <p className="text-slate-500 font-medium">Valeur Totale du Pipeline</p>
          <p className="text-4xl font-black text-blue-600 mt-2">{totalStats.montant.toLocaleString()} €</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <p className="text-slate-500 font-medium">Nombre d'Affaires</p>
          <p className="text-4xl font-black text-slate-800 mt-2">{totalStats.count}</p>
        </div>
      </div>

      {/* GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique en Camembert (Funnel de répartition) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-700 mb-6 text-center">Répartition de la Valeur (€)</h2>
          <div className="h-[300px] flex justify-center">
            {chartData ? <Pie data={chartData} options={{ maintainAspectRatio: false }} /> : <p>Chargement...</p>}
          </div>
        </div>

        {/* Graphique en Barres (Suivi du cycle de vente) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-700 mb-6 text-center">Montant par Étape du Funnel</h2>
          <div className="h-[300px] flex justify-center">
            {chartData ? <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /> : <p>Chargement...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}