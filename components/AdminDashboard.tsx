import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import {
    Users, Calendar, BookOpen, TrendingUp, Activity,
    FileText, BrainCircuit, Library, ArrowRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ devotees: 0, sessions: 0, quizzes: 0, resources: 0 });
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [profiles, sessions, quizzes, resources] = await Promise.all([
                storageService.getAllProfiles(),
                storageService.getSessions(),
                storageService.getQuizzes(),
                storageService.getResources(),
            ]);

            setStats({
                devotees: profiles.length,
                sessions: sessions.length,
                quizzes: quizzes.length,
                resources: resources.length,
            });

            // Build attendance chart data from last 6 sessions
            const recentSessions = sessions.slice(0, 6).reverse();
            setChartData(recentSessions.map(s => ({
                name: s.title?.substring(0, 15) || 'Session',
                attendees: s.attendeeIds?.length || 0,
            })));
        } catch (error) {
            console.error('Failed to load admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { icon: Users, label: 'Total Devotees', value: stats.devotees, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/devotees' },
        { icon: Calendar, label: 'Sessions', value: stats.sessions, color: 'text-teal-600', bg: 'bg-teal-50', link: '/admin/sessions' },
        { icon: BrainCircuit, label: 'Quizzes', value: stats.quizzes, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/quizzes' },
        { icon: Library, label: 'Resources', value: stats.resources, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/resources' },
    ];

    const quickActions = [
        { icon: Calendar, label: 'Create Session', to: '/admin/sessions', color: 'text-teal-600' },
        { icon: Users, label: 'Manage Devotees', to: '/admin/devotees', color: 'text-blue-600' },
        { icon: BrainCircuit, label: 'Generate Quiz', to: '/admin/quizzes', color: 'text-purple-600' },
        { icon: FileText, label: 'Assign Homework', to: '/admin/homework', color: 'text-amber-600' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Overview of your spiritual community</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <Link key={card.label} to={card.link} className="stat-card group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                <card.icon size={20} className={card.color} />
                            </div>
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{card.label}</p>
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Attendance Chart */}
                <div className="lg:col-span-2 glass-card-static p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Session Attendance</h2>
                            <p className="text-sm text-slate-500">Recent sessions overview</p>
                        </div>
                        <div className="badge badge-teal">
                            <TrendingUp size={12} /> Live
                        </div>
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        fontSize: '0.875rem'
                                    }}
                                />
                                <Bar dataKey="attendees" fill="#0F766E" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <Activity size={40} />
                            <p>No session data yet. Create your first session!</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-card-static p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        {quickActions.map(action => (
                            <Link
                                key={action.label}
                                to={action.to}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-slate-50 group-hover:bg-white flex items-center justify-center transition-colors">
                                    <action.icon size={18} className={action.color} />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{action.label}</span>
                                <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
