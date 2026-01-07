
import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, Plus, Clock, MapPin, Users, CheckCircle2, ChevronRight, X, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Session, UserProfile } from '../types';

interface Props {
  addNotification: (title: string, message: string) => void;
}

const SessionManagement: React.FC<Props> = ({ addNotification }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create Form State
  const [newSession, setNewSession] = useState<Partial<Session>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    facilitator: '',
    type: 'Regular',
    status: 'Upcoming'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [loadedSessions, loadedStudents] = await Promise.all([
          storageService.getSessions(),
          storageService.getAllProfiles()
        ]);
        setSessions(loadedSessions);
        setStudents(loadedStudents);
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
      description: newSession.description,
      date: newSession.date || new Date().toISOString(),
      location: newSession.location || 'Temple Hall',
      facilitator: newSession.facilitator || 'Unknown',
      type: newSession.type as any || 'Regular',
      status: newSession.status as any || 'Upcoming',
      attendeeIds: []
    };

    // Optimistic Update
    const updated = [session, ...sessions];
    setSessions(updated);

    try {
      await storageService.createSession(session);
      setShowCreateForm(false);
      addNotification('New Session Created', `Session "${session.title}" has been scheduled.`);
      // Reset form
      setNewSession({
        title: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        facilitator: '',
        type: 'Regular',
        status: 'Upcoming'
      });
    } catch (error) {
      console.error("Failed to create session", error);
      alert("Failed to create session");
      // Revert optimistic update
      setSessions(prev => prev.filter(s => s.id !== session.id));
    }
  };

  const toggleAttendance = async (studentId: string) => {
    if (!activeSession) return;

    const isAttending = activeSession.attendeeIds.includes(studentId);
    const updatedAttendeeIds = isAttending
      ? activeSession.attendeeIds.filter(id => id !== studentId)
      : [...activeSession.attendeeIds, studentId];

    const updatedSession = { ...activeSession, attendeeIds: updatedAttendeeIds };
    const updatedSessions = sessions.map(s => s.id === activeSession.id ? updatedSession : s);

    // Optimistic UI
    setActiveSession(updatedSession);
    setSessions(updatedSessions);

    try {
      await storageService.updateSession(updatedSession);

      if (!isAttending) {
        const student = students.find(s => s.id === studentId);
        addNotification('Attendance Marked', `${student?.spiritualName || student?.name} marked present for ${activeSession.title}`);
      }
    } catch (error) {
      console.error("Failed to update attendance", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side: Sessions List */}
      <div className="lg:col-span-1 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 font-serif">Academy Sessions</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-2 btn-divine rounded-lg transition-transform hover:scale-105"
          >
            <Plus size={20} />
          </button>
        </div>

        {showCreateForm && (
          <div className="glass-card p-5 rounded-xl animate-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-[#0F766E]">New Session</h4>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <input
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500"
                placeholder="Session Title"
                value={newSession.title}
                onChange={e => setNewSession({ ...newSession, title: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  value={newSession.type}
                  onChange={e => setNewSession({ ...newSession, type: e.target.value as any })}
                >
                  <option value="Regular">Regular</option>
                  <option value="Camp">Camp</option>
                  <option value="Event">Event</option>
                </select>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  value={newSession.status}
                  onChange={e => setNewSession({ ...newSession, status: e.target.value as any })}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <input
                required
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                value={newSession.date}
                onChange={e => setNewSession({ ...newSession, date: e.target.value })}
              />
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
                placeholder="Facilitator"
                value={newSession.facilitator}
                onChange={e => setNewSession({ ...newSession, facilitator: e.target.value })}
              />
              <button type="submit" className="w-full py-2.5 btn-divine font-bold rounded-lg shadow-md transition-colors">
                Schedule Session
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
                  ? 'glass-card border-[#0F766E] shadow-md ring-1 ring-teal-200'
                  : 'bg-white/50 border-slate-100 hover:border-teal-200'}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${session.status === 'Ongoing' ? 'bg-green-100 text-green-700 animate-pulse' :
                        session.status === 'Completed' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {session.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-slate-50 rounded-full">{session.type}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">{session.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(session.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {session.attendeeIds.length}</span>
                  </div>
                </div>
                <ChevronRight className={`transition-transform ${activeSession?.id === session.id ? 'text-[#0F766E] translate-x-1' : 'text-slate-300'}`} size={20} />
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-12 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-slate-400 text-sm italic">No spiritual sessions active.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Attendance Tracker */}
      <div className="lg:col-span-2">
        {activeSession ? (
          <div className="glass-card rounded-2xl border border-white/50 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-white/20 bg-teal-50/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-100 text-[#0F766E] rounded-xl">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-serif">Attendance: {activeSession.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <MapPin size={14} /> {activeSession.location} • <Calendar size={14} /> {new Date(activeSession.date).toDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#0F766E]">{activeSession.attendeeIds.length}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students</div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {students.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {students.map(student => {
                    const isPresent = activeSession.attendeeIds.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleAttendance(student.id)}
                        className={`
                          flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none
                          ${isPresent
                            ? 'bg-emerald-50/80 border-emerald-100 shadow-sm'
                            : 'bg-white/60 border-slate-100 hover:bg-white hover:border-teal-100'}
                        `}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm">
                            {student.photoUrl ? (
                              <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
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
                            {student.spiritualName || student.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{student.branch} • {student.yearOfStudy}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Sparkles size={48} className="mb-4 text-teal-100" />
                  <p>No students registered yet.</p>
                  <p className="text-sm mt-1">Share the 'Join' link to get started.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Calendar size={64} className="mb-6 opacity-20" />
            <h3 className="text-lg font-bold text-slate-600">Select a Session</h3>
            <p className="max-w-xs mt-2 text-sm">Pick a session from the list on the left to start tracking attendance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManagement;
