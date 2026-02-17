import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Award, Star, ArrowRight, Users, Activity, TrendingUp, Brain, FileText, Library } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Session } from '../types';
import { supabase } from '../lib/supabaseClient';
import { getDailyGitaQuote } from '../services/geminiService';
import { GitaQuote } from '../types';

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState('Devotee');
  const [sessionsAttended, setSessionsAttended] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [quote, setQuote] = useState<GitaQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  useEffect(() => {
    loadData();
    loadQuote();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return;

      const profile = await storageService.getProfileByEmail(session.user.email);
      if (profile) {
        setUserName(profile.spiritualName || profile.name || 'Devotee');
        const attended = await storageService.getStudentAttendance(profile.id);
        setSessionsAttended(attended.length);
      }

      const sessions = await storageService.getSessions();
      setUpcomingSessions(sessions.filter(s => s.status === 'Upcoming').slice(0, 3));
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  };

  const loadQuote = async () => {
    try {
      const q = await getDailyGitaQuote();
      setQuote(q);
    } catch { } finally {
      setLoadingQuote(false);
    }
  };

  const quickActions = [
    { to: '/app/chanting', icon: Activity, label: 'Japa Counter', desc: 'Track your rounds', gradient: 'from-teal-500 to-teal-600' },
    { to: '/app/sessions', icon: Calendar, label: 'Sessions', desc: 'View schedule', gradient: 'from-blue-500 to-blue-600' },
    { to: '/app/my-quizzes', icon: Brain, label: 'Quizzes', desc: 'Test knowledge', gradient: 'from-purple-500 to-purple-600' },
    { to: '/app/gita', icon: BookOpen, label: 'Gita Wisdom', desc: 'Ask questions', gradient: 'from-amber-500 to-amber-600' },
    { to: '/app/homework', icon: FileText, label: 'Assignments', desc: 'View homework', gradient: 'from-rose-500 to-rose-600' },
    { to: '/app/resources', icon: Library, label: 'Library', desc: 'Browse resources', gradient: 'from-indigo-500 to-indigo-600' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">
          {getGreeting()}, <span className="text-divine-700">{userName}</span> 🙏
        </h1>
        <p className="text-slate-500 mt-1">Continue your spiritual journey today</p>
      </div>

      {/* Daily Verse Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-divine-700 via-divine-600 to-divine-500 text-white p-6 lg:p-8">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-saffron-500/10 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Star className="text-saffron-300" size={18} />
            <span className="text-sm font-semibold text-saffron-300">Daily Verse</span>
          </div>
          {loadingQuote ? (
            <div className="h-20 flex items-center">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : quote ? (
            <>
              <p className="text-lg lg:text-xl font-light leading-relaxed italic opacity-95 mb-3">
                "{quote.translation}"
              </p>
              <p className="text-sm text-saffron-300 font-semibold">
                — Bhagavad Gita {quote.chapter}.{quote.text}
              </p>
            </>
          ) : (
            <p className="text-lg opacity-80 italic">"Hare Krishna Hare Krishna, Krishna Krishna Hare Hare"</p>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <Calendar size={18} className="text-teal-600" />
            </div>
            <TrendingUp size={14} className="text-green-500 ml-auto" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{sessionsAttended}</p>
          <p className="text-xs text-slate-500 font-medium">Sessions Attended</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Award size={18} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{upcomingSessions.length}</p>
          <p className="text-xs text-slate-500 font-medium">Upcoming Sessions</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map(action => (
            <Link
              key={action.to}
              to={action.to}
              className="glass-card p-4 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                <action.icon size={20} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{action.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Sessions</h2>
            <Link to="/app/sessions" className="text-divine-700 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <div key={session.id} className="glass-card-static p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600">
                    {new Date(session.date).toLocaleDateString('en', { month: 'short' })}
                  </span>
                  <span className="text-lg font-bold text-blue-700 leading-none">
                    {new Date(session.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{session.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {session.location} • {session.facilitator}
                  </p>
                </div>
                <span className="badge badge-blue text-xs flex-shrink-0">{session.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
