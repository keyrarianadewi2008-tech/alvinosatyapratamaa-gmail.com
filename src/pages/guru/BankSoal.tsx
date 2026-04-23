import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../App';
import { Question } from '../../types';
import { Plus, Search, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BankSoal = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<Partial<Question>>({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a',
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update({ ...formData })
          .eq('id', editingQuestion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('questions')
          .insert([{ ...formData, created_by: user?.id }]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      setEditingQuestion(null);
      setFormData({
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'a',
      });
      fetchQuestions();
    } catch (err) {
      console.error('Error:', err);
      alert('Gagal menyimpan soal.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      fetchQuestions();
    } catch (err) {
      console.error('Error:', err);
      alert('Gagal menghapus soal.');
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Bank Soal</h1>
          <p className="text-gray-500 font-medium">Kelola pertanyaan untuk ujian siswa.</p>
        </div>
        <button 
          onClick={() => {
            setEditingQuestion(null);
            setFormData({
              question: '',
              option_a: '',
              option_b: '',
              option_c: '',
              option_d: '',
              correct_answer: 'a',
            });
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Tambah Soal
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400 w-5 h-5 ml-2" />
        <input 
          type="text" 
          placeholder="Cari pertanyaan..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 font-medium"
        />
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Soal</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-center">Jawaban Benar</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-medium">Memuat data...</td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-medium">Belum ada soal. Silakan tambah soal baru.</td>
                </tr>
              ) : filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6 max-w-xl">
                    <p className="text-gray-900 font-bold line-clamp-2 mb-2">{q.question}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-semibold">
                      <span className={q.correct_answer === 'a' ? 'text-primary' : 'text-gray-400'}>A: {q.option_a}</span>
                      <span className={q.correct_answer === 'b' ? 'text-primary' : 'text-gray-400'}>B: {q.option_b}</span>
                      <span className={q.correct_answer === 'c' ? 'text-primary' : 'text-gray-400'}>C: {q.option_c}</span>
                      <span className={q.correct_answer === 'd' ? 'text-primary' : 'text-gray-400'}>D: {q.option_d}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-primary/10 text-primary uppercase font-black px-4 py-2 rounded-xl border border-primary/20">
                      Opsi {q.correct_answer}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingQuestion(q);
                          setFormData(q);
                          setIsModalOpen(true);
                        }}
                        className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all border border-gray-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tool - Since I can't use complex portal libs easily, I'll use simple absolute overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-primary p-8 text-white">
                <h2 className="text-2xl font-black">{editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}</h2>
                <p className="text-white/80 font-medium">Pastikan data pertanyaan dan opsi jawaban sudah benar.</p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pertanyaan</label>
                  <textarea 
                    value={formData.question} 
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:border-primary outline-none transition-all min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                    <div key={opt} className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Opsi {opt.toUpperCase()}</label>
                      <input 
                        type="text" 
                        value={formData[`option_${opt}` as keyof Question] as string}
                        onChange={(e) => setFormData({...formData, [`option_${opt}`]: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:border-primary outline-none transition-all"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Jawaban Benar</label>
                  <div className="flex flex-wrap gap-4">
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData({...formData, correct_answer: opt})}
                        className={cn(
                          "px-8 py-4 rounded-xl font-black text-lg transition-all border-2",
                          formData.correct_answer === opt 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                            : "bg-white text-gray-400 border-gray-100 hover:border-primary/20"
                        )}
                      >
                        {opt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                  >
                    Simpan Soal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { cn } from '../../lib/utils';
export default BankSoal;
