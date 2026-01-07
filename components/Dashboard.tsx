
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Users, Calendar, Target, Award, ArrowUpRight, TrendingUp } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Devotee, Session } from '../types';

import React, { useEffect, useState } from 'react';
import { BookOpen, Calendar, Award, Star, ArrowRight } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Session } from '../types';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Dashboard: React.FC = () => {
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          const profile = await storageService.getProfileByEmail(user.email);
          setUserProfile(profile);
        }

        const sessions = await storageService.getSessions();
        const upcoming = sessions.find(s => s.status === 'Upcoming');
        setNextSession(upcoming || null);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-serif font-bold mb-2">
            Hare Krishna, {userProfile?.name?.split(' ')[0] || 'Devotee'}! 🙏
          </h2>
          <p className="text-teal-100 max-w-xl">
            "In this endeavor there is no loss or diminution, and a little advancement on this path can protect one from the most dangerous type of fear." — BG 2.40
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Next Session Card */}
        <div className="glass-card bg-white/60 p-6 rounded-2xl relative group hover:bg-white/80 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <Calendar size={24} />
            </div>
            <h3 className="font-bold text-slate-800">Next Session</h3>
          </div>
          {nextSession ? (
            <>
              <h4 className="text-lg font-bold text-[#0F766E] mb-1">{nextSession.title}</h4>
              <p className="text-sm text-slate-500 mb-4">{new Date(nextSession.date).toLocaleString()}</p>
              <Link to="/sessions" className="text-sm font-medium text-orange-600 flex items-center gap-1 hover:gap-2 transition-all">
                View Details <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <p className="text-slate-500 text-sm">No upcoming sessions scheduled.</p>
          )}
        </div>

        {/* My Progress Card */}
        <div className="glass-card bg-white/60 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-slate-800">My Progress</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Attendance</span>
              <span className="font-bold text-slate-900">85%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Quizzes Passed</span>
              <span className="font-bold text-slate-900">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Assignments</span>
              <span className="font-bold text-slate-900">All Submitted</span>
            </div>
          </div>
        </div>

        {/* Daily Quote Card */}
        <div className="glass-card bg-white/60 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Star size={24} />
            </div>
            <h3 className="font-bold text-slate-800">Verse of the Day</h3>
          </div>
          <p className="text-sm text-slate-600 italic mb-2">
            "One who sees me everywhere, and sees everything in me, I am never lost, nor is he ever lost to me."
          </p>
          <p className="text-xs font-bold text-[#0F766E] uppercase tracking-wide">Bhagavad Gita 6.30</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/resources" className="p-4 bg-white rounded-xl shadow-sm text-center hover:shadow-md transition-shadow border border-slate-100">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen size={20} />
            </div>
            <span className="text-sm font-medium text-slate-700">Read Books</span>
          </Link>
          {/* Other quick actions could go here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

export default Dashboard;
