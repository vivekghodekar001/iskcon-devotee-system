import React, { useState, useEffect } from 'react';
import { Calendar, X, Mail, Phone, MapPin, BookOpen, Award, Clock } from 'lucide-react';
import { UserProfile, Session } from '../types';
import { storageService } from '../services/storageService';

interface Props {
    profile: UserProfile;
    onClose: () => void;
}

const DevoteeProfile: React.FC<Props> = ({ profile, onClose }) => {
    const [attendance, setAttendance] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendance();
    }, [profile.id]);

    const loadAttendance = async () => {
        try {
            const sessions = await storageService.getStudentAttendance(profile.id);
            setAttendance(sessions.slice(0, 10));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const catColor = (cat: string) => {
        switch (cat) {
            case 'Favourite': return 'badge-saffron';
            case 'Sankalpa': return 'badge-purple';
            case 'Volunteer': return 'badge-green';
            case 'Advanced seeker': return 'badge-teal';
            case 'Guest': return 'badge-blue';
            default: return 'badge-gray';
        }
    };

    return (
        <div className="glass-card-static overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="bg-gradient-to-br from-divine-700 to-divine-600 p-6 text-white relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
                    <X size={18} />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border border-white/20 shadow-lg">
                        {profile.photoUrl ? (
                            <img src={profile.photoUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                            profile.name?.[0]?.toUpperCase() || '?'
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{profile.name}</h2>
                        {profile.spiritualName && <p className="text-sm text-white/70">{profile.spiritualName}</p>}
                        <span className={`badge ${catColor(profile.category)} mt-1 text-[10px]`}>{profile.category}</span>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-5 space-y-4">
                <div className="space-y-2.5">
                    {profile.email && (
                        <div className="flex items-center gap-3 text-sm">
                            <Mail size={15} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-600 truncate">{profile.email}</span>
                        </div>
                    )}
                    {profile.phone && (
                        <div className="flex items-center gap-3 text-sm">
                            <Phone size={15} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-600">{profile.phone}</span>
                        </div>
                    )}
                    {profile.branch && (
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin size={15} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-600">{profile.branch}</span>
                        </div>
                    )}
                    {profile.dob && (
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar size={15} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-600">{new Date(profile.dob).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                    )}
                </div>

                {profile.goals && (
                    <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Goals</p>
                        <p className="text-sm text-slate-700">{profile.goals}</p>
                    </div>
                )}

                {profile.interests && profile.interests.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Interests</p>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.interests.map(i => (
                                <span key={i} className="badge badge-saffron text-[10px]">{i}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Attendance */}
                <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance</p>
                        <span className="badge badge-teal text-[10px]">{attendance.length} sessions</span>
                    </div>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto" />
                        </div>
                    ) : attendance.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">No sessions attended yet</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {attendance.map(s => (
                                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50/80 text-xs">
                                    <Clock size={12} className="text-slate-400 flex-shrink-0" />
                                    <span className="text-slate-700 font-medium truncate flex-1">{s.title}</span>
                                    <span className="text-slate-400 flex-shrink-0">{new Date(s.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DevoteeProfile;
