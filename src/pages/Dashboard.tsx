import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Users, FileText, ClipboardList, GraduationCap, ArrowRight, UserPlus, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    questions: 0,
    exams: 0,
    students: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [u, q, e] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase.from('exams').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      users: u.count || 0,
      questions: q.count || 0,
      exams: e.count || 0,
      students: 0, // Placeholder
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-red-500 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl shadow-primary/20 relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-5xl font-black mb-4 italic tracking-tighter">
            {getGreeting()},<br/>{user?.name}! 👋
          </h1>
          <p className="text-white/80 text-lg max-w-xl font-bold">
            Selamat datang di sistem CBT SMK Prima Unggul. Anda masuk sebagai <span className="underline capitalize">{user?.role}</span>.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            {user?.role === 'admin' && (
              <Link to="/app/users" className="bg-white text-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all">
                <UserPlus className="w-5 h-5" /> Kelola Admin & Guru
              </Link>
            )}
            {user?.role === 'guru' && (
              <Link to="/app/exams" className="bg-white text-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all">
                <FileText className="w-5 h-5" /> Buat Ujian Baru
              </Link>
            )}
            {user?.role === 'siswa' && (
              <Link to="/app/daftar-ujian" className="bg-white text-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all">
                <ClipboardList className="w-5 h-5" /> Lihat Jadwal Ujian
              </Link>
            )}
          </div>
        </div>
        
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={stats.users} 
          color="bg-blue-50 text-blue-600" 
          delay={0.1}
        />
        <StatCard 
          icon={FileText} 
          label="Bank Soal" 
          value={stats.questions} 
          color="bg-purple-50 text-purple-600" 
          delay={0.2}
        />
        <StatCard 
          icon={ClipboardList} 
          label="Ujian Aktif" 
          value={stats.exams} 
          color="bg-amber-50 text-amber-600" 
          delay={0.3}
        />
        <StatCard 
          icon={GraduationCap} 
          label="Hasil Siswa" 
          value="-" 
          color="bg-emerald-50 text-emerald-600" 
          delay={0.4}
        />
      </div>

      {/* Shortcuts / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-4">Aktivitas Terbaru</h3>
           <div className="bg-white rounded-[2rem] border border-gray-100 p-8 text-center">
             <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-gray-300 w-10 h-10" />
             </div>
             <p className="text-gray-400 font-medium">Belum ada aktivitas baru dari Anda.</p>
           </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-4">Panduan Cepat</h3>
          <div className="space-y-4">
            <GuideItem title="Cara Membuat Soal" desc="Panduan bagi guru untuk mengelola bank soal." />
            <GuideItem title="Panduan Ujian" desc="Aturan dan tata tertib selama mengerjakan ujian." />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-8 rounded-[2rem] border border-slate-200 flex items-center gap-6 shadow-sm hover:shadow-md transition-all group"
  >
    <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform", color)}>
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
  </motion.div>
);

const GuideItem = ({ title, desc }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary transition-all cursor-pointer group">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-extrabold text-slate-900 mb-1 transition-colors">{title}</h4>
        <p className="text-sm text-slate-500 font-medium">{desc}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </div>
  </div>
);

import { cn } from '../lib/utils';
export default Dashboard;
