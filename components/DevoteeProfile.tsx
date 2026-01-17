import React, { useState } from 'react';
import { UserProfile, Session, ChantingLog, StudentCategory } from '../types';
import { X, Calendar, Activity, Mail, Phone, MapPin, Video, BookOpen, Clock, Award } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface DevoteeProfileProps {
    profile: UserProfile;
    attendance: Session[];
    chantingHistory: ChantingLog[];
    isLoading?: boolean;
    onClose: () => void;
}

const DevoteeProfile: React.FC<DevoteeProfileProps> = ({ profile, attendance, chantingHistory, isLoading, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'chanting'>('overview');

    // Calculate chanting stats
    const totalRounds = chantingHistory.reduce((acc, log) => acc + log.rounds, 0);
    const averageRounds = chantingHistory.length > 0 ? Math.round(totalRounds / chantingHistory.length) : 0;

    // Prepare chart data for last 7 entries (reverse chronological usually, so take first 7 then reverse for chart)
    const chartData = [...chantingHistory].slice(0, 14).reverse().map(log => ({
        date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        rounds: log.rounds
    }));

    // Attendance stats
    const sessionsAttended = attendance.length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="relative h-48 bg-gradient-to-r from-teal-800 to-teal-600 shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                        <div className="w-32 h-32 rounded-3xl border-4 border-white bg-slate-100 shadow-lg overflow-hidden flex items-center justify-center">
                            {profile.photoUrl ? (
                                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-teal-800">{profile.name[0]}</span>
                            )}
                        </div>
                        <div className="pb-4 mb-2">
                            <h2 className="text-3xl font-bold text-white font-serif tracking-wide">{profile.name}</h2>
                            {profile.spiritualName && <p className="text-teal-200 font-bold uppercase tracking-wider text-sm mt-1">{profile.spiritualName}</p>}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-16 px-8 border-b border-slate-100 flex gap-6 overflow-x-auto">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BookOpen size={18} />} label="Overview" />
                    <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<Calendar size={18} />} label="Attendance" count={sessionsAttended} />
                    <TabButton active={activeTab === 'chanting'} onClick={() => setActiveTab('chanting')} icon={<Activity size={18} />} label="Japa History" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <Section title="Contact Information">
                                    <InfoRow icon={<Mail size={16} />} label="Email" value={profile.email} />
                                    <InfoRow icon={<Phone size={16} />} label="Phone" value={profile.phone} />
                                    <InfoRow icon={<MapPin size={16} />} label="Address" value={profile.currentAddress || 'Not provided'} />
                                </Section>

                                <Section title="Spiritual Profile">
                                    <InfoRow icon={<Award size={16} />} label="Category" value={profile.category} />
                                    <InfoRow icon={<MapPin size={16} />} label="Branch" value={profile.branch || 'Not assigned'} />
                                    {profile.introVideoUrl && (
                                        <div className="pt-2">
                                            <a
                                                href={profile.introVideoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                <Video size={16} /> Watch Intro Video
                                            </a>
                                        </div>
                                    )}
                                </Section>
                            </div>

                            <div className="space-y-6">
                                <Section title="Personal Details">
                                    <InfoRow icon={<Calendar size={16} />} label="DOB" value={profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'} />
                                    <InfoRow icon={<MapPin size={16} />} label="Native Place" value={profile.nativePlace || 'N/A'} />
                                    <InfoRow icon={<BookOpen size={16} />} label="Year of Study" value={profile.yearOfStudy || 'N/A'} />
                                </Section>

                                <Section title="Interests & Skills">
                                    <div className="flex flex-wrap gap-2">
                                        {profile.hobbies && profile.hobbies.length > 0 ? (
                                            profile.hobbies.map((hobby, i) => (
                                                <Badge key={i} text={hobby} color="bg-orange-100 text-orange-700" />
                                            ))
                                        ) : <span className="text-slate-400 italic text-sm">No hobbies listed</span>}
                                    </div>
                                    {profile.skills && profile.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {profile.skills.map((skill, i) => (
                                                <Badge key={i} text={skill} color="bg-blue-100 text-blue-700" />
                                            ))}
                                        </div>
                                    )}
                                </Section>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg text-slate-800">Session Attendance ({isLoading ? '...' : sessionsAttended})</h3>
                            {isLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-slate-200 rounded-xl w-full"></div>
                                    ))}
                                </div>
                            ) : attendance.length > 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="p-4">Date</th>
                                                <th className="p-4">Session</th>
                                                <th className="p-4">Type</th>
                                                <th className="p-4">Facilitator</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {attendance.map(session => (
                                                <tr key={session.id} className="hover:bg-slate-50/50">
                                                    <td className="p-4 font-medium text-slate-700">
                                                        {new Date(session.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 font-bold text-teal-700">{session.title}</td>
                                                    <td className="p-4">
                                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{session.type}</span>
                                                    </td>
                                                    <td className="p-4 text-slate-600">{session.facilitator}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyState message="No sessions attended yet." />
                            )}
                        </div>
                    )}

                    {activeTab === 'chanting' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                            {isLoading ? (
                                <div className="h-64 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center">
                                    <div className="text-slate-400 font-medium">Loading history...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatCard label="Total Rounds" value={totalRounds} icon={<Activity className="text-orange-500" />} />
                                        <StatCard label="Avg. Rounds/Day" value={averageRounds} icon={<Clock className="text-blue-500" />} />
                                        <StatCard label="Current Streak" value="--" icon={<Award className="text-purple-500" />} />
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                        <h4 className="font-bold text-slate-800 mb-6">Last 14 Days Activity</h4>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                                    <Bar dataKey="rounds" fill="#0F766E" radius={[4, 4, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">Detailed History</div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {chantingHistory.map(log => (
                                                <div key={log.id} className="flex justify-between items-center p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                                                    <div className="font-medium text-slate-700">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                    <div className="font-bold text-teal-700 text-lg flex items-center gap-2">
                                                        {log.rounds} <span className="text-xs font-normal text-slate-400 uppercase">Rounds</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {chantingHistory.length === 0 && <EmptyState message="No chanting logs found." />}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }> = ({ active, onClick, icon, label, count }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 pb-4 px-2 font-medium transition-all relative ${active ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'
            }`}
    >
        {icon}
        <span>{label}</span>
        {count !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                {count}
            </span>
        )}
        {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />}
    </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">{title}</h4>
        <div className="space-y-4">{children}</div>
    </div>
);

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="mt-1 text-slate-400">{icon}</div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
            <p className="font-medium text-slate-700">{value}</p>
        </div>
    </div>
);

const Badge: React.FC<{ text: string; color: string }> = ({ text, color }) => (
    <span className={`px-2 py-1 rounded-md text-xs font-bold ${color}`}>
        {text}
    </span>
);

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
        <div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
        </div>
    </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center py-12 text-slate-400 italic">
        {message}
    </div>
);

export default DevoteeProfile;
