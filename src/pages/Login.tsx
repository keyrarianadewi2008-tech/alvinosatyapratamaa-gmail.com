import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { GraduationCap, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      setError('Pendaftaran berhasil! Cek email Anda untuk link aktivasi akun (Supabase mengirim email verifikasi secara default).');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100"
      >
        <div className="p-8 pt-12 text-center">
          <div className="inline-flex items-center justify-center bg-primary/10 p-4 rounded-3xl mb-6">
            <GraduationCap className="text-primary w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tighter italic">LOGIN CBT</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Sistem Ujian Online Prima Unggul</p>
        </div>

        <form onSubmit={handleLogin} className="px-8 pb-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-300 placeholder:font-black placeholder:text-[10px] placeholder:tracking-widest"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-300 placeholder:font-black placeholder:text-[10px] placeholder:tracking-widest"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 uppercase tracking-tighter text-lg"
          >
            {loading ? 'Processing...' : 'Masuk Dashboard'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={handleSignUp}
              className="text-gray-500 text-sm font-medium hover:text-primary transition-colors"
            >
              Belum punya akun? Daftar sebagai Siswa
            </button>
          </div>
        </form>

        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <Link to="/" className="text-gray-400 text-sm hover:text-gray-600 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
