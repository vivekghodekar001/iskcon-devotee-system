import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        try {
            const students = await storageService.getProfiles();
            const sessions = await storageService.getSessions();
            const resources = await storageService.getResources();
            // Mentorships needed (using mentorship_requests if available, else 0)
            // const requests = await storageService.getMentorshipRequests(); // If this existed

            setStats({
                totalStudents: students.length,
                activeSessions: sessions.filter(s => s.status === 'Ongoing').length,
                totalResources: resources.length,
                pendingMentorships: 0 // Placeholder until mentorship requests API is exposed
            });

            // Mock recent activity for now, replacing with real logs later if needed
            setRecentActivity([
                { id: 1, text: `System Online: ${students.length} devotees registered`, time: "Just now" },
                { id: 2, text: `${sessions.length} sessions scheduled`, time: "Today" },
                { id: 3, text: "Database schema synchronized", time: "Recent" },
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
                <h2 className="text-3xl font-bold font-serif text-slate-900">Administration Portal</h2>
                <p className="text-slate-500">Overview of temple community growth and daily engagement.</p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/admin/devotees">
                    <StatCard
                        icon={<Users className="text-blue-600" size={24} />}
                        label="Total Devotees"
                        value={stats.totalStudents}
                        trend="View All Records"
                        color="bg-blue-50"
                    />
                </Link>
                <Link to="/admin/sessions">
                    <StatCard
                        icon={<Calendar className="text-purple-600" size={24} />}
                        label="Active Sessions"
                        value={stats.activeSessions}
                        trend="Manage Sessions"
                        color="bg-purple-50"
                    />
                </Link>
                <Link to="/admin/resources">
                    <StatCard
                        icon={<BookOpen className="text-orange-600" size={24} />}
                        label="Library Resources"
                        value={stats.totalResources}
                        trend="Manage Library"
                        color="bg-orange-50"
                    />
                </Link>
                <Link to="/admin/mentorship">
                    <StatCard
                        icon={<Activity className="text-teal-600" size={24} />}
                        label="Pending Mentorships"
                        value={stats.pendingMentorships}
                        trend="View Requests"
                        color="bg-teal-50"
                    />
                </Link>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number, trend: string, color: string }> = ({ icon, label, value, trend, color }) => (
    <div className="glass-card bg-white/60 p-6 rounded-2xl hover:bg-white/80 transition-all cursor-pointer group h-full border border-transparent hover:border-slate-200 hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <span className="bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors text-xs px-2 py-1 rounded-full font-bold">
                View
            </span>
        </div>
        <h4 className="text-3xl font-bold text-slate-900 mb-1">{value}</h4>
        <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-[#0F766E] transition-colors font-medium">
            {trend} <TrendingUp size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </p>
    </div>
);

export default AdminDashboard;
