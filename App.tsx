
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  LayoutDashboard,
  Bell,
  BookOpen,
  LogOut,
  Menu,
  X,
  UserPlus,
  Quote,
  FileText,
  BrainCircuit,
  Library
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import SessionManagement from './components/SessionManagement';
import GitaInsights from './components/GitaInsights';
import HomeworkManagement from './components/HomeworkManagement';
import QuizGenerator from './components/QuizGenerator';
import ResourcesGallery from './components/ResourcesGallery';
import StudentRegistration from './components/StudentRegistration';
import { storageService } from './services/storageService';
import { Notification, GitaQuote } from './types';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const loadData = async () => {
      try {
        const loaded = await storageService.getNotifications();
        setNotifications(loaded);
        setUnreadCount(loaded.filter(n => !n.isRead).length);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };
    loadData();
  }, []);

  const addNotification = async (title: string, message: string, type: 'quote' | 'system' = 'system') => {
    const newNotif: Notification = {
      id: crypto.randomUUID(), // Use standard UUID if available, or keep relying on whatever
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      type
    };

    // Optimistic UI update
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);

    try {
      await storageService.createNotification(newNotif);
    } catch (error) {
      console.error("Failed to save notification", error);
    }
  };

  const clearNotifications = async () => {
    // Optimistic UI update
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    setUnreadCount(0);

    try {
      await storageService.markAllNotificationsRead();
    } catch (error) {
      console.error("Failed to mark notifications read", error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex bg-transparent overflow-hidden relative font-sans text-slate-900">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0F766E] text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl bg-gradient-to-b from-[#0F766E] to-[#115E59]
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg border border-white/20">
                  <BookOpen size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight font-serif">ISKCON Portal</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
              <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
              <SidebarLink to="/sessions" icon={<Calendar size={20} />} label="Sessions" />
              <SidebarLink to="/homework" icon={<FileText size={20} />} label="Assignments" />
              <SidebarLink to="/quizzes" icon={<BrainCircuit size={20} />} label="AI Quizzes" />
              <SidebarLink to="/resources" icon={<Library size={20} />} label="Library" />
              <SidebarLink to="/gita" icon={<BookOpen size={20} />} label="Gita Wisdom" />
              <SidebarLink to="/register" icon={<UserPlus size={20} />} label="Join" />
            </nav>

            <div className="p-4 border-t border-teal-500/30">
              <div className="flex items-center gap-3 px-2 py-3">
                <div className="w-8 h-8 rounded-full bg-teal-800/50 flex items-center justify-center font-bold text-teal-100 border border-teal-500/30">A</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-teal-50">Temple Admin</p>
                  <p className="text-xs text-teal-200/70 truncate">admin@iskcon.org</p>
                </div>
              </div>
              <button className="flex items-center gap-3 px-2 py-3 w-full text-left text-teal-200/70 hover:text-white hover:bg-teal-800/50 rounded-lg transition-colors">
                <LogOut size={20} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-orange-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <div className="relative group">
                <button
                  onClick={clearNotifications}
                  className="p-2 text-slate-600 hover:bg-orange-50 rounded-lg relative transition-colors"
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {/* Simple dropdown for notifications */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-orange-100 p-2 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-3 border-b border-slate-50 flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    <button className="text-xs text-[#FF9933] font-bold hover:text-orange-700">Clear All</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-2">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 hover:bg-[#FFF9F0] rounded-lg mb-1 transition-colors">
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.timestamp.toLocaleTimeString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-8 text-xs text-slate-400 italic">No notifications yet</p>
                    )}
                  </div>
                </div>
              </div>
              <Link
                to="/devotees/new"
                className="hidden sm:flex items-center gap-2 bg-[#FF9933] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
              >
                <UserPlus size={18} />
                <span>New Devotee</span>
              </Link>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/register" element={<StudentRegistration />} />
              <Route path="/sessions" element={<SessionManagement addNotification={addNotification} />} />
              <Route path="/homework" element={<HomeworkManagement />} />
              <Route path="/quizzes" element={<QuizGenerator />} />
              <Route path="/resources" element={<ResourcesGallery />} />
              <Route path="/gita" element={<GitaInsights />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
        ${isActive ? 'bg-white/20 text-white shadow-sm' : 'text-orange-50 hover:bg-white/10 hover:text-white'}
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default App;
