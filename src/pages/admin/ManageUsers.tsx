import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AppUser, UserRole } from '../../types';
import { Users, UserPlus, Search, Shield, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const ManageUsers = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*').order('role', { ascending: true });
    if (error) console.error(error);
    setUsers(data || []);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: UserRole) => {
    if (!confirm(`Ubah role user ini menjadi ${newRole}?`)) return;
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (error) alert('Gagal update role');
    fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Hapus user ini? (Catatan: Ini hanya menghapus profil, user masih ada di Auth)')) return;
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) alert('Gagal hapus user');
    fetchUsers();
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">Manajemen User</h1>
          <p className="text-gray-500 font-medium">Kelola hak akses administrator, guru, dan siswa.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-3">
        <Search className="text-gray-400 w-5 h-5 ml-2" />
        <input 
          type="text" 
          placeholder="Cari nama atau email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 font-medium"
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">User Info</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center text-gray-400">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-gray-400">User tidak ditemukan.</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xl border border-gray-50">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-400">{u.email || 'Email tidak tersedia'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border",
                         u.role === 'admin' ? "bg-red-50 text-red-600 border-red-100" :
                         u.role === 'guru' ? "bg-amber-50 text-amber-600 border-amber-100" :
                         "bg-blue-50 text-blue-600 border-blue-100"
                       )}>
                         {u.role}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <select 
                        className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-primary"
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                      >
                        <option value="admin">Make Admin</option>
                        <option value="guru">Make Guru</option>
                        <option value="siswa">Make Siswa</option>
                      </select>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
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

      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4 items-start">
         <ShieldAlert className="text-amber-600 w-6 h-6 shrink-0 mt-1" />
         <div className="text-sm">
            <p className="font-bold text-amber-900 mb-1">Catatan Penting:</p>
            <p className="text-amber-800 leading-relaxed">
              Karena kebijakan keamanan Supabase client-side, aksi ini hanya mengelola data di tabel <code className="bg-amber-100/50 px-1 font-mono">users</code>.
              Untuk menambah atau menghapus user sepenuhnya dari sistem login, gunakan Dashboard Supabase Auth.
            </p>
         </div>
      </div>
    </div>
  );
};

export default ManageUsers;
