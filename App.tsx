
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
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
  Library,
  Users2,
  ShieldCheck,
  Activity,
  ToggleLeft
} from 'lucide-react';
import Dashboard from './components/Dashboard'; // Student Dashboard
import AdminDashboard from './components/AdminDashboard'; // Admin Dashboard
import SessionManagement from './components/SessionManagement';
import GitaInsights from './components/GitaInsights';
import HomeworkManagement from './components/HomeworkManagement';
import QuizGenerator from './components/QuizGenerator';
import ResourcesGallery from './components/ResourcesGallery';
import MentorshipProgram from './components/MentorshipProgram';
import DevoteeManagement from './components/DevoteeManagement';
import ChantingCounter from './components/ChantingCounter';
import { storageService } from './services/storageService';
import { Notification, GitaQuote } from './types';
import Login from './components/Login';
import { supabase } from './lib/supabaseClient';

const AppContent: React.FC = () => {
  const location = useLocation();
  /* Auth State */
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // 'admin' | 'student' | 'mentor'
  const [loading, setLoading] = useState(true);

  // DEV TOOLS: Toggle Role
  const toggleDevRole = () => {
    setUserRole(prev => prev === 'admin' ? 'student' : 'admin');
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) fetchUserRole(session.user.email);
      else setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) fetchUserRole(session.user.email);
      else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (email: string) => {
    try {
      const profile = await storageService.getProfileByEmail(email);
      setUserRole(profile?.role || 'student');
    } catch (error) {
      console.error("Error fetching role:", error);
      setUserRole('student'); // Default to student on error
    } finally {
      setLoading(false);
    }
  };

  /* App State */
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session) {
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
    }
  }, [session]);

  const addNotification = async (title: string, message: string, type: 'quote' | 'system' = 'system') => {
    const newNotif: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
    try { await storageService.createNotification(newNotif); } catch (error) { console.error(error); }
  };

  const clearNotifications = async () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    setUnreadCount(0);
    try { await storageService.markAllNotificationsRead(); } catch (error) { console.error(error); }
  };

  // Simple loading splash
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0] text-[#0F766E] font-serif text-xl animate-pulse">Loading ISKCON Portal...</div>;
  }

  // Auth Guard
  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  const isAdmin = userRole === 'admin';

  // Dynamic Theme Colors based on Role
  const sidebarBg = isAdmin
    ? "bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-800"
    : "bg-[#0F766E] bg-gradient-to-b from-[#0F766E] to-[#115E59]";

  const headerBorder = isAdmin ? "border-slate-200" : "border-orange-100";

  return (
    <>
      <div className="min-h-screen flex bg-transparent overflow-hidden relative font-sans text-slate-900">

        {/* DEV TOOLS FLOAT */}
        <div className="fixed bottom-4 right-4 z-[9999] opacity-50 hover:opacity-100 transition-opacity">
          <button
            onClick={toggleDevRole}
            className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2"
            title="Toggle between Admin and Student view for testing"
          >
            <ToggleLeft size={16} /> Dev: {isAdmin ? 'Admin View' : 'Student View'}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl ${sidebarBg}
        `}>
          <div className="flex flex-col h-full">
            <div className={`p-6 flex items-center justify-between ${isAdmin ? 'bg-white/5' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 ${isAdmin ? 'bg-blue-600' : 'bg-white/10'}`}>
                  {isAdmin ? <ShieldCheck size={24} /> : <BookOpen size={24} />}
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight font-serif leading-tight">
                    {isAdmin ? 'Admin Portal' : 'ISKCON Portal'}
                  </h1>
                  <p className="text-[10px] opacity-70 font-medium">
                    {isAdmin ? 'Management System' : 'Devotee Sadhu Sanga'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-6">
              <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label={isAdmin ? "Admin Dashboard" : "My Dashboard"} />

              {!isAdmin && (
                <>
                  <SidebarLink to="/sessions" icon={<Calendar size={20} />} label="Sessions" />
                  <SidebarLink to="/chanting" icon={<Activity size={20} />} label="Japa Sadhana" />
                  <SidebarLink to="/homework" icon={<FileText size={20} />} label="Assignments" />
                </>
              )}

              {/* Admin Only Links */}
              {isAdmin && (
                <>
                  <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Management</div>
                  <SidebarLink to="/sessions" icon={<Calendar size={20} />} label="Manage Sessions" />
                  <SidebarLink to="/devotees" icon={<UserPlus size={20} />} label="Devotee Database" />
                  <SidebarLink to="/quizzes" icon={<BrainCircuit size={20} />} label="AI Quiz Gen" />
                  <SidebarLink to="/homework" icon={<FileText size={20} />} label="Review Homework" />
                </>
              )}

              <div className="pt-4 pb-2 px-4 text-xs font-bold text-white/40 uppercase tracking-wider">Resources</div>
              <SidebarLink to="/resources" icon={<Library size={20} />} label="Digital Library" />
              <SidebarLink to="/mentorship" icon={<Users2 size={20} />} label="Mentorship" />
              <SidebarLink to="/gita" icon={<BookOpen size={20} />} label="Gita Wisdom" />
            </nav>

            <div className="p-4 border-t border-white/10 bg-black/10">
              <div className="flex items-center gap-3 px-2 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border border-white/20 ${isAdmin ? 'bg-blue-900 text-blue-100' : 'bg-teal-800/50 text-teal-100'}`}>
                  {session.user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">
                    {isAdmin ? 'Administrator' : 'Devotee'}
                  </p>
                  <p className="text-xs text-white/50 truncate">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center gap-3 px-2 py-3 w-full text-left text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
          {/* Header */}
          <header className={`h-16 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-colors ${headerBorder}`}>
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

              {isAdmin && (
                <div className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  <ShieldCheck size={14} /> Admin Mode
                </div>
              )}
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth z-0">
            <div key={location.pathname} className="page-wrapper min-h-full">
              <Routes>
                {/* Conditional Home Route */}
                <Route path="/" element={isAdmin ? <AdminDashboard /> : <Dashboard />} />

                {/* Protected Routes */}
                <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/devotees" element={isAdmin ? <DevoteeManagement /> : <Navigate to="/" />} />
                <Route path="/quizzes" element={isAdmin ? <QuizGenerator /> : <Navigate to="/" />} />

                {/* Public/Shared Routes */}
                <Route path="/chanting" element={<ChantingCounter />} />
                <Route path="/sessions" element={<SessionManagement addNotification={addNotification} />} />
                <Route path="/homework" element={<HomeworkManagement />} />
                <Route path="/resources" element={<ResourcesGallery />} />
                <Route path="/mentorship" element={<MentorshipProgram />} />
                <Route path="/gita" element={<GitaInsights />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all group
        ${isActive ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'}
      `}
    >
      <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
