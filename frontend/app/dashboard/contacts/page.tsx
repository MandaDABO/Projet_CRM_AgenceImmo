'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [entreprises, setEntreprises] = useState<any[]>([]); // Pour la liste déroulante
  
  // États du formulaire
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('Acheteur');
  const [selectedEntreprise, setSelectedEntreprise] = useState('');

  // Charger les contacts ET les entreprises
  const fetchData = async () => {
    // On récupère les contacts + le nom de l'entreprise associée (Jointure)
    const { data: contactsData } = await supabase
      .from('contacts')
      .select('*, entreprises(nom)')
      .order('created_at', { ascending: false });
    
    // On récupère les entreprises pour le menu déroulant
    const { data: entData } = await supabase
      .from('entreprises')
      .select('id, nom')
      .order('nom');

    if (contactsData) setContacts(contactsData);
    if (entData) setEntreprises(entData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('contacts')
      .insert([{ 
        nom, 
        prenom, 
        email, 
        type, 
        entreprise_id: selectedEntreprise || null // Association ici
      }]);

    if (error) {
      alert("Erreur lors de l'ajout : " + error.message);
    } else {
      setNom(''); setPrenom(''); setEmail(''); setSelectedEntreprise('');
      fetchData();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Gestion des Contacts</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-10 border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Ajouter un nouveau contact</h2>
        <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" placeholder="Prénom" value={prenom}
            className="p-2 border rounded-lg outline-blue-500"
            onChange={(e) => setPrenom(e.target.value)} required
          />
          <input 
            type="text" placeholder="Nom" value={nom}
            className="p-2 border rounded-lg outline-blue-500"
            onChange={(e) => setNom(e.target.value)} required
          />
          <input 
            type="email" placeholder="Email" value={email}
            className="p-2 border rounded-lg outline-blue-500"
            onChange={(e) => setEmail(e.target.value)} required
          />
          
          <select 
            className="p-2 border rounded-lg outline-blue-500 bg-white"
            value={type} onChange={(e) => setType(e.target.value)}
          >
            <option value="Acheteur">Acheteur</option>
            <option value="Vendeur">Vendeur</option>
            <option value="Partenaire">Partenaire</option>
          </select>

          {/* SÉLECTEUR D'ENTREPRISE */}
          <select 
            className="p-2 border rounded-lg outline-blue-500 bg-white"
            value={selectedEntreprise} onChange={(e) => setSelectedEntreprise(e.target.value)}
          >
            <option value="">-- Choisir une entreprise --</option>
            {entreprises.map((ent) => (
              <option key={ent.id} value={ent.id}>{ent.nom}</option>
            ))}
          </select>

          <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
            + Ajouter
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-slate-200">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Nom complet</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Entreprise</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-slate-700 font-medium">{c.prenom} {c.nom}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">
                  {c.entreprises?.nom || <span className="text-slate-300">Aucune</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    c.type === 'Partenaire' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {c.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}