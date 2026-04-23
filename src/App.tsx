/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from './lib/supabase';
import { AppUser } from './types';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import BankSoal from './pages/guru/BankSoal';
import ManageExams from './pages/guru/ManageExams';
import ExamList from './pages/siswa/ExamList';
import TakeExam from './pages/siswa/TakeExam';
import ExamResults from './pages/siswa/ExamResults';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signOut: async () => {} });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchUserProfile(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.code === '42501') {
          // PGRST116 = Not found, 42501 = Permission denied (often happens before first user is created)
          console.log('Profile not found, attempting to create...');
          
          // Fallback role detection: try to count users, if fails or 0, first user is admin
          let role = 'siswa';
          try {
            const { count, error: countError } = await supabase.from('users').select('*', { count: 'exact', head: true });
            if (!countError && (count === 0 || count === null)) {
              role = 'admin';
            }
          } catch (e) {
            role = 'admin'; // Assume first if we can't even count
          }

          const defaultName = email ? email.split('@')[0] : 'User';
          
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{ id: userId, role, name: defaultName }])
            .select()
            .single();
          
          if (!createError) {
            setUser(newUser);
          } else {
            console.error('Final attempt to create profile failed:', createError);
          }
        } else {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(data);
      }
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/app" />} />

          {/* Protected Routes */}
          <Route path="/app" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            
            {/* Admin Only */}
            {user?.role === 'admin' && (
              <Route path="users" element={<ManageUsers />} />
            )}

            {/* Guru/Admin */}
            {(user?.role === 'guru' || user?.role === 'admin') && (
              <>
                <Route path="bank-soal" element={<BankSoal />} />
                <Route path="exams" element={<ManageExams />} />
              </>
            )}

            {/* Siswa */}
            {user?.role === 'siswa' && (
              <>
                <Route path="daftar-ujian" element={<ExamList />} />
                <Route path="hasil-ujian" element={<ExamResults />} />
              </>
            )}
          </Route>

          {/* Special Route: Taking Exam (Fullscreen) */}
          <Route path="/exam/:examId" element={user?.role === 'siswa' ? <TakeExam /> : <Navigate to="/app" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
