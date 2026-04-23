import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ClipboardList, 
  GraduationCap, 
  LogOut,
  Menu,
  X,
  UserCircle
} from 'lucide-react';
import { useState } from 'react';

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const adminMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app' },
    { name: 'Manajemen User', icon: Users, path: '/app/users' },
    { name: 'Manajemen Soal', icon: FileText, path: '/app/bank-soal' },
    { name: 'Manajemen Ujian', icon: ClipboardList, path: '/app/exams' },
  ];

  const guruMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app' },
    { name: 'Bank Soal', icon: FileText, path: '/app/bank-soal' },
    { name: 'Buat Ujian', icon: ClipboardList, path: '/app/exams' },
  ];

  const siswaMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app' },
    { name: 'Daftar Ujian', icon: ClipboardList, path: '/app/daftar-ujian' },
    { name: 'Hasil Ujian', icon: GraduationCap, path: '/app/hasil-ujian' },
  ];

  const menu = user?.role === 'admin' ? adminMenu : user?.role === 'guru' ? guruMenu : siswaMenu;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transition-transform duration-300 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tighter leading-none">
                SMK PRIMA<br/><span className="opacity-80 font-normal">UNGGUL</span>
              </h1>
            </div>
            <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Profile Info (Sidebar Mobile) */}
          <div className="px-6 py-6 mb-4">
            <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-white/60 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 space-y-2">
            {menu.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/app'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 text-current" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              Keluar Sistem
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Dashboard
              </h2>
              <p className="text-xl font-extrabold text-slate-900 leading-none">
                {menu.find(m => m.path === window.location.pathname)?.name || 'Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">User Aktif</p>
              <p className="text-sm font-extrabold text-slate-900 leading-none">{user?.name}</p>
            </div>
            <button 
              onClick={handleSignOut}
              className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
