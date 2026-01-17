import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    BookOpen, LayoutDashboard, Calendar, Activity,
    FileText, Library, Users2, LogOut, Menu, X, Bell
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const UserLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen flex bg-[#FFF9F0] font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* User Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl bg-[#0F766E] bg-gradient-to-b from-[#0F766E] to-[#115E59]
      `}>
                <div className="flex flex-col h-full">
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white shadow-lg border border-white/20">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight font-serif leading-tight">ISKCON Portal</h1>
                                <p className="text-[10px] opacity-70 font-medium">Devotee Sadhu Sanga</p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 space-y-1 mt-6">
                        <SidebarLink to="/app" icon={<LayoutDashboard size={20} />} label="My Dashboard" active={location.pathname === '/app'} />
                        <SidebarLink to="/app/sessions" icon={<Calendar size={20} />} label="Sessions" active={location.pathname.includes('/sessions')} />
                        <SidebarLink to="/app/chanting" icon={<Activity size={20} />} label="Japa Sadhana" active={location.pathname.includes('/chanting')} />
                        <SidebarLink to="/app/homework" icon={<FileText size={20} />} label="Assignments" active={location.pathname.includes('/homework')} />

                        <div className="pt-4 pb-2 px-4 text-xs font-bold text-white/40 uppercase tracking-wider">Resources</div>
                        <SidebarLink to="/app/resources" icon={<Library size={20} />} label="Digital Library" active={location.pathname.includes('/resources')} />
                        <SidebarLink to="/app/mentorship" icon={<Users2 size={20} />} label="Mentorship" active={location.pathname.includes('/mentorship')} />
                        <SidebarLink to="/app/gita" icon={<BookOpen size={20} />} label="Gita Wisdom" active={location.pathname.includes('/gita')} />
                    </nav>

                    <div className="p-4 border-t border-white/10 bg-black/10">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <LogOut size={20} />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-orange-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <div className="ml-auto">
                        <button className="p-2 text-slate-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <Bell size={22} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group ${active ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
    >
        <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
        <span>{label}</span>
    </Link>
);

export default UserLayout;
