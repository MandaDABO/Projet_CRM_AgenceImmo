'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [titre, setTitre] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Appel');

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, contacts(nom, prenom)')
      .order('date_echeance', { ascending: true });
    if (data) setTasks(data);
  };

  useEffect(() => { 
    fetchTasks();
    // Demander la permission pour les notifications dès le chargement
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const notifyUser = (taskTitle: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Nouvelle échéance", {
        body: `Rappel créé : ${taskTitle}`,
      });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('tasks').insert([
      { titre, date_echeance: date, type }
    ]);
    if (!error) {
      notifyUser(titre); // Notifie l'utilisateur
      setTitre(''); setDate('');
      fetchTasks();
    }
  };

  const calendarEvents = tasks.map(t => ({
    id: t.id,
    title: `${t.type}: ${t.titre}`,
    start: t.date_echeance,
    backgroundColor: t.type === 'Appel' ? '#3b82f6' : t.type === 'Rendez-vous' ? '#10b981' : '#f59e0b',
    borderColor: 'transparent'
  }));

  // CALCUL DES TÂCHES URGENTES (Avant le return)
  const urgentTasks = tasks.filter(t => {
    const isToday = new Date(t.date_echeance).toDateString() === new Date().toDateString();
    const isPast = new Date(t.date_echeance) < new Date();
    return (isToday || isPast) && !t.est_completee;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Agenda & Tâches</h1>

      {/* 2. ALERTE TÂCHES URGENTES (Placée ici pour être visible) */}
      {urgentTasks.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center justify-between rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <span className="text-xl mr-3">⏰</span>
            <div>
              <p className="font-bold">Attention !</p>
              <p className="text-sm">Vous avez {urgentTasks.length} tâche(s) en retard ou pour aujourd'hui.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* COLONNE GAUCHE */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <h2 className="font-bold mb-4">Nouvelle Tâche</h2>
            <form onSubmit={handleAddTask} className="space-y-3">
              <input 
                className="w-full p-2 border rounded" placeholder="Quoi faire ?"
                value={titre} onChange={(e) => setTitre(e.target.value)} required 
              />
              <input 
                className="w-full p-2 border rounded" type="datetime-local"
                value={date} onChange={(e) => setDate(e.target.value)} required 
              />
              <select className="w-full p-2 border rounded bg-white" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Appel">📞 Appel</option>
                <option value="Rendez-vous">🤝 Rendez-vous</option>
                <option value="Rappel">🔔 Rappel</option>
              </select>
              <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Ajouter</button>
            </form>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border max-h-[400px] overflow-y-auto">
            <h2 className="font-bold mb-4">À faire</h2>
            {tasks.filter(t => !t.est_completee).map(t => (
              <div key={t.id} className="p-3 border-b last:border-0 text-sm hover:bg-slate-50">
                <p className="font-semibold text-slate-800">{t.titre}</p>
                <p className="text-xs text-slate-500">{new Date(t.date_echeance).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNE DROITE : CALENDRIER */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            locale="fr"
            height="700px"
          />
        </div>
      </div>
    </div>
  );
}