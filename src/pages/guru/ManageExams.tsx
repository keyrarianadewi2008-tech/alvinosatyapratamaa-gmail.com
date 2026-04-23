import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../App';
import { Exam, Question } from '../../types';
import { Plus, Search, ClipboardList, Clock, Trash2, Tag, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const ManageExams = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    duration: 60,
    selectedQuestions: [] as string[]
  });

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('exams').select('*, questions:exam_questions(question_id)');
    if (error) console.error(error);
    setExams(data || []);
    setLoading(false);
  };

  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*');
    setQuestions(data || []);
  };

  const handleToggleQuestion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestions: prev.selectedQuestions.includes(id)
        ? prev.selectedQuestions.filter(qId => qId !== id)
        : [...prev.selectedQuestions, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.selectedQuestions.length === 0) {
      alert('Pilih minimal satu soal!');
      return;
    }

    try {
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert([{ 
          title: formData.title, 
          duration: formData.duration, 
          created_by: user?.id 
        }])
        .select()
        .single();

      if (examError) throw examError;

      const examQuestions = formData.selectedQuestions.map(qId => ({
        exam_id: exam.id,
        question_id: qId
      }));

      const { error: eqError } = await supabase.from('exam_questions').insert(examQuestions);
      if (eqError) throw eqError;

      setIsModalOpen(false);
      setFormData({ title: '', duration: 60, selectedQuestions: [] });
      fetchExams();
    } catch (err) {
      console.error(err);
      alert('Gagal membuat ujian.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus ujian ini?')) return;
    await supabase.from('exams').delete().eq('id', id);
    fetchExams();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Manajemen Ujian</h1>
          <p className="text-gray-500 font-medium">Buat dan atur jadwal ujian untuk siswa.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Buat Ujian
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <p className="text-gray-400">Loading exams...</p>
        ) : exams.length === 0 ? (
           <p className="text-gray-400">Belum ada ujian yang dibuat.</p>
        ) : exams.map(exam => (
          <motion.div 
            key={exam.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{exam.title}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> {exam.duration} Min
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold uppercase tracking-wider border border-gray-100">
                  <Tag className="w-3.5 h-3.5" /> {exam.questions?.length || 0} Soal
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <button 
                onClick={() => handleDelete(exam.id)}
                className="text-red-400 hover:text-red-600 font-bold text-sm transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Hapus
              </button>
              <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase">
                Aktif
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-primary p-8 text-white shrink-0">
                <h2 className="text-2xl font-black">Buat Ujian Baru</h2>
                <p className="text-white/80 font-medium">Pilih soal-soal yang akan diujikan kepada siswa.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Judul Ujian</label>
                       <input 
                         type="text" 
                         value={formData.title} 
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         placeholder="Contoh: UAS Pemrograman Dasar"
                         className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:border-primary outline-none transition-all font-bold placeholder:font-normal"
                         required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Durasi (Menit)</label>
                       <input 
                         type="number" 
                         value={formData.duration} 
                         onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                         className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:border-primary outline-none transition-all font-bold"
                         required
                       />
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <label className="text-sm font-bold text-gray-500 uppercase tracking-wider text-primary font-black">Pilih Soal ({formData.selectedQuestions.length})</label>
                       <span className="text-xs text-gray-400 font-bold">{questions.length} Soal Tersedia</span>
                     </div>
                     <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 overflow-hidden divide-y divide-gray-100 h-[300px] overflow-y-auto">
                        {questions.length === 0 ? (
                          <div className="p-8 text-center text-gray-400">Belum ada bank soal tersedia.</div>
                        ) : questions.map(q => (
                          <div 
                            key={q.id} 
                            onClick={() => handleToggleQuestion(q.id)}
                            className={cn(
                              "p-4 cursor-pointer flex items-start gap-3 transition-colors",
                              formData.selectedQuestions.includes(q.id) ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-white"
                            )}
                          >
                             <div className={cn(
                               "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2",
                               formData.selectedQuestions.includes(q.id) ? "bg-primary border-primary" : "bg-white border-gray-200"
                             )}>
                               {formData.selectedQuestions.includes(q.id) && <CheckCircle2 className="text-white w-4 h-4" />}
                             </div>
                             <p className="text-sm font-bold text-gray-900 line-clamp-2">{q.question}</p>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all">Batal</button>
                  <button type="submit" className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">Publikasikan Ujian</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageExams;
