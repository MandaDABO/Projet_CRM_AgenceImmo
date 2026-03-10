'use client';
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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Email ou mot de passe incorrect");
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-indigo-600 tracking-tighter">Immo<span className="text-slate-800">CRM</span></h1>
          <p className="text-slate-400 font-medium mt-2">Bienvenue sur votre espace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input required type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border rounded-2xl outline-indigo-500 font-medium"
            onChange={(e) => setEmail(e.target.value)} />
          
          <input required type="password" placeholder="Mot de passe" className="w-full p-4 bg-slate-50 border rounded-2xl outline-indigo-500 font-medium"
            onChange={(e) => setPassword(e.target.value)} />

          <button disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">
            {loading ? 'Connexion...' : 'SE CONNECTER'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-500">
          Pas encore de compte ? <button onClick={() => router.push('/register')} className="text-indigo-600 font-bold hover:underline">S'inscrire</button>
        </p>
      </div>
    </div>
  );
}