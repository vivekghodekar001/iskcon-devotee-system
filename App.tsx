
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import SessionManagement from './components/SessionManagement';
import GitaInsights from './components/GitaInsights';
import HomeworkManagement from './components/HomeworkManagement';
import ResourcesGallery from './components/ResourcesGallery';
import MentorshipProgram from './components/MentorshipProgram';
import DevoteeManagement from './components/DevoteeManagement';
import ChantingCounter from './components/ChantingCounter';
import Login from './components/Login';
import RoleGuard from './components/guards/RoleGuard';
import AdminLayout from './components/layouts/AdminLayout';
import UserLayout from './components/layouts/UserLayout';
import AdminQuizManager from './components/quiz/AdminQuizManager';
import UserQuizTaker from './components/quiz/UserQuizTaker';
import { supabase } from './lib/supabaseClient';
import { storageService } from './services/storageService';

const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) fetchUserRole(session.user.email);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      setUserRole('student');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0] text-[#0F766E] font-serif text-xl animate-pulse">Loading ISKCON Portal...</div>;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Redirect Root based on Role */}
      <Route path="/" element={<Navigate to={userRole === 'admin' ? "/admin" : "/app"} replace />} />

      {/* ADMIN ROUTES */}
      <Route element={<RoleGuard allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="sessions" element={<SessionManagement mode="admin" />} />
          <Route path="devotees" element={<DevoteeManagement />} />
          <Route path="quizzes" element={<AdminQuizManager />} />
          <Route path="homework" element={<HomeworkManagement mode="admin" />} />
          <Route path="resources" element={<ResourcesGallery mode="admin" />} />
          <Route path="mentorship" element={<MentorshipProgram mode="admin" />} />
        </Route>
      </Route>

      {/* USER ROUTES */}
      <Route element={<RoleGuard allowedRoles={['student', 'mentor']} />}>
        <Route path="/app" element={<UserLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sessions" element={<SessionManagement mode="student" />} />
          <Route path="chanting" element={<ChantingCounter />} />
          <Route path="homework" element={<HomeworkManagement mode="student" />} />
          <Route path="resources" element={<ResourcesGallery mode="student" />} />
          <Route path="mentorship" element={<MentorshipProgram mode="student" />} />
          <Route path="gita" element={<GitaInsights />} />
          <Route path="quiz" element={<UserQuizTaker />} />
        </Route>
      </Route>

      {/* FALLBACK */}
      <Route path="/unauthorized" element={<div className="p-10 text-center">Unauthorized Access</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
