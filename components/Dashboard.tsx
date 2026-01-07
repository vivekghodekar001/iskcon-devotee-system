
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Users, Calendar, Target, Award, ArrowUpRight, TrendingUp } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Devotee, Session } from '../types';

const Dashboard: React.FC = () => {
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedDevotees, loadedSessions] = await Promise.all([
          storageService.getDevotees(),
          storageService.getSessions()
        ]);
        setDevotees(loadedDevotees);
        setSessions(loadedSessions);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    loadData();
  }, []);

  const stats = [
    { label: 'Total Devotees', value: devotees.length, icon: <Users size={24} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Upcoming Sessions', value: sessions.length, icon: <Calendar size={24} />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Attendance Rate', value: '82%', icon: <Target size={24} />, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Initiated Members', value: devotees.filter(d => d.status.includes('Initiated')).length, icon: <Award size={24} />, color: 'bg-purple-50 text-purple-600' },
  ];

  const attendanceData = [
    { name: 'Mon', count: 45 },
    { name: 'Tue', count: 52 },
    { name: 'Wed', count: 48 },
    { name: 'Thu', count: 61 },
    { name: 'Fri', count: 55 },
    { name: 'Sat', count: 85 },
    { name: 'Sun', count: 120 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Temple Overview</h2>
          <p className="text-slate-500 mt-1">Welcome back, Admin. Hare Krishna!</p>
        </div>
        <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <Calendar size={16} />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color} transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} />
                +12%
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Attendance Trends</h3>
              <p className="text-sm text-slate-500">Weekly devotees visiting temple</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
              <TrendingUp size={16} />
              High Growth
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9933" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#FF9933', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="count" stroke="#FF9933" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Devotees</h3>
            <div className="space-y-6">
              {devotees.slice(-4).reverse().map((devotee) => (
                <div key={devotee.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                    {devotee.photo ? (
                      <img src={devotee.photo} alt={devotee.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Users size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{devotee.spiritualName || devotee.name}</p>
                    <p className="text-xs text-slate-500 truncate">{devotee.status}</p>
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 uppercase">
                    {new Date(devotee.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
              {devotees.length === 0 && (
                <p className="text-center text-slate-400 py-8 italic">No devotees registered yet.</p>
              )}
            </div>
            {devotees.length > 0 && (
              <button className="w-full mt-6 py-3 text-sm font-medium text-[#FF9933] hover:bg-orange-50 rounded-xl transition-colors border border-dashed border-orange-200">
                View All Devotees
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
