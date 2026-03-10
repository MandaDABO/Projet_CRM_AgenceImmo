'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FiPlus, FiClock, FiCheckCircle, FiCircle, FiAlertCircle } from 'react-icons/fi';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  // États du formulaire
  const [titre, setTitre] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Appel');

  const fetchTasks = async (uid: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, contacts(nom, prenom)')
      .eq('commercial_id', uid)
      .order('date_echeance', { ascending: true });
    
    if (data) setTasks(data);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchTasks(user.id);
      }
    };
    init();
  }, []);

  // FONCTION CLÉ : Met à jour le statut "est_completee"
  const handleToggleStatus = async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ est_completee: !currentStatus })
      .eq('id', taskId);

    if (!error && userId) {
      fetchTasks(userId); // Recharge la liste pour voir le changement
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const { error } = await supabase.from('tasks').insert([
      { titre, date_echeance: date, type, commercial_id: userId, est_completee: false }
    ]);
    if (!error) {
      setTitre(''); setDate('');
      fetchTasks(userId);
    }
  };

  // Configuration du calendrier : les tâches finies apparaissent en gris/barré
  const calendarEvents = tasks.map(t => ({
    id: t.id,
    title: `${t.est_completee ? '✅ ' : ''}${t.titre}`,
    start: t.date_echeance,
    backgroundColor: t.est_completee ? '#cbd5e1' : (t.type === 'Appel' ? '#3b82f6' : '#10b981'),
    borderColor: 'transparent',
    extendedProps: { est_completee: t.est_completee }
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-800">AGENDA & <span className="text-blue-600">SUIVI</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          
          {/* FORMULAIRE D'AJOUT */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="font-bold mb-4 text-slate-800">Nouvelle mission</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Titre..." value={titre} onChange={(e) => setTitre(e.target.value)} required />
              <input className="w-full p-3 bg-slate-50 border rounded-xl text-sm" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">AJOUTER</button>
            </form>
          </div>

          {/* LISTE DES TÂCHES AVEC UPDATE DE STATUT */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="font-bold mb-4 text-slate-800">Liste des tâches</h2>
            <div className="space-y-3">
              {tasks.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => handleToggleStatus(t.id, t.est_completee)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${t.est_completee ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                >
                  {t.est_completee ? 
                    <FiCheckCircle className="text-emerald-500 flex-shrink-0" size={20} /> : 
                    <FiCircle className="text-slate-300 flex-shrink-0" size={20} />
                  }
                  <div className="overflow-hidden">
                    <p className={`font-bold text-sm truncate ${t.est_completee ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {t.titre}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                      {new Date(t.date_echeance).toLocaleString('fr-FR', {day: 'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CALENDRIER */}
        <div className="lg:col-span-3 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            locale="fr"
            height="700px"
            // Interaction : Cliquer sur une tâche du calendrier change aussi son statut !
            eventClick={(info) => handleToggleStatus(info.event.id, info.event.extendedProps.est_completee)}
          />
        </div>
      </div>
    </div>
  );
}