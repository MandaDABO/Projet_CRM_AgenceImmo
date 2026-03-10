'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FiTrendingUp, FiUsers, FiCalendar, FiAlertCircle, 
  FiPlus, FiX, FiCheck, FiBriefcase, FiClock 
} from 'react-icons/fi';

export default function SmartDashboard() {
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]); // État pour la liste des leads
  
  const [newRdv, setNewRdv] = useState({
    title: '',
    description: '',
    contact_id: '',
    lead_id: '', // Ajout du lien vers le lead
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00',
    type_rdv: 'Visite'
  });

  const [data, setData] = useState<any>({
    caMois: 0,
    objectifAtteint: 0,
    nouveauxProspects: 0,
    rdvDuJour: [],
    tachesUrgentes: []
  });

  const fetchDashboardData = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    
    const { data: rdvData } = await supabase
      .from('appointments')
      .select('*, contacts (nom, prenom)')
      .eq('commercial_id', userId)
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true });

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('commercial_id', userId)
      .eq('est_completee', false);

    const { data: leadsData } = await supabase.from('leads').select('*');
    
    if (leadsData) {
      setLeads(leadsData); // On stocke les leads pour le formulaire
      const wonCeMois = leadsData.filter(l => l.statut === 'Gagné' && l.created_at >= debutMois);
      const caMois = wonCeMois.reduce((sum, l) => sum + (Number(l.valeur_estimee) || 0), 0);
      
      setData({
        caMois,
        nouveauxProspects: leadsData.filter(l => l.created_at >= debutMois).length,
        objectifAtteint: Math.min((caMois / 100000) * 100, 100).toFixed(1),
        rdvDuJour: rdvData || [],
        tachesUrgentes: tasksData?.map(t => ({
          id: t.id,
          task: t.titre,
          priority: new Date(t.date_echeance) < new Date() ? "Haute" : "Normale",
          icon: t.type === 'Appel' ? "📞" : "🤝",
          date: t.date_echeance
        })) || []
      });
    }
  };

  useEffect(() => {
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchDashboardData(user.id);
        const { data: cData } = await supabase.from('contacts').select('id, nom, prenom');
        if (cData) setContacts(cData);
      }
    };
    setup();
  }, []);

  const handleAddRdv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('appointments').insert([
      { ...newRdv, commercial_id: user.id, status: 'Planifié' }
    ]);
    if (!error) {
      setIsModalOpen(false);
      fetchDashboardData(user.id);
      setNewRdv({ ...newRdv, title: '', description: '' });
    }
  };

  const toggleStatus = async (rdvId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Terminé' ? 'Planifié' : 'Terminé';
    await supabase.from('appointments').update({ status: newStatus }).eq('id', rdvId);
    fetchDashboardData(user.id);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">SMART<span className="text-indigo-600">DASHBOARD</span></h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Agent: {user?.email}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition-all"
        >
          <FiPlus size={20} /> Programmer un RDV
        </button>
      </header>

      {/* KPI GRID (Contenu identique...) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* CA Mensuel */}
         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
          <div><p className="text-xs font-bold text-slate-400 uppercase">CA MENSUEL</p><p className="text-3xl font-black text-slate-800">{data.caMois.toLocaleString()} €</p></div>
          <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600"><FiTrendingUp size={24} /></div>
        </div>
        {/* ... autres KPIs ... */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agenda */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FiCalendar className="text-indigo-600"/> Agenda à venir</h2>
          <div className="space-y-4">
            {data.rdvDuJour.map((rdv: any) => (
              <div key={rdv.id} className="p-4 border border-slate-50 rounded-2xl flex justify-between items-center hover:bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800">{rdv.title}</p>
                  <p className="text-xs text-slate-400 font-bold">{rdv.appointment_time} - {rdv.contacts?.prenom} {rdv.contacts?.nom}</p>
                </div>
                <button onClick={() => toggleStatus(rdv.id, rdv.status)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${rdv.status === 'Terminé' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}`}><FiCheck /></button>
              </div>
            ))}
          </div>
        </section>

        {/* Tâches */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FiAlertCircle className="text-rose-500"/> Urgences</h2>
           {/* ... liste des tâches ... */}
        </section>
      </div>

      {/* --- MODAL DE RENDEZ-VOUS --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
              <h2 className="text-2xl font-black italic">NOUVEAU RDV</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleAddRdv} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Objet du RDV</label>
                <input required type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl mt-1 focus:ring-2 ring-indigo-500" placeholder="Ex: Signature Mandat" value={newRdv.title} onChange={e => setNewRdv({...newRdv, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Date</label>
                  <input required type="date" className="w-full p-4 bg-slate-50 border-none rounded-2xl mt-1" value={newRdv.appointment_date} onChange={e => setNewRdv({...newRdv, appointment_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Heure</label>
                  <input required type="time" className="w-full p-4 bg-slate-50 border-none rounded-2xl mt-1" value={newRdv.appointment_time} onChange={e => setNewRdv({...newRdv, appointment_time: e.target.value})} />
                </div>
              </div>

              {/* SÉLECTION DU LEAD (PROJET) */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Lead / Projet concerné</label>
                <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl mt-1" value={newRdv.lead_id} onChange={e => setNewRdv({...newRdv, lead_id: e.target.value})}>
                  <option value="">Choisir un lead...</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.titre} ({l.ville})</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Contact Client</label>
                <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl mt-1" value={newRdv.contact_id} onChange={e => setNewRdv({...newRdv, contact_id: e.target.value})}>
                  <option value="">Sélectionner le client...</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Enregistrer le RDV
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}