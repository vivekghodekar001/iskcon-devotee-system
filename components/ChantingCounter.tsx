import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { storageService } from '../services/storageService';
import { Sparkles, Minus, Plus, RefreshCw, Trophy, History, ChevronDown } from 'lucide-react';
import { ChantingLog } from '../types';

const BEADS_PER_ROUND = 108;

const ChantingCounter: React.FC = () => {
    const [userEmail, setUserEmail] = useState('');
    const [currentBeads, setCurrentBeads] = useState(0);
    const [completedRounds, setCompletedRounds] = useState(0);
    const [dailyGoal] = useState(16);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<ChantingLog[]>([]);
    const [saving, setSaving] = useState(false);
    const [celebrating, setCelebrating] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                setUserEmail(session.user.email);
                loadDailyProgress(session.user.email);
            }
        };
        init();
    }, []);

    const loadDailyProgress = async (email: string) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const log = await storageService.getChantingLog(email, today);
            if (log) setCompletedRounds(log.rounds);
        } catch (err) { console.error(err); }
    };

    const saveProgress = async (newRounds: number) => {
        setSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            await storageService.updateChantingLog(userEmail, today, newRounds);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const toggleHistory = async () => {
        if (!showHistory && history.length === 0) {
            try {
                const h = await storageService.getChantingHistory(userEmail);
                setHistory(h);
            } catch (err) { console.error(err); }
        }
        setShowHistory(!showHistory);
    };

    const incrementBead = useCallback(() => {
        setCurrentBeads(prev => {
            const next = prev + 1;
            if (next >= BEADS_PER_ROUND) {
                const newRounds = completedRounds + 1;
                setCompletedRounds(newRounds);
                saveProgress(newRounds);
                setCelebrating(true);
                setTimeout(() => setCelebrating(false), 1500);
                // Play sound
                try {
                    const ctx = new AudioContext();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = 800;
                    gain.gain.setValueAtTime(0.3, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.5);
                } catch { }
                return 0;
            }
            return next;
        });
    }, [completedRounds, userEmail]);

    const adjustRounds = (delta: number) => {
        const newRounds = Math.max(0, completedRounds + delta);
        setCompletedRounds(newRounds);
        saveProgress(newRounds);
    };

    const progress = (currentBeads / BEADS_PER_ROUND) * 100;
    const dailyProgress = Math.min((completedRounds / dailyGoal) * 100, 100);
    const circumference = 2 * Math.PI * 120;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="space-y-6 animate-in max-w-lg mx-auto">
            <div className="page-header text-center">
                <h1>Japa Sadhana</h1>
                <p>Hare Krishna Maha Mantra Counter</p>
            </div>

            {/* Main Counter */}
            <div className="glass-card-static p-8 text-center relative overflow-hidden">
                {celebrating && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/80 backdrop-blur-sm animate-in">
                        <div className="text-center">
                            <Trophy size={48} className="text-saffron-500 mx-auto mb-3 animate-float" />
                            <p className="text-xl font-bold text-slate-900">Round Complete! 🎉</p>
                            <p className="text-sm text-slate-500">{completedRounds} rounds today</p>
                        </div>
                    </div>
                )}

                {/* Circular Progress */}
                <div className="relative w-64 h-64 mx-auto mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
                        <circle cx="128" cy="128" r="120" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <circle
                            cx="128" cy="128" r="120" fill="none"
                            stroke="url(#gradient)" strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-200"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0F766E" />
                                <stop offset="100%" stopColor="#14B8A6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-bold text-slate-900">{currentBeads}</span>
                        <span className="text-sm text-slate-500 font-medium mt-1">of {BEADS_PER_ROUND}</span>
                    </div>
                </div>

                {/* Tap Button */}
                <button
                    onClick={incrementBead}
                    className="w-20 h-20 rounded-full bg-divine-gradient text-white shadow-divine-lg mx-auto flex items-center justify-center active:scale-90 transition-transform hover:shadow-divine-lg focus:outline-none"
                >
                    <Sparkles size={28} />
                </button>
                <p className="text-xs text-slate-400 mt-3">Tap to count each bead</p>

                {/* Reset */}
                <button onClick={() => setCurrentBeads(0)} className="btn-ghost text-xs mt-3 mx-auto">
                    <RefreshCw size={14} /> Reset Beads
                </button>
            </div>

            {/* Rounds Summary */}
            <div className="glass-card-static p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Today's Rounds</p>
                        <p className="text-3xl font-bold text-divine-700">{completedRounds} <span className="text-lg text-slate-400 font-normal">/ {dailyGoal}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => adjustRounds(-1)} className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <Minus size={16} className="text-slate-600" />
                        </button>
                        <button onClick={() => adjustRounds(1)} className="w-9 h-9 rounded-lg bg-divine-50 hover:bg-divine-100 flex items-center justify-center transition-colors">
                            <Plus size={16} className="text-divine-700" />
                        </button>
                    </div>
                </div>

                {/* Daily Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-divine-gradient rounded-full transition-all duration-500"
                        style={{ width: `${dailyProgress}%` }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">{Math.round(dailyProgress)}% complete</p>

                {saving && <p className="text-xs text-divine-600 mt-2 animate-pulse">💾 Saving...</p>}
            </div>

            {/* History */}
            <div className="glass-card-static overflow-hidden">
                <button onClick={toggleHistory} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <History size={16} /> Chanting History
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                </button>

                {showHistory && (
                    <div className="border-t border-slate-100 max-h-64 overflow-y-auto">
                        {history.length === 0 ? (
                            <p className="p-4 text-sm text-slate-400 text-center">No history yet</p>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {history.map(log => (
                                    <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                                        <span className="text-sm text-slate-600">
                                            {new Date(log.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-divine-700">{log.rounds}</span>
                                            <span className="text-xs text-slate-400">rounds</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChantingCounter;
