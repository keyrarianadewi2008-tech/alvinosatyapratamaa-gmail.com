import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../App';
import { Exam, Question } from '../../types';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const TakeExam = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchExamData();
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const fetchExamData = async () => {
    if (!examId) return;
    try {
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();
      
      if (examError) throw examError;

      const { data: qData, error: qError } = await supabase
        .from('exam_questions')
        .select('question_id, questions(*)')
        .eq('exam_id', examId);
      
      if (qError) throw qError;

      const items = qData.map(item => item.questions as unknown as Question);
      setExam(examData);
      setQuestions(items);
      setTimeLeft(examData.duration * 60);
    } catch (err) {
      console.error(err);
      navigate('/app/daftar-ujian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 && !loading && questions.length > 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, questions.length]);

  const handleSubmit = async () => {
    console.log('Attempting submit...', { userId: user?.id, examId, questionsLength: questions.length });
    
    if (submitting) return;
    if (!user?.id) {
      alert('Sesi login hilang. Silakan login kembali.');
      return;
    }
    if (questions.length === 0) {
      alert('Ujian tidak memiliki soal.');
      return;
    }

    setSubmitting(true);
    
    try {
      let correctCount = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          correctCount++;
        }
      });
      
      const totalQuestions = questions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      console.log('Submitting result:', { user_id: user.id, exam_id: examId, score });

      const { data, error: insertError } = await supabase
        .from('results')
        .insert([{
          user_id: user.id,
          exam_id: examId,
          score: score
        }])
        .select();

      if (insertError) {
        console.error('Database Insert Error:', insertError);
        throw new Error(insertError.message || 'Gagal menyimpan ke database');
      }

      console.log('Result saved successfully:', data);
      navigate('/app/hasil-ujian');
    } catch (err: any) {
      console.error('Submit failed:', err);
      alert(`ERROR SUBMIT!\n\nPesan: ${err.message || 'Terjadi kesalahan sistem'}\n\nSolusi: Pastikan SQL Policy di Supabase sudah dijalankan.`);
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 font-bold animate-pulse">Memuat Ujian...</p>
    </div>
  );

  if (questions.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-black text-gray-900 mb-2">Ujian Tidak Memiliki Soal</h2>
      <p className="text-gray-500 mb-8">Ujian ini tersedia namun belum ada soal yang ditambahkan oleh Guru.</p>
      <button onClick={() => navigate('/app/daftar-ujian')} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold">Kembali</button>
    </div>
  );

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Sedang Berlangsung</h2>
          <p className="text-xl font-extrabold text-slate-900 leading-none">{exam?.title}</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Sisa Waktu</p>
            <p className="text-2xl font-black text-primary tabular-nums leading-none">{formatTime(timeLeft)}</p>
          </div>
          <button 
            onClick={() => navigate('/app')}
            className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
        </div>
      </header>

      {/* Exam Area */}
      <div className="flex-1 p-8 flex space-x-8 overflow-hidden">
        {/* Question Section */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-10 flex flex-col shadow-sm overflow-y-auto">
          <div className="mb-8">
            <span className="bg-slate-100 px-4 py-1 rounded-full text-xs font-bold text-slate-500 uppercase tracking-tighter">
              Pertanyaan {currentIdx + 1} dari {questions.length}
            </span>
            <h3 className="text-2xl font-bold text-slate-800 mt-6 leading-snug italic">
              "{currentQ.question}"
            </h3>
          </div>

          <div className="flex-1 space-y-3">
            {(['a', 'b', 'c', 'd'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setAnswers({...answers, [currentQ.id]: key})}
                className={cn(
                  "w-full group text-left p-4 rounded-xl border-2 transition-all flex items-center space-x-4",
                  answers[currentQ.id] === key 
                    ? "border-primary bg-primary/5" 
                    : "border-slate-100 bg-slate-50/50 hover:border-primary"
                )}
              >
                <span className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all",
                  answers[currentQ.id] === key 
                    ? "bg-primary text-white" 
                    : "bg-white border border-slate-200 text-slate-400 group-hover:bg-primary group-hover:text-white"
                )}>
                  {key.toUpperCase()}
                </span>
                <span className={cn(
                  "transition-all",
                  answers[currentQ.id] === key ? "font-bold text-slate-900" : "font-semibold text-slate-600"
                )}>
                  {currentQ[`option_${key}` as keyof Question]}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center bg-white sticky bottom-0">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="px-8 py-3 text-slate-400 font-bold hover:text-slate-900 flex items-center gap-2 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" /> Sebelumnya
            </button>
            <button 
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="px-10 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-dark transition-all disabled:opacity-30"
            >
              Selanjutnya
            </button>
          </div>
        </div>

        {/* Question Map */}
        <div className="w-72 flex flex-col space-y-4 shrink-0">
          <div className="bg-slate-900 text-white p-6 rounded-3xl overflow-hidden flex flex-col min-h-0">
            <h4 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4">Navigasi Soal</h4>
            <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-1 flex-1 content-start">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all",
                    currentIdx === idx 
                      ? "bg-primary text-white ring-2 ring-white/50" 
                      : answers[questions[idx].id] 
                        ? "bg-emerald-500 text-white" 
                        : "bg-white/10 text-white hover:bg-white/20"
                  )}
                >
                  {String(idx + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-white/40 italic text-center">Menampilkan {questions.length} soal</p>
          </div>
          
          <button 
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="w-full py-4 bg-white border-2 border-primary text-primary rounded-2xl font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all disabled:opacity-50"
          >
            {submitting ? 'Mengirim...' : 'Selesai Ujian'}
          </button>
        </div>
      </div>
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !submitting && setShowConfirm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 text-center overflow-hidden"
            >
              <div className="inline-flex items-center justify-center bg-amber-50 p-4 rounded-3xl mb-6">
                <Send className="text-amber-500 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Selesai Ujian?</h3>
              <p className="text-slate-500 font-medium mb-8">
                Pastikan semua jawaban Anda sudah terisi dengan benar sebelum mengirim hasil ujian.
              </p>
              
              <div className="flex gap-4">
                <button 
                  disabled={submitting}
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Kembali
                </button>
                <button 
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Ya, Kirim'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TakeExam;
