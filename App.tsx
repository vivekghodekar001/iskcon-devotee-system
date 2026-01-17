
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import RoleGuard from './components/guards/RoleGuard';
import AdminLayout from './components/layouts/AdminLayout';
import UserLayout from './components/layouts/UserLayout';
import { supabase } from './lib/supabaseClient';
import { storageService } from './services/storageService';

// Lazy Load Components
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SessionManagement = lazy(() => import('./components/SessionManagement'));
const GitaInsights = lazy(() => import('./components/GitaInsights'));
const HomeworkManagement = lazy(() => import('./components/HomeworkManagement'));
const ResourcesGallery = lazy(() => import('./components/ResourcesGallery'));
const MentorshipProgram = lazy(() => import('./components/MentorshipProgram'));
const DevoteeManagement = lazy(() => import('./components/DevoteeManagement'));
const ChantingCounter = lazy(() => import('./components/ChantingCounter'));
const AdminQuizManager = lazy(() => import('./components/quiz/AdminQuizManager'));
const UserQuizTaker = lazy(() => import('./components/quiz/UserQuizTaker'));
const UserQuizList = lazy(() => import('./components/quiz/UserQuizList')); // Restored
const Onboarding = lazy(() => import('./components/Onboarding'));
const MyProfile = lazy(() => import('./components/MyProfile'));

// Restored LoadingSpinner
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FFF9F0] text-[#0F766E] font-serif text-xl animate-pulse">
    Loading ISKCON Portal...
  </div>
);

import { App as CapacitorApp } from '@capacitor/app';

// ... imports

const AppContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle Deep Links (Google Login)
    CapacitorApp.addListener('appUrlOpen', (data) => {
      // supabase.auth.getSession() will pick up the hash from the URL automatically
      // but we might need to manually pass it if Supabase doesn't catch it
      // For now, let's rely on Supabase's auto-detection on cold start or window.location
      console.log('App opened with URL:', data.url);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        // Keep loading true while fetching role
        fetchUserRole(session.user.email);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        setLoading(true); // PREVENT FLASH: Start loading again when session changes
        fetchUserRole(session.user.email);
      } else {
        setUserRole(null);
        setProfileExists(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      CapacitorApp.removeAllListeners();
    };
  }, []);

  const fetchUserRole = async (email: string) => {
    try {
      const profile = await storageService.getProfileByEmail(email);
      if (profile) {
        setUserRole(profile.role || 'student');
        setProfileExists(true);
      } else {
        setUserRole('student'); // Default role, but flow will redirect to onboarding
        setProfileExists(false);
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setUserRole('student');
      setProfileExists(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Force Onboarding if no profile (and not already on onboarding page)
  if (profileExists === false && window.location.hash !== '#/onboarding') {
    // small hack to check hash because Navigate might loop if we are not careful
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Onboarding Route (Open to auth users without profile) */}
        <Route path="/onboarding" element={profileExists ? <Navigate to="/" /> : <Onboarding />} />

        {/* Redirect Root based on Role & Profile Status */}
        <Route path="/" element={
          !profileExists ? <Navigate to="/onboarding" replace /> :
            <Navigate to={userRole === 'admin' ? "/admin" : "/app"} replace />
        } />

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
            <Route path="my-quizzes" element={<UserQuizList />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="/unauthorized" element={<div className="p-10 text-center">Unauthorized Access</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
