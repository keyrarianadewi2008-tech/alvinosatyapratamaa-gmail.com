import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../App';
import { Result } from '../../types';
import { Award, Calendar, CheckCircle2, Trophy, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const ExamResults = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*, exams(title)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-1">Hasil Ujian Anda</h1>
        <p className="text-gray-500 font-medium">Lihat riwayat dan nilai ujian yang telah Anda kerjakan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <p className="text-gray-400">Loading results...</p>
        ) : results.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-[2rem] border border-gray-100 p-12 text-center">
             <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-bold">Belum ada hasil ujian tersedia.</p>
          </div>
        ) : results.map((result, idx) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8">
               <Award className={cn(
                 "w-12 h-12 transition-all group-hover:scale-110",
                 result.score >= 75 ? "text-amber-400" : "text-gray-300"
               )} />
            </div>

            <div className="space-y-6 relative">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{result.exams?.title || 'Unknown Exam'}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                   <Calendar className="w-3.5 h-3.5" />
                   {new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <div className="flex items-end gap-1">
                <span className={cn(
                  "text-6xl font-black leading-none",
                  result.score >= 75 ? "text-primary" : "text-gray-900"
                )}>
                  {Math.round(result.score)}
                </span>
                <span className="text-xl font-bold text-gray-400 mb-1">/ 100</span>
              </div>

              <div className="pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  {result.score >= 75 ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 italic">
                      <CheckCircle2 className="w-4 h-4" /> Lulus Kompetensi
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100 italic">
                      <Clock className="w-4 h-4" /> Remedial Diperlukan
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Background design */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

import { cn } from '../../lib/utils';
export default ExamResults;
