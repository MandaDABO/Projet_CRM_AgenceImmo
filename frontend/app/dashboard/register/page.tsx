'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // État pour le nom
  const [role, setRole] = useState('agent');    // État pour le rôle
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // INSCRIPTION : On envoie le nom dans 'options.data'
    // C'est ce qui permet au Trigger SQL de récupérer le nom via raw_user_meta_data
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });

    if (error) {
      alert("Erreur lors de l'inscription : " + error.message);
    } else {
      alert("Compte créé avec succès ! Votre profil est en cours de configuration.");
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-indigo-600 tracking-tighter">Rejoindre <span className="text-slate-800">ImmoCRM</span></h1>
          <p className="text-slate-400 font-medium mt-2">Créez votre accès collaborateur</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* CHAMP NOM COMPLET */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Nom Complet</label>
            <input required type="text" placeholder="ex: Jean Dupont" 
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-indigo-500 font-medium"
              onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Email Pro</label>
            <input required type="email" placeholder="email@agence.com" 
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-indigo-500 font-medium"
              onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Mot de passe</label>
            <input required type="password" placeholder="••••••••" 
              className="w-full p-4 bg-slate-50 border rounded-2xl outline-indigo-500 font-medium"
              onChange={(e) => setPassword(e.target.value)} />
          </div>

          {/* SÉLECTEUR DE RÔLE */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Fonction</label>
            <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-indigo-500 font-bold text-slate-700"
              value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="agent">Agent (Commercial)</option>
              <option value="admin">Directeur (Admin)</option>
            </select>
          </div>

          <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 mt-4">
            {loading ? 'Création du compte...' : "S'INSCRIRE MAINTENANT"}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-500 font-medium">
          Déjà un compte ? <button onClick={() => router.push('/login')} className="text-indigo-600 font-bold hover:underline">Se connecter</button>
        </p>
      </div>
    </div>
  );
}