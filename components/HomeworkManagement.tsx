import React, { useState, useEffect } from 'react';
import { FileText, Plus, X, Calendar, Clock, Upload, CheckCircle, Send, ChevronDown } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Session } from '../types';
import { supabase } from '../lib/supabaseClient';

interface Props { mode: 'admin' | 'student'; }

const HomeworkManagement: React.FC<Props> = ({ mode }) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    const [homework, setHomework] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', dueDate: '', fileUrl: '' });
    const [userProfileId, setUserProfileId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitUrl, setSubmitUrl] = useState('');

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const s = await storageService.getSessions();
            setSessions(s);
            if (s.length > 0) {
                setSelectedSessionId(s[0].id);
                loadHomework(s[0].id);
            }

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

    const loadHomework = async (sessionId: string) => {
        try {
            const hw = await storageService.getHomeworkBySession(sessionId);
            setHomework(hw);
        } catch (err) { console.error(err); }
    };

    const handleSessionChange = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        loadHomework(sessionId);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await storageService.createHomework({
                sessionId: selectedSessionId,
                title: form.title,
                description: form.description,
                dueDate: form.dueDate,
                fileUrl: form.fileUrl
            });
            setShowForm(false);
            setForm({ title: '', description: '', dueDate: '', fileUrl: '' });
            loadHomework(selectedSessionId);
        } catch (err) { console.error(err); alert('Failed to create homework'); }
    };

    const handleSubmit = async (homeworkId: string) => {
        if (!submitUrl.trim()) return;
        setSubmitting(true);
        try {
            await storageService.submitHomework({
                homeworkId,
                studentId: userProfileId,
                fileUrl: submitUrl
            });
            alert('Submitted successfully!');
            setSubmitUrl('');
        } catch (err) { console.error(err); alert('Failed to submit'); }
        finally { setSubmitting(false); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1>{mode === 'admin' ? 'Homework Management' : 'My Assignments'}</h1>
                    <p>{mode === 'admin' ? 'Create and assign homework' : 'View and submit your assignments'}</p>
                </div>
                {mode === 'admin' && selectedSessionId && (
                    <button onClick={() => setShowForm(true)} className="btn-divine">
                        <Plus size={18} /> Assign Homework
                    </button>
                )}
            </div>

            {/* Session Selector */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Session</label>
                <select
                    className="select-divine max-w-md"
                    value={selectedSessionId}
                    onChange={e => handleSessionChange(e.target.value)}
                >
                    {sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.title} — {new Date(s.date).toLocaleDateString()}</option>
                    ))}
                </select>
            </div>

            {/* Homework List */}
            {homework.length === 0 ? (
                <div className="empty-state">
                    <FileText size={48} />
                    <p>No homework assigned for this session</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {homework.map(hw => (
                        <div key={hw.id} className="glass-card-static p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <h3 className="text-base font-bold text-slate-900">{hw.title}</h3>
                                        {hw.dueDate && (
                                            <span className="badge badge-red text-[10px] flex items-center gap-1">
                                                <Clock size={10} /> Due: {new Date(hw.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">{hw.description}</p>
                                    {hw.fileUrl && (
                                        <a href={hw.fileUrl} target="_blank" rel="noopener noreferrer" className="text-divine-700 text-sm font-medium hover:underline flex items-center gap-1">
                                            <FileText size={14} /> View Attachment
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Student Submit */}
                            {mode === 'student' && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex gap-2">
                                        <input
                                            className="input-divine text-sm flex-1"
                                            placeholder="Paste your submission URL (Google Doc, Drive link, etc.)"
                                            value={submitUrl}
                                            onChange={e => setSubmitUrl(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleSubmit(hw.id)}
                                            disabled={submitting || !submitUrl.trim()}
                                            className="btn-divine py-2 px-4 text-sm disabled:opacity-40"
                                        >
                                            {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={14} /> Submit</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Homework Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Assign Homework</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title *</label>
                                <input className="input-divine" placeholder="Assignment title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description *</label>
                                <textarea className="textarea-divine" placeholder="Describe the assignment..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Due Date</label>
                                    <input type="datetime-local" className="input-divine" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attachment URL</label>
                                    <input className="input-divine" placeholder="Doc/PDF link" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                                <button type="submit" className="btn-divine flex-1">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeworkManagement;
