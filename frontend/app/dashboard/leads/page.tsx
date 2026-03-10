'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FiPlus, FiMapPin, FiFileText, FiCheckCircle } from 'react-icons/fi';

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [invoicedIds, setInvoicedIds] = useState<string[]>([]);
  const [vendeursDispo, setVendeursDispo] = useState<any[]>([]);
  const [acheteursDispo, setAcheteursDispo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const statuts = ['Nouveau', 'Prospect', 'Qualification', 'Négociation', 'Gagné', 'Perdu'];
  const categories = ['Appartement', 'Maison', 'Terrain', 'Local Commercial', 'Parking'];

  const [titre, setTitre] = useState('');
  const [montant, setMontant] = useState('');
  const [vendeurId, setVendeurId] = useState('');
  const [acheteurId, setAcheteurId] = useState('');
  const [ville, setVille] = useState('Nanterre');
  const [categorie, setCategorie] = useState('Appartement');

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    const { data: leadsData } = await supabase
      .from('leads')
      .select(`*, vendeur:contact_id(nom, prenom), acheteur:acheteur_id(nom, prenom)`)
      .eq('commercial_id', user.id)
      .order('created_at', { ascending: false });

    const { data: invoicesData } = await supabase.from('invoices').select('lead_id');
    const ids = invoicesData?.map(inv => inv.lead_id) || [];
    setInvoicedIds(ids);

    const { data: vData } = await supabase.from('contacts').select('id, nom, prenom').eq('type', 'Vendeur');
    const { data: aData } = await supabase.from('contacts').select('id, nom, prenom').eq('type', 'Acheteur');

    if (leadsData) setLeads(leadsData);
    if (vData) setVendeursDispo(vData);
    if (aData) setAcheteursDispo(aData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !vendeurId) return;

    const payload = { 
      titre, 
      valeur_estimee: parseFloat(montant) || 0,
      contact_id: vendeurId,
      acheteur_id: acheteurId || null,
      statut: 'Prospect', 
      ville,
      categorie_service: categorie,
      commercial_id: currentUser.id,
      commercial_nom: currentUser.user_metadata?.full_name || currentUser.email
    };

    const { error } = await supabase.from('leads').insert([payload]);
    if (!error) {
      setTitre(''); setMontant(''); setVendeurId(''); setAcheteurId('');
      fetchData();
    }
  };

  const handleGenerateInvoice = async (lead: any) => {
    if (invoicedIds.includes(lead.id)) return;
    const commission = (lead.valeur_estimee || 0) * 0.05;
    const payload = {
      lead_id: lead.id,
      commercial_id: currentUser.id,
      vendeur_nom: `${lead.vendeur?.prenom || ''} ${lead.vendeur?.nom || 'Inconnu'}`,
      acheteur_nom: lead.acheteur ? `${lead.acheteur?.prenom || ''} ${lead.acheteur?.nom || ''}` : "Non spécifié",
      projet_nom: lead.titre,
      montant_total: lead.valeur_estimee,
      commission_agence: commission
    };

    const { error } = await supabase.from('invoices').insert([payload]);
    if (!error) {
      router.push('/dashboard/finances');
    }
  };

  const onDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const onDrop = async (e: React.DragEvent, newStatut: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    const { error } = await supabase.from('leads').update({ statut: newStatut }).eq('id', leadId);
    if (!error) fetchData();
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight underline decoration-indigo-500 decoration-8 uppercase">Pipeline</h1>
        <p className="text-slate-700 font-bold mt-2 italic">Commercial : {currentUser?.email}</p>
      </div>

      {/* FORMULAIRE - Texte forcé en NOIR */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900">
          <FiPlus className="p-1 bg-indigo-100 text-indigo-600 rounded-lg"/> NOUVEAU DOSSIER
        </h2>
        <form onSubmit={handleCreateLead} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <input 
            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="Nom du projet" 
            value={titre} 
            onChange={(e) => setTitre(e.target.value)} 
            required 
          />
          <input 
            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none" 
            type="number" 
            placeholder="Prix estimé (€)" 
            value={montant} 
            onChange={(e) => setMontant(e.target.value)} 
            required 
          />

          <select 
            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" 
            value={vendeurId} 
            onChange={(e) => setVendeurId(e.target.value)} 
            required
          >
            <option value="" className="text-slate-400">-- Sélectionner Vendeur --</option>
            {vendeursDispo.map(v => <option key={v.id} value={v.id} className="text-slate-900">{v.prenom} {v.nom}</option>)}
          </select>

          <select 
            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" 
            value={acheteurId} 
            onChange={(e) => setAcheteurId(e.target.value)}
          >
            <option value="" className="text-slate-400">-- Acheteur potentiel --</option>
            {acheteursDispo.map(a => <option key={a.id} value={a.id} className="text-slate-900">{a.prenom} {a.nom}</option>)}
          </select>

          <input 
            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" 
            placeholder="Ville" 
            value={ville} 
            onChange={(e) => setVille(e.target.value)} 
          />
          
          <button type="submit" className="bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg">
            CRÉER LE LEAD
          </button>
        </form>
      </div>

      {/* KANBAN */}
      <div className="flex gap-6 overflow-x-auto pb-10">
        {statuts.map(s => (
          <div key={s} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, s)} 
            className="min-w-[340px] bg-slate-200/40 p-5 rounded-[3rem] border border-slate-200/50">
            <h3 className="font-black text-slate-600 uppercase text-[11px] mb-6 px-4 tracking-widest">{s}</h3>
            <div className="space-y-5 min-h-[500px]">
              {leads.filter(l => l.statut === s).map(lead => {
                const isAlreadyInvoiced = invoicedIds.includes(lead.id);
                return (
                  <div key={lead.id} draggable onDragStart={(e) => onDragStart(e, lead.id)}
                    className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-white hover:shadow-xl transition-all cursor-grab active:cursor-grabbing">
                    
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">{lead.categorie_service}</span>
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1"><FiMapPin/> {lead.ville}</span>
                    </div>
                    
                    <h4 className="font-bold text-slate-900 text-lg mb-2 italic">{lead.titre}</h4>
                    <div className="text-2xl font-black text-slate-900 mb-4">{lead.valeur_estimee?.toLocaleString()} €</div>
                    
                    {lead.statut === 'Gagné' && (
                      <button 
                        disabled={isAlreadyInvoiced}
                        onClick={() => handleGenerateInvoice(lead)}
                        className={`w-full mb-4 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                          isAlreadyInvoiced 
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200 shadow-none' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                        }`}
                      >
                        {isAlreadyInvoiced ? (
                          <><FiCheckCircle /> FACTURE GÉNÉRÉE</>
                        ) : (
                          <><FiFileText /> GÉNÉRER FACTURE</>
                        )}
                      </button>
                    )}

                    <div className="pt-4 border-t border-slate-100 space-y-2 text-[10px] font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[9px]">V</div>
                        {lead.vendeur?.prenom} {lead.vendeur?.nom}
                      </div>
                      {lead.acheteur && (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-[9px]">A</div>
                          {lead.acheteur?.prenom} {lead.acheteur?.nom}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}