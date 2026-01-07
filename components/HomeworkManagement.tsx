import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Clock, FileText, CheckCircle2, ChevronRight, X, Upload } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Session, Homework } from '../types';

const HomeworkManagement: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);

    // Form State
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        fileUrl: ''
    });

    const [submissionLink, setSubmissionLink] = useState('');

    useEffect(() => {
        loadSessions();
    }, []);

    useEffect(() => {
        if (activeSessionId) {
            loadHomework(activeSessionId);
        }
    }, [activeSessionId]);

    const loadSessions = async () => {
        const data = await storageService.getSessions();
        setSessions(data);
        if (data.length > 0 && !activeSessionId) {
            setActiveSessionId(data[0].id);
        }
    };

    const loadHomework = async (sessionId: string) => {
        try {
            const data = await storageService.getHomeworkBySession(sessionId);
            setHomeworkList(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeSessionId) return;

        try {
            await storageService.createHomework({
                sessionId: activeSessionId,
                ...newItem
            });
            setShowCreateForm(false);
            setNewItem({ title: '', description: '', dueDate: '', fileUrl: '' });
            loadHomework(activeSessionId);
            alert("Assignment Created Successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to create assignment");
        }
    };

    const handleSubmitWork = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHomework) return;

        try {
            // Mock student ID for now - in real app, get from Auth Context
            const studentId = 'student-123';
            await storageService.submitHomework({
                homeworkId: selectedHomework.id,
                studentId: studentId,
                fileUrl: submissionLink
            });
            setSelectedHomework(null);
            setSubmissionLink('');
            alert("Homework Submitted Successfully! Hare Krishna.");
        } catch (error) {
            console.error(error);
            alert("Failed to submit homework.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
            {/* Sidebar: Sessions List */}
            <div className="lg:col-span-1 glass-card p-4 rounded-2xl overflow-y-auto space-y-3">
                <h3 className="font-bold text-[#0F766E] mb-4 flex items-center gap-2">
                    <BookOpen size={20} /> Select Session
                </h3>
                {sessions.map(session => (
                    <div
                        key={session.id}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${activeSessionId === session.id
                                ? 'bg-teal-50 border-teal-200 shadow-sm'
                                : 'bg-white/50 border-transparent hover:bg-white'
                            }`}
                    >
                        <p className={`font-bold text-sm ${activeSessionId === session.id ? 'text-[#0F766E]' : 'text-slate-700'}`}>
                            {session.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(session.date).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>

            {/* Main Content: Homework List */}
            <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 font-serif">Assignments</h2>
                        <p className="text-slate-500 text-sm">Manage homework and study materials</p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-divine px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
                    >
                        <Plus size={18} /> New Assignment
                    </button>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <div className="glass-card p-6 rounded-2xl animate-in slide-in-from-top-4 border-l-4 border-[#0F766E]">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-[#0F766E]">Create New Assignment</h4>
                            <button onClick={() => setShowCreateForm(false)}><X size={18} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                required
                                placeholder="Assignment Title"
                                className="w-full px-4 py-2 rounded-xl border-slate-200 focus:ring-[#0F766E]"
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                            />
                            <textarea
                                required
                                placeholder="Description / Instructions"
                                className="w-full px-4 py-2 rounded-xl border-slate-200 focus:ring-[#0F766E] min-h-[100px]"
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border-slate-200"
                                    value={newItem.dueDate}
                                    onChange={e => setNewItem({ ...newItem, dueDate: e.target.value })}
                                />
                                <input
                                    placeholder="File URL (Optional PDF/Doc)"
                                    className="w-full px-4 py-2 rounded-xl border-slate-200"
                                    value={newItem.fileUrl}
                                    onChange={e => setNewItem({ ...newItem, fileUrl: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" className="btn-divine px-6 py-2 rounded-lg font-medium">Create Assignment</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Submit Modal */}
                {selectedHomework && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95">
                            <h3 className="font-bold text-lg mb-2">Submit: {selectedHomework.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">Paste a link to your work (Google Doc, Drive, etc.)</p>
                            <form onSubmit={handleSubmitWork} className="space-y-4">
                                <input
                                    required
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 rounded-xl border-slate-200 focus:ring-[#0F766E]"
                                    value={submissionLink}
                                    onChange={e => setSubmissionLink(e.target.value)}
                                />
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setSelectedHomework(null)} className="px-4 py-2 text-slate-500">Cancel</button>
                                    <button type="submit" className="btn-divine px-6 py-2 rounded-lg font-medium">Submit Work</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="grid gap-4">
                    {homeworkList.length > 0 ? (
                        homeworkList.map(hw => (
                            <div key={hw.id} className="glass-card p-5 rounded-2xl hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-teal-50 text-[#0F766E] p-1.5 rounded-lg"><FileText size={16} /></span>
                                            <h4 className="font-bold text-slate-800">{hw.title}</h4>
                                        </div>
                                        <p className="text-slate-600 text-sm pl-9">{hw.description}</p>
                                        <div className="flex items-center gap-4 pl-9 text-xs text-slate-400 mt-2">
                                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                                <Clock size={12} /> Due: {new Date(hw.dueDate).toLocaleDateString()}
                                            </span>
                                            {hw.fileUrl && (
                                                <a href={hw.fileUrl} target="_blank" className="text-blue-500 hover:underline flex items-center gap-1">
                                                    <Upload size={12} /> View Attachment
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => setSelectedHomework(hw)}
                                            className="text-xs font-bold bg-[#0F766E] text-white px-3 py-1.5 rounded-lg hover:bg-teal-800 transition-colors shadow-sm"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                            <FileText size={40} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-400">No assignments for this session yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeworkManagement;
