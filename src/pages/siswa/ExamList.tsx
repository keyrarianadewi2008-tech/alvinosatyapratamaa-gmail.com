import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../App';
import { Exam } from '../../types';
import { ClipboardList, Clock, Play, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const ExamList = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamsAndResults();
  }, []);

  const fetchExamsAndResults = async () => {
    setLoading(true);
    try {
      const [exRes, resRes] = await Promise.all([
        supabase.from('exams').select('*, questions:exam_questions(question_id)'),
        supabase.from('results').select('*').eq('user_id', user?.id)
      ]);

      setExams(exRes.data || []);
      setResults(resRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isCompleted = (examId: string) => results.some(r => r.exam_id === examId);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">Daftar Ujian</h1>
        <p className="text-gray-500 font-medium">Pilih ujian yang tersedia untuk Anda kerjakan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-400">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="text-gray-400">Tidak ada ujian tersedia saat ini.</p>
        ) : exams.map((exam, idx) => {
          const completed = isCompleted(exam.id);
          const qCount = exam.questions?.length || 0;

          return (
            <motion.div 
              key={exam.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
            >
              {completed && (
                <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Selesai
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 pr-12">{exam.title}</h3>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-500 border border-gray-100">
                    <Clock className="w-4 h-4" /> {exam.duration} Menit
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-500 border border-gray-100">
                    <ClipboardList className="w-4 h-4" /> {qCount} Soal
                  </div>
                </div>
              </div>

              {completed ? (
                <Link 
                  to="/app/hasil-ujian"
                  className="w-full bg-gray-50 text-gray-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
                >
                  Lihat Hasil
                </Link>
              ) : (
                <Link 
                  to={`/exam/${exam.id}`}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-xl shadow-primary/10 group-hover:shadow-primary/20"
                >
                  <Play className="w-5 h-5 fill-current" /> Kerjakan Ujian
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamList;
