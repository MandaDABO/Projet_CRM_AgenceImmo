'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EntreprisesPage() {
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États du formulaire
  const [nom, setNom] = useState('');
  const [secteur, setSecteur] = useState('Notaire');
  const [adresse, setAdresse] = useState('');
  const [telephoneStandard, setTelephoneStandard] = useState('');

  const fetchEntreprises = async () => {
    const { data, error } = await supabase
      .from('entreprises')
      .select('*')
      .order('nom', { ascending: true });
    
    if (data) setEntreprises(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const handleAddEntreprise = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('entreprises')
      .insert([{ 
        nom, 
        secteur, 
        adresse, 
        telephone_standard: telephoneStandard 
      }]);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      // Reset formulaire
      setNom(''); setAdresse(''); setTelephoneStandard('');
      fetchEntreprises();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Annuaire des Entreprises</h1>

      {/* Formulaire d'ajout */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10 border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Nouvelle Entreprise Partenaire</h2>
        <form onSubmit={handleAddEntreprise} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input 
            type="text" placeholder="Nom de l'entreprise" value={nom}
            className="p-2 border rounded-lg outline-blue-500"
            onChange={(e) => setNom(e.target.value)} required
          />
          <select 
            className="p-2 border rounded-lg outline-blue-500 bg-white"
            value={secteur} onChange={(e) => setSecteur(e.target.value)}
          >
            <option value="Notaire">Notaire</option>
            <option value="Banque">Banque</option>
            <option value="Diagnostic">Diagnostic</option>
            <option value="Agence">Autre Agence</option>
          </select>
          <input 
            type="text" placeholder="Téléphone Standard" value={telephoneStandard}
            className="p-2 border rounded-lg outline-blue-500"
            onChange={(e) => setTelephoneStandard(e.target.value)}
          />
          <input 
            type="text" placeholder="Adresse complète" value={adresse}
            className="p-2 border rounded-lg outline-blue-500 lg:col-span-1"
            onChange={(e) => setAdresse(e.target.value)}
          />
          <button type="submit" className="lg:col-span-4 bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition">
            Enregistrer l'entreprise
          </button>
        </form>
      </div>

      {/* Grille d'affichage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entreprises.length === 0 && !loading ? (
          <p className="text-slate-500 italic">Aucune entreprise enregistrée.</p>
        ) : (
          entreprises.map((ent) => (
            <div key={ent.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{ent.nom}</h3>
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase">
                  {ent.secteur}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p>📍 {ent.adresse || 'Adresse non renseignée'}</p>
                <p>📞 {ent.telephone_standard || 'Pas de téléphone'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}