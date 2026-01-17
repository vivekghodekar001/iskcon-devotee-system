import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    ShieldCheck, LayoutDashboard, Calendar, UserPlus,
    BrainCircuit, FileText, Library, Users2, LogOut, Menu, X
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Admin Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-800
      `} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="flex flex-col h-full">
                    <div className="p-6 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-3">
                            <img src="/logo-new.png" alt="Gita Life" className="w-12 h-12 rounded-full shadow-lg border border-white/20 object-contain bg-white/10" />
                            <div>
                                <h1 className="text-lg font-bold tracking-tight font-serif leading-tight">Gita Life</h1>
                                <p className="text-[10px] opacity-70 font-medium">Admin Portal</p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 mt-6">
                        <SidebarLink to="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === '/admin'} />

                        <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Management</div>
                        <SidebarLink to="/admin/sessions" icon={<Calendar size={20} />} label="Sessions" active={location.pathname.includes('/sessions')} />
                        <SidebarLink to="/admin/devotees" icon={<UserPlus size={20} />} label="Devotees" active={location.pathname.includes('/devotees')} />
                        <SidebarLink to="/admin/quizzes" icon={<BrainCircuit size={20} />} label="Quiz Manager" active={location.pathname.includes('/quizzes')} />
                        <SidebarLink to="/admin/homework" icon={<FileText size={20} />} label="Homework" active={location.pathname.includes('/homework')} />

                        <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Resources</div>
                        <SidebarLink to="/admin/resources" icon={<Library size={20} />} label="Library" active={location.pathname.includes('/resources')} />
                        <SidebarLink to="/admin/mentorship" icon={<Users2 size={20} />} label="Mentors" active={location.pathname.includes('/mentorship')} />
                    </nav>

                    <div className="p-4 border-t border-white/10 bg-black/10">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <LogOut size={20} />
                            <span className="text-sm font-medium">Logout Admin</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30"
                    style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(4rem + env(safe-area-inset-top))' }}>
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <div className="ml-auto flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                        <ShieldCheck size={14} /> Administrator Mode
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
    >
        <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
        <span>{label}</span>
    </Link>
);

export default AdminLayout;
