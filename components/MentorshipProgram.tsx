import React, { useState, useEffect } from 'react';
import { Users2, Plus, X, Search, Send, CheckCircle, Clock, XCircle, Phone, MapPin } from 'lucide-react';
import { storageService } from '../services/storageService';
import { supabase } from '../lib/supabaseClient';

interface Props { mode: 'admin' | 'student'; }

const MentorshipProgram: React.FC<Props> = ({ mode }) => {
    const [mentors, setMentors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showRequest, setShowRequest] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [userProfileId, setUserProfileId] = useState('');
    const [sending, setSending] = useState(false);
    const [form, setForm] = useState({ name: '', spiritualName: '', phone: '', branch: '', email: '' });

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const m = await storageService.getMentors();
            setMentors(m);

            if (mode === 'student') {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.email) {
                    const profile = await storageService.getProfileByEmail(session.user.email);
                    if (profile) setUserProfileId(profile.id);
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAddMentor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await storageService.createMentor({
                ...form,
                photoUrl: ''
            });
            setShowForm(false);
            setForm({ name: '', spiritualName: '', phone: '', branch: '', email: '' });
            load();
        } catch (err) { console.error(err); alert('Failed to add mentor'); }
    };

    const handleRequest = async (mentorId: string) => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await storageService.createMentorshipRequest(userProfileId, mentorId, message);
            alert('Request sent successfully!');
            setShowRequest(null);
            setMessage('');
        } catch (err) { console.error(err); alert('Failed to send request'); }
        finally { setSending(false); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1>{mode === 'admin' ? 'Mentorship Program' : 'Mentorship'}</h1>
                    <p>{mode === 'admin' ? 'Manage mentors and requests' : 'Connect with spiritual mentors'}</p>
                </div>
                {mode === 'admin' && (
                    <button onClick={() => setShowForm(true)} className="btn-divine"><Plus size={18} /> Add Mentor</button>
                )}
            </div>

            {/* Mentor Grid */}
            {mentors.length === 0 ? (
                <div className="empty-state"><Users2 size={48} /><p>No mentors available yet</p></div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mentors.map(mentor => (
                        <div key={mentor.id} className="glass-card-static p-5">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron-400 to-saffron-500 flex items-center justify-center text-white font-bold text-xl shadow-saffron flex-shrink-0">
                                    {mentor.photoUrl ? (
                                        <img src={mentor.photoUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                                    ) : (
                                        mentor.name?.[0]?.toUpperCase() || '?'
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-slate-900 truncate">{mentor.name}</h3>
                                    {mentor.spiritualName && <p className="text-sm text-divine-600 font-medium truncate">{mentor.spiritualName}</p>}
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {mentor.phone && (
                                    <p className="flex items-center gap-2 text-xs text-slate-500"><Phone size={12} /> {mentor.phone}</p>
                                )}
                                {mentor.branch && (
                                    <p className="flex items-center gap-2 text-xs text-slate-500"><MapPin size={12} /> {mentor.branch}</p>
                                )}
                            </div>

                            {mode === 'student' && (
                                <>
                                    {showRequest === mentor.id ? (
                                        <div className="space-y-2 animate-in">
                                            <textarea
                                                className="textarea-divine text-sm"
                                                placeholder="Why would you like this mentor? Share your spiritual goals..."
                                                value={message}
                                                onChange={e => setMessage(e.target.value)}
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowRequest(null)} className="btn-ghost text-xs flex-1">Cancel</button>
                                                <button
                                                    onClick={() => handleRequest(mentor.id)}
                                                    disabled={sending || !message.trim()}
                                                    className="btn-divine text-xs flex-1 disabled:opacity-40"
                                                >
                                                    {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={12} /> Send</>}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setShowRequest(mentor.id)} className="btn-outline w-full text-sm">
                                            <Send size={14} /> Request Mentorship
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Mentor Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Add Mentor</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddMentor} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name *</label>
                                    <input className="input-divine" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Spiritual Name</label>
                                    <input className="input-divine" placeholder="Initiated name" value={form.spiritualName} onChange={e => setForm({ ...form, spiritualName: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                                    <input className="input-divine" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch</label>
                                    <input className="input-divine" placeholder="e.g. Pune" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                                <input type="email" className="input-divine" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                                <button type="submit" className="btn-divine flex-1">Add Mentor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorshipProgram;
