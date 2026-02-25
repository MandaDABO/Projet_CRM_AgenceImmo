'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('Acheteur');

  // Fonction pour charger les contacts
  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setContacts(data);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Fonction pour ajouter un contact
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('contacts')
      .insert([{ nom, prenom, email, type }]);

    if (error) {
      alert("Erreur lors de l'ajout : " + error.message);
    } else {
      // Réinitialiser le formulaire et rafraîchir la liste
      setNom(''); setPrenom(''); setEmail('');
      fetchContacts();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Gestion des Contacts</h1>

      {/* Formulaire d'ajout */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10 border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Ajouter un nouveau contact</h2>
        <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <option value="Bailleur">Bailleur</option>
          </select>
          <button type="submit" className="md:col-span-4 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
            + Ajouter au CRM
          </button>
        </form>
      </div>

      {/* Liste des contacts */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-slate-200">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Nom complet</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400">Aucun contact trouvé.</td></tr>
            ) : (
              contacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-slate-700 font-medium">{c.prenom} {c.nom}</td>
                  <td className="px-6 py-4 text-slate-600">{c.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.type === 'Vendeur' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {c.type}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}