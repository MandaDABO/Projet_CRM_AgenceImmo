'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiHome, FiUser, FiArrowRight } from 'react-icons/fi';

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false); // État pour basculer entre login et inscription
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Pour l'inscription
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      // LOGIQUE INSCRIPTION
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName } // On stocke le nom dans les métadonnées
        }
      });
      if (error) alert(error.message);
      else alert("Compte créé ! Vérifiez vos emails pour confirmer (ou connectez-vous directement si la confirmation est désactivée).");
    } else {
      // LOGIQUE CONNEXION
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Erreur : " + error.message);
      else router.push('/dashboard/leads');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 p-10 border border-slate-100">
        
        {/* Header dynamique */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 shadow-lg">
            <FiHome className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter">
            IMMOCRM <span className="text-indigo-600">.</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] mt-2 uppercase tracking-[0.2em]">
            {isRegistering ? "Créer un accès agent" : "Portail de connexion"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {/* Champ Nom (uniquement pour l'inscription) */}
          {isRegistering && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase ml-1">Nom complet</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Jean Dupont"
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase ml-1">Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" 
                placeholder="agent@immo.com"
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase ml-1">Mot de passe</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 mt-4"
          >
            {loading ? 'Traitement...' : isRegistering ? 'CRÉER MON COMPTE' : 'SE CONNECTER'}
            <FiArrowRight />
          </button>
        </form>

        {/* Toggle bas de page */}
        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
          <p className="text-slate-500 text-sm font-medium">
            {isRegistering ? "Déjà un compte ?" : "Nouveau sur la plateforme ?"}
          </p>
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="mt-2 text-indigo-600 font-black text-sm hover:underline uppercase tracking-wider"
          >
            {isRegistering ? "Se connecter" : "Créer un compte agent"}
          </button>
        </div>
      </div>
    </div>
  );
}