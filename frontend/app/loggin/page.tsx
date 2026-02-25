'use client'; // Obligatoire pour utiliser useState et les interactions
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Tentative de connexion via Supabase Auth (Gère le JWT automatiquement)
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Erreur d'authentification : " + error.message);
    } else {
      // Redirection vers le tableau de bord en cas de succès
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="p-8 bg-white shadow-2xl rounded-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-900">ImmoCRM</h1>
          <p className="text-slate-500 mt-2">Gestion d'agence immobilière</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email professionnel</label>
            <input 
              type="email" 
              required
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
            <input 
              type="password" 
              required
              className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 transition duration-200 disabled:bg-slate-400"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}