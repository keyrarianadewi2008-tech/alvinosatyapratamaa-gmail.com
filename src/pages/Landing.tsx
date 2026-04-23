import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { GraduationCap, BookOpen, Users, Award, Layout, ShieldCheck } from 'lucide-react';

const Landing = () => {
  const departments = [
    { name: 'TKJ', desc: 'Teknik Komputer & Jaringan' },
    { name: 'DKV', desc: 'Desain Komunikasi Visual' },
    { name: 'AK', desc: 'Akuntansi' },
    { name: 'BC', desc: 'Broadcasting' },
    { name: 'MPLB', desc: 'Manajemen Perkantoran & Layanan Bisnis' },
    { name: 'BD', desc: 'Bisnis Digital' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight">CBT <span className="text-primary">PRIMA UNGGUL</span></span>
          </div>
          <Link
            to="/login"
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full font-semibold transition-all shadow-lg shadow-primary/20"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-6 leading-none italic tracking-tighter">
              SISTEM UJIAN<br/><span className="text-primary not-italic uppercase">PRIMA UNGGUL</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 font-bold">
              Platform Computer Based Test (CBT) yang dirancang untuk memudahkan proses evaluasi belajar mengajar dengan aman, cepat, dan transparan.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary-dark transition-all flex items-center gap-2"
              >
                Mulai Sekarang <Layout className="w-5 h-5" />
              </Link>
              <a
                href="#jurusan"
                className="bg-white border-2 border-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg hover:border-primary/30 transition-all"
              >
                Lihat Jurusan
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Ujian Aman</h3>
            <p className="text-gray-600">Sistem terenkripsi dan terlindungi untuk menjaga integritas hasil ujian siswa.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Bank Soal Terpadu</h3>
            <p className="text-gray-600">Manajemen soal yang mudah bagi guru untuk berbagai mata pelajaran dan jurusan.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-red-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Award className="text-primary w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Hasil Instan</h3>
            <p className="text-gray-600">Nilai langsung muncul setelah ujian selesai dikerjakan oleh siswa.</p>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section id="jurusan" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Jurusan Unggulan</h2>
            <p className="text-gray-600">Berbagai kompetensi keahlian yang tersedia di SMK Prima Unggul</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, idx) => (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden bg-white p-8 rounded-3xl border-2 border-gray-50 hover:border-primary/20 transition-all cursor-default"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl font-black text-gray-100 group-hover:text-primary/10 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Users className="text-gray-400 group-hover:text-primary w-6 h-6" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{dept.name}</h4>
                <p className="text-gray-500 leading-relaxed">{dept.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl">SMK PRIMA UNGGUL</span>
          </div>
          <p className="text-gray-400 text-sm">© 2026 CBT Prima Unggul. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
