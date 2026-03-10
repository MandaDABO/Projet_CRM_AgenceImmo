'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CommunicationsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [selectedContact, setSelectedContact] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  // 1. AJOUT DE L'ÉTAT POUR LA DATE
  const [dateProgrammee, setDateProgrammee] = useState('');

  const fetchData = async () => {
    const { data: c } = await supabase.from('contacts').select('id, nom, prenom, email');
    const { data: t } = await supabase.from('email_templates').select('*');
    const { data: l } = await supabase.from('communications_logs')
      .select('*, contacts(nom, prenom)')
      .order('envoye_le', { ascending: false });
    
    if (c) setContacts(c);
    if (t) setTemplates(t);
    if (l) setLogs(l);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSend = async () => {
    const contact = contacts.find(c => c.id === selectedContact);
    const template = templates.find(t => t.id === selectedTemplate);

    if (!contact || !template) return alert("Sélectionnez un contact et un modèle");

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: contact.email,
        nom: contact.nom,
        sujet: template.sujet,
        corps: template.corps.replace('{{prenom}}', contact.prenom),
        // 2. ENVOI DE LA DATE FORMATÉE À L'API
        dateProgrammee: dateProgrammee ? new Date(dateProgrammee).toISOString() : null
      }),
    });

    if (res.ok) {
      await supabase.from('communications_logs').insert([
        { contact_id: contact.id, sujet: template.sujet }
      ]);
      alert(dateProgrammee ? "Email programmé avec succès !" : "Email envoyé immédiatement !");
      setDateProgrammee(''); // Reset la date
      fetchData();
    } else {
      alert("Erreur Brevo : Vérifiez votre clé API ou votre expéditeur.");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Centre de Communication</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FORMULAIRE D'ENVOI (À GAUCHE) */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 h-fit">
          <h2 className="text-lg font-bold mb-6 text-indigo-600 flex items-center">
            <span className="mr-2">✉️</span> Programmation Email
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destinataire</label>
              <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm" value={selectedContact} onChange={(e) => setSelectedContact(e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
              <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
              </select>
            </div>

            {/* 3. CHAMP DE PROGRAMMATION PLACÉ ICI */}
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <label className="block text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wider">
                📅 Planifier l'envoi (Optionnel)
              </label>
              <input 
                type="datetime-local" 
                className="w-full p-2 border border-indigo-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={dateProgrammee}
                onChange={(e) => setDateProgrammee(e.target.value)}
              />
              <p className="text-[10px] text-indigo-400 mt-2">
                Si vide, l'email partira à l'instant même.
              </p>
            </div>

            <button 
              onClick={handleSend}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
            >
              🚀 Valider l'envoi
            </button>
          </div>
        </div>

        {/* HISTORIQUE DES ENVOIS (À DROITE) */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h2 className="text-lg font-bold mb-6 text-slate-700">Historique</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <p className="text-slate-400 italic">Aucun email envoyé.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{log.contacts?.prenom} {log.contacts?.nom}</p>
                    <p className="text-indigo-600 text-xs">{log.sujet}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block mb-1">
                      {new Date(log.envoye_le).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                      Traité
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}