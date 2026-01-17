import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    BookOpen, LayoutDashboard, Calendar, Activity,
    FileText, Library, Users2, LogOut, Menu, X, Bell, Brain, User
} from 'lucide-react';

import { supabase } from '../../lib/supabaseClient';

const UserLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
        const active = location.pathname === to || (to !== '/app' && location.pathname.startsWith(to));
        return (
            <Link
                to={to}
                onClick={(e) => {
                    // Force close specificallly
                    setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group active:scale-95 ${active
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
            >
                <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen flex bg-[#FFF9F0] font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* User Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 text-white transform transition-transform duration-300 cubic-bezier(0.2, 0, 0, 1) lg:relative lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                shadow-2xl bg-[#0F766E] bg-gradient-to-b from-[#0F766E] to-[#115E59] flex flex-col
            `} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo-new.png" alt="Gita Life" className="w-10 h-10 rounded-full shadow-lg border border-white/20" />
                        <div>
                            <h1 className="text-lg font-bold tracking-tight font-serif leading-tight">Gita Life</h1>
                            <p className="text-[10px] opacity-70 font-medium">Devotee Sadhu Sanga</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
                    <NavLink to="/app" icon={<LayoutDashboard size={20} />} label="My Dashboard" />
                    <NavLink to="/app/sessions" icon={<Calendar size={20} />} label="Sessions" />
                    <NavLink to="/app/chanting" icon={<Activity size={20} />} label="Japa Sadhana" />
                    <NavLink to="/app/homework" icon={<FileText size={20} />} label="Assignments" />
                    <NavLink to="/app/my-quizzes" icon={<Brain size={20} />} label="My Quizzes" />
                    <div className="pt-6 pb-2 px-4 text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-full h-px bg-white/10"></span> Resources <span className="w-full h-px bg-white/10"></span>
                    </div>
                    <NavLink to="/app/resources" icon={<Library size={20} />} label="Digital Library" />
                    <NavLink to="/app/mentorship" icon={<Users2 size={20} />} label="Mentorship" />
                    <NavLink to="/app/gita" icon={<BookOpen size={20} />} label="Gita Wisdom" />

                    <div className="pt-6 pb-2 px-4 text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-full h-px bg-white/10"></span> Account <span className="w-full h-px bg-white/10"></span>
                    </div>
                    <NavLink to="/app/profile" icon={<User size={20} />} label="My Profile" />
                </nav>

                <div className="p-4 border-t border-white/10 bg-black/10">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95">
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-orange-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-shadow duration-300"
                    style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(4rem + env(safe-area-inset-top))' }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition-all"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="ml-auto">
                        <button className="p-2 text-slate-600 hover:bg-orange-50 rounded-xl transition-colors active:scale-95">
                            <Bell size={22} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default UserLayout;
