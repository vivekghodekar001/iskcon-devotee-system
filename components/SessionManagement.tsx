
import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, Plus, Clock, MapPin, Users, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Session, Devotee } from '../types';

interface Props {
  addNotification: (title: string, message: string) => void;
}

const SessionManagement: React.FC<Props> = ({ addNotification }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create Form State
  const [newSession, setNewSession] = useState<Partial<Session>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    facilitator: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [loadedSessions, loadedDevotees] = await Promise.all([
          storageService.getSessions(),
          storageService.getDevotees()
        ]);
        setSessions(loadedSessions);
        setDevotees(loadedDevotees);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    load();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.title) return;

    const session: Session = {
      id: crypto.randomUUID(),
      title: newSession.title || '',
      date: newSession.date || new Date().toISOString(),
      location: newSession.location || 'Temple Hall',
      facilitator: newSession.facilitator || 'Unknown',
      attendeeIds: []
    };

    // Optimistic Update
    const updated = [session, ...sessions];
    setSessions(updated);

    try {
      await storageService.createSession(session);
      setShowCreateForm(false);
      addNotification('New Session Created', `Session "${session.title}" has been scheduled.`);
      setNewSession({ title: '', date: new Date().toISOString().split('T')[0], location: '', facilitator: '' });
    } catch (error) {
      console.error("Failed to create session", error);
      alert("Failed to create session");
      // Revert optimistic update
      setSessions(prev => prev.filter(s => s.id !== session.id));
    }
  };

  const toggleAttendance = async (devoteeId: string) => {
    if (!activeSession) return;

    const isAttending = activeSession.attendeeIds.includes(devoteeId);
    const updatedAttendeeIds = isAttending
      ? activeSession.attendeeIds.filter(id => id !== devoteeId)
      : [...activeSession.attendeeIds, devoteeId];

    const updatedSession = { ...activeSession, attendeeIds: updatedAttendeeIds };
    const updatedSessions = sessions.map(s => s.id === activeSession.id ? updatedSession : s);

    // Optimistic UI
    setActiveSession(updatedSession);
    setSessions(updatedSessions);

    try {
      await storageService.updateSession(updatedSession);

      if (!isAttending) {
        const devotee = devotees.find(d => d.id === devoteeId);
        addNotification('Attendance Marked', `${devotee?.spiritualName || devotee?.name} marked present for ${activeSession.title}`);
      }
    } catch (error) {
      console.error("Failed to update attendance", error);
      // Revert? Complex to revert active session state cleanly without full reload or previous state, 
      // but simplistic revert is usually fine or just alert.
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side: Sessions List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Temple Sessions</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2 bg-orange-100 text-[#FF8C00] rounded-lg hover:bg-orange-200 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white p-5 rounded-xl border border-orange-200 shadow-lg animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800">New Session</h4>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <input
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Session Title (e.g. Sunday Feast)"
                value={newSession.title}
                onChange={e => setNewSession({ ...newSession, title: e.target.value })}
              />
              <input
                required
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                value={newSession.date}
                onChange={e => setNewSession({ ...newSession, date: e.target.value })}
              />
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Facilitator"
                value={newSession.facilitator}
                onChange={e => setNewSession({ ...newSession, facilitator: e.target.value })}
              />
              <button type="submit" className="w-full py-2.5 bg-[#FF8C00] text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-colors">
                Save Session
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session)}
              className={`
                p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden
                ${activeSession?.id === session.id
                  ? 'bg-white border-[#FF8C00] shadow-md ring-1 ring-orange-200'
                  : 'bg-white border-slate-100 hover:border-slate-300'}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{session.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(session.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {session.attendeeIds.length} attended</span>
                  </div>
                </div>
                <ChevronRight className={`transition-transform ${activeSession?.id === session.id ? 'text-orange-500 translate-x-1' : 'text-slate-300'}`} size={20} />
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-12 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-slate-400 text-sm italic">No sessions scheduled.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Attendance Tracker */}
      <div className="lg:col-span-2">
        {activeSession ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-100 text-[#FF8C00] rounded-xl">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Attendance: {activeSession.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <MapPin size={14} /> {activeSession.location} • <Calendar size={14} /> {new Date(activeSession.date).toDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#FF8C00]">{activeSession.attendeeIds.length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Devotees Present</div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {devotees.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {devotees.map(devotee => {
                    const isPresent = activeSession.attendeeIds.includes(devotee.id);
                    return (
                      <div
                        key={devotee.id}
                        onClick={() => toggleAttendance(devotee.id)}
                        className={`
                          flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none
                          ${isPresent
                            ? 'bg-emerald-50 border-emerald-100 shadow-sm'
                            : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'}
                        `}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm">
                            {devotee.photo ? (
                              <img src={devotee.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Users size={20} />
                              </div>
                            )}
                          </div>
                          {isPresent && (
                            <div className="absolute -top-1 -right-1 bg-white rounded-full">
                              <CheckCircle2 size={16} className="text-emerald-500 fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isPresent ? 'text-emerald-700' : 'text-slate-900'}`}>
                            {devotee.spiritualName || devotee.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{devotee.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Users size={48} className="mb-4 text-slate-200" />
                  <p>No devotees available to mark attendance.</p>
                  <p className="text-sm mt-1">Please register devotees first.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Calendar size={64} className="mb-6 opacity-20" />
            <h3 className="text-lg font-bold text-slate-600">Select a Session</h3>
            <p className="max-w-xs mt-2 text-sm">Pick a session from the list on the left to start tracking attendance for devotees.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagement;
