'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Liste harmonisée avec tes statistiques (Analytics)
  const statuts = ['Prospect', 'Qualification', 'Proposition envoyée', 'Négociation', 'Gagné', 'Perdu'];
  const categories = ['Appartement', 'Maison', 'Terrain', 'Local Commercial', 'Parking'];
  const commerciaux = ['Manda', 'Mariama', 'Jean', 'Sophie']; // Liste à adapter

  // États pour le nouveau lead
  const [titre, setTitre] = useState('');
  const [montant, setMontant] = useState('');
  const [contactId, setContactId] = useState('');
  const [statut, setStatut] = useState('Prospect');
  const [ville, setVille] = useState('Nanterre');
  const [categorie, setCategorie] = useState('Appartement');
  const [commercial, setCommercial] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*, contacts(nom, prenom)')
      .order('created_at', { ascending: false });
    
    const { data: contactsData } = await supabase.from('contacts').select('id, nom, prenom');

    if (leadsData) setLeads(leadsData);
    if (contactsData) setContacts(contactsData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // On prépare l'objet avec les nouveaux champs pour les stats
    const { error } = await supabase.from('leads').insert([
      { 
        titre, 
        valeur_estimee: parseFloat(montant), // On utilise le nom de colonne de la DB
        contact_id: contactId, 
        statut,
        ville,
        categorie_service: categorie, // Pour le graphique "Par type de bien"
        commercial_nom: commercial,   // Pour le graphique "Par commercial"
        date_cloture: statut === 'Gagné' ? new Date().toISOString() : null
      }
    ]);

    if (error) {
        console.error(error);
        alert("Erreur lors de la création : " + error.message);
    } else {
      setTitre(''); setMontant(''); setContactId(''); setStatut('Prospect');
      fetchData();
    }
  };

  return (
    <div className="p-8 max-w-full bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Gestion des Opportunités</h1>

      {/* Formulaire d'ajout enrichi */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
        <h2 className="text-lg font-bold mb-4 text-slate-700">🚀 Nouvelle Affaire</h2>
        <form onSubmit={handleCreateLead} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          <input 
            className="p-2 border rounded-lg" placeholder="Nom du projet (ex: Vente T3)"
            value={titre} onChange={(e) => setTitre(e.target.value)} required 
          />
          
          <input 
            className="p-2 border rounded-lg" type="number" placeholder="Budget / Prix (€)"
            value={montant} onChange={(e) => setMontant(e.target.value)} required 
          />

          <select 
            className="p-2 border rounded-lg bg-white"
            value={contactId} onChange={(e) => setContactId(e.target.value)} required
          >
            <option value="">👤 Client...</option>
            {contacts.map(c => (
              <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
            ))}
          </select>

          <select className="p-2 border rounded-lg bg-white" value={statut} onChange={(e) => setStatut(e.target.value)}>
            {statuts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <input 
            className="p-2 border rounded-lg" placeholder="Ville"
            value={ville} onChange={(e) => setVille(e.target.value)} 
          />

          <select className="p-2 border rounded-lg bg-white" value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="p-2 border rounded-lg bg-white" value={commercial} onChange={(e) => setCommercial(e.target.value)} required>
            <option value="">Assigner à...</option>
            {commerciaux.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button type="submit" className="bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Créer l'opportunité
          </button>
        </form>
      </div>

      {/* KANBAN */}
      <div className="flex gap-6 overflow-x-auto pb-8">
        {statuts.map(s => (
          <div key={s} className="min-w-[300px] flex-shrink-0">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-bold text-slate-700">{s}</h3>
              <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full font-bold">
                {leads.filter(l => l.statut === s).length}
              </span>
            </div>

            <div className="space-y-4">
              {leads.filter(l => l.statut === s).map(lead => (
                <div key={lead.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-800 leading-tight">{lead.titre}</p>
                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{lead.ville}</span>
                  </div>
                  <p className="text-indigo-600 font-black text-lg mb-3">{lead.valeur_estimee?.toLocaleString()} €</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t">
                    <span>👤 {lead.contacts?.nom}</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{lead.commercial_nom}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}