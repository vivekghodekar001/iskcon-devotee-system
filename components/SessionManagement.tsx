import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, Plus, Clock, MapPin, Users, CheckCircle2, X, ChevronDown, Search } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Session, UserProfile } from '../types';

interface Props { mode: 'admin' | 'student'; }

const SessionManagement: React.FC<Props> = ({ mode }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', facilitator: '',
    type: 'Regular' as Session['type'], status: 'Upcoming' as Session['status']
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [s, p] = await Promise.all([
        storageService.getSessions(),
        storageService.getAllProfiles()
      ]);
      setSessions(s);
      setProfiles(p.filter(pr => pr.role !== 'admin'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSession: Session = {
        id: crypto.randomUUID(),
        ...form,
        attendeeIds: []
      };
      await storageService.createSession(newSession);
      setSessions(prev => [newSession, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', date: '', location: '', facilitator: '', type: 'Regular', status: 'Upcoming' });
    } catch (err) { console.error(err); alert('Failed to create session'); }
  };

  const toggleAttendance = async (studentId: string) => {
    if (!selectedSession) return;
    try {
      const updated = { ...selectedSession };
      if (updated.attendeeIds.includes(studentId)) {
        updated.attendeeIds = updated.attendeeIds.filter(id => id !== studentId);
      } else {
        updated.attendeeIds = [...updated.attendeeIds, studentId];
      }
      await storageService.updateSession(updated);
      setSelectedSession(updated);
      setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err) { console.error(err); alert('Failed to update attendance'); }
  };

  const filtered = sessions.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'badge-blue';
      case 'Ongoing': return 'badge-green';
      case 'Completed': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1>{mode === 'admin' ? 'Session Management' : 'Sessions'}</h1>
          <p>{mode === 'admin' ? 'Create and manage sessions' : 'View your session schedule'}</p>
        </div>
        {mode === 'admin' && (
          <button onClick={() => setShowForm(true)} className="btn-divine">
            <Plus size={18} /> New Session
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="search-input" placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="tab-nav">
          {['all', 'Upcoming', 'Ongoing', 'Completed'].map(f => (
            <button key={f} className={`tab-item ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {filtered.length === 0 ? (
        <div className="empty-state"><Calendar size={48} /><p>No sessions found</p></div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(session => (
            <div key={session.id} className="glass-card-static p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-base font-bold text-slate-900">{session.title}</h3>
                    <span className={`badge ${statusColor(session.status)}`}>{session.status}</span>
                    <span className="badge badge-purple">{session.type}</span>
                  </div>
                  {session.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{session.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(session.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {session.location && <span className="flex items-center gap-1.5"><MapPin size={14} /> {session.location}</span>}
                    <span className="flex items-center gap-1.5"><Users size={14} /> {session.attendeeIds.length} attendees</span>
                  </div>
                </div>
                {mode === 'admin' && (
                  <button
                    onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                    className="btn-outline text-xs py-2 px-3 flex-shrink-0"
                  >
                    <UserCheck size={14} /> Attendance
                  </button>
                )}
              </div>

              {/* Attendance Panel */}
              {mode === 'admin' && selectedSession?.id === session.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <UserCheck size={16} className="text-divine-600" /> Mark Attendance ({session.attendeeIds.length}/{profiles.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {profiles.map(p => {
                      const present = session.attendeeIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => toggleAttendance(p.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${present
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                        >
                          <CheckCircle2 size={14} className={present ? 'text-green-500' : 'text-slate-300'} />
                          <span className="truncate">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Create New Session</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title *</label>
                <input className="input-divine" placeholder="Session title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea className="textarea-divine" placeholder="Session description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date *</label>
                  <input type="datetime-local" className="input-divine" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label>
                  <input className="input-divine" placeholder="e.g. Temple Hall" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Facilitator</label>
                  <input className="input-divine" placeholder="Speaker name" value={form.facilitator} onChange={e => setForm({ ...form, facilitator: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
                  <select className="select-divine" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
                    <option>Regular</option><option>Camp</option><option>Event</option><option>Special</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-divine flex-1">Create Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;
