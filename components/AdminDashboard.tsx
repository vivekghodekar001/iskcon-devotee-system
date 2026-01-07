import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import {
    Users,
    Calendar,
    BookOpen,
    TrendingUp,
    Activity,
    AlertCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeSessions: 0,
        totalResources: 0,
        pendingMentorships: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        // Mocking aggregation for now as Supabase JS client doesn't do complex counts easily without RPC
        // In a real app, we would use count() queries
        try {
            const students = await storageService.getProfiles(); // Need to implement getProfiles or similar
            const sessions = await storageService.getSessions();
            const resources = await storageService.getResources();
            // Mentorships needed

            setStats({
                totalStudents: 124, // Mock for demo until aggregation is ready
                activeSessions: sessions.filter(s => s.status === 'Ongoing').length,
                totalResources: resources.length,
                pendingMentorships: 5 // Mock
            });

            setRecentActivity([
                { id: 1, text: "New student registration: Arjun Das", time: "2 mins ago" },
                { id: 2, text: "Gita Session #42 completed", time: "1 hour ago" },
                { id: 3, text: "New 'Vegetarianism' resource added", time: "3 hours ago" },
            ]);

        } catch (error) {
            console.error("Failed to load admin stats", error);
        }
    };

    const data = [
        { name: 'Mon', attendees: 40 },
        { name: 'Tue', attendees: 30 },
        { name: 'Wed', attendees: 55 },
        { name: 'Thu', attendees: 45 },
        { name: 'Fri', attendees: 70 },
        { name: 'Sat', attendees: 120 },
        { name: 'Sun', attendees: 90 },
    ];

    return (
        <div className="space-y-8 animate-in">
            <header>
                <h2 className="text-3xl font-bold font-serif text-[#0F766E]">Temple Admin Dashboard</h2>
                <p className="text-slate-500">Overview of community growth and engagement.</p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="text-blue-600" size={24} />}
                    label="Total Devotees"
                    value={stats.totalStudents}
                    trend="+12% this month"
                    color="bg-blue-50"
                />
                <StatCard
                    icon={<Calendar className="text-purple-600" size={24} />}
                    label="Active Sessions"
                    value={stats.activeSessions}
                    trend="3 ongoing now"
                    color="bg-purple-50"
                />
                <StatCard
                    icon={<BookOpen className="text-orange-600" size={24} />}
                    label="Library Resources"
                    value={stats.totalResources}
                    trend="+5 new this week"
                    color="bg-orange-50"
                />
                <StatCard
                    icon={<Activity className="text-teal-600" size={24} />}
                    label="Pending Mentorships"
                    value={stats.pendingMentorships}
                    trend="Action required"
                    color="bg-teal-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Attendance Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#0F766E]" /> Weekly Attendance
                    </h3>
                    <div className="h-64 cursor-default">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f0f9ff' }}
                                />
                                <Bar dataKey="attendees" fill="#0F766E" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={20} className="text-orange-500" /> Recent Updates
                    </h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex gap-3 items-start pb-3 border-b border-slate-50 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{activity.text}</p>
                                    <p className="text-xs text-slate-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                        <button className="w-full text-center text-sm text-[#0F766E] font-medium hover:underline py-2">
                            View All History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number, trend: string, color: string }> = ({ icon, label, value, trend, color }) => (
    <div className="glass-card bg-white/60 p-6 rounded-2xl">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">
                Live
            </span>
        </div>
        <h4 className="text-3xl font-bold text-slate-900 mb-1">{value}</h4>
        <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1">
            {trend}
        </p>
    </div>
);

export default AdminDashboard;
