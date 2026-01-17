
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { storageService } from '../services/storageService';
import { Sparkles, Minus, Plus, RefreshCw, Trophy, History } from 'lucide-react';
import { ChantingLog } from '../types';

const ChantingCounter: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [rounds, setRounds] = useState(0);
    const [mantras, setMantras] = useState(0);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<ChantingLog[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [immersiveMode, setImmersiveMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // Daily Goal (configurable in future)
    const DAILY_GOAL = 16;

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user?.email) {
                loadDailyProgress(session.user.email);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user?.email) {
                loadDailyProgress(session.user.email);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadDailyProgress = async (email: string) => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];
            const log = await storageService.getChantingLog(email, today);

            if (log) {
                setRounds(log.rounds);
            } else {
                setRounds(0);
            }
        } catch (error) {
            console.error("Error loading chanting logs", error);
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = async (newRounds: number) => {
        if (!session?.user?.email) return;

        try {
            setSaving(true);
            const today = new Date().toISOString().split('T')[0];
            await storageService.updateChantingLog(session.user.email, today, newRounds);
        } catch (error) {
            console.error("Failed to save progress", error);
        } finally {
            setSaving(false);
        }
    };

    const toggleHistory = async () => {
        if (!showHistory) {
            try {
                if (session?.user?.email) {
                    const logs = await storageService.getChantingHistory(session.user.email);
                    setHistory(logs);
                }
            } catch (error) {
                console.error("Failed to load history", error);
            }
        }
        setShowHistory(!showHistory);
    };

    const incrementMantra = () => {
        if (mantras >= 107) {
            // Complete a round
            const newRounds = rounds + 1;
            setRounds(newRounds);
            setMantras(0);
            saveProgress(newRounds);
            playBeep(); // Optional: feedback
        } else {
            setMantras(prev => prev + 1);
        }
    };

    const playBeep = () => {
        // Simple audio feedback could be added here
    };

    // Debounced save could be added, but for rounds (infrequent), direct save is fine.

    const manualAdjustRounds = (adjustment: number) => {
        const newRounds = Math.max(0, rounds + adjustment);
        setRounds(newRounds);
        saveProgress(newRounds);
    };

    const progressPercentage = Math.min(100, (rounds / DAILY_GOAL) * 100);

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Loading your sadhana...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-slate-900">Japa Sadhana</h2>
                    <p className="text-slate-500">Track your daily chanting offering</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleHistory}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                        title="View History"
                    >
                        <History size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full font-bold border border-orange-100">
                        <Trophy size={18} />
                        Goal: {DAILY_GOAL} Rounds
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Counter Card */}
                <div className="glass-card p-8 rounded-3xl text-center space-y-8 border-2 border-[#0F766E]/10 shadow-xl bg-gradient-to-br from-white to-teal-50/20">
                    <div className="space-y-2">
                        <span className="text-sm font-bold uppercase tracking-widest text-[#0F766E]">Current Round</span>
                        <div className="text-8xl font-black text-slate-900 font-serif tabular-nums tracking-tighter">
                            {rounds}
                        </div>
                        <div className="text-slate-400 font-medium">Completed Today</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative pt-4">
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#0F766E] transition-all duration-1000 ease-out relative"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                {progressPercentage >= 100 && (
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                            <span>0</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Manual Controls */}
                    <div className="flex justify-center gap-4 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => manualAdjustRounds(-1)}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <Minus size={20} />
                        </button>
                        <div className="text-center px-4">
                            <div className="text-xs font-bold text-slate-400 uppercase">Beads Adjust</div>
                        </div>
                        <button
                            onClick={() => manualAdjustRounds(1)}
                            className="p-3 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Mantra Clicker */}
                <div className="flex flex-col gap-6">
                    <div
                        onClick={incrementMantra}
                        className="flex-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-200 transition-all group relative overflow-hidden active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative h-full flex flex-col items-center justify-center gap-4">
                            <div className="w-48 h-48 rounded-full border-8 border-orange-100 flex items-center justify-center bg-white shadow-inner">
                                <div className="text-center space-y-1">
                                    <div className="text-5xl font-black text-orange-600 tabular-nums">
                                        {mantras}
                                    </div>
                                    <div className="text-xs font-bold text-orange-300 uppercase">/ 108 Mantras</div>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm font-medium animate-pulse group-hover:text-orange-600">Tap anywhere to chant</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setImmersiveMode(true)}
                        className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        <span className="animate-pulse">●</span> Enter Immersive Mode
                    </button>

                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-700 text-sm">Transcendental Vibration</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                "Hare Krishna Hare Krishna, Krishna Krishna Hare Hare<br />
                                Hare Rama Hare Rama, Rama Rama Hare Hare"
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* History Modal */}
            {
                showHistory && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-lg text-slate-800">Chanting History</h3>
                                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><Minus size={20} className="rotate-45" /></button>
                            </div>
                            <div className="overflow-y-auto p-4 space-y-2">
                                {history.map(log => (
                                    <div key={log.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="font-medium text-slate-600">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                        <span className="font-bold text-teal-700">{log.rounds} Rounds</span>
                                    </div>
                                ))}
                                {history.length === 0 && <p className="text-center text-slate-400 py-8">No history recorded yet.</p>}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Immersive Mode Overlay */}
            {
                immersiveMode && (
                    <div
                        onClick={incrementMantra}
                        className="fixed inset-0 z-[100] bg-slate-900 cursor-pointer flex flex-col items-center justify-center text-white select-none touch-manipulation"
                    >
                        <div className="absolute top-8 right-8">
                            <button
                                onClick={(e) => { e.stopPropagation(); setImmersiveMode(false); }}
                                className="p-4 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
                            >
                                <span className="sr-only">Exit</span>
                                <Minus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <div className="text-center space-y-12 animate-in zoom-in duration-300">
                            <div className="space-y-4">
                                <p className="text-white/50 text-xl font-medium tracking-widest uppercase">Mantra Count</p>
                                <h1 className="text-9xl font-black tabular-nums tracking-tighter">{mantras}</h1>
                                <p className="text-orange-400 font-bold text-2xl">/ 108</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <p className="text-4xl font-serif font-bold text-teal-300">{rounds}</p>
                                <p className="text-sm font-bold text-white/40 uppercase tracking-widest mt-2">Rounds Completed</p>
                            </div>

                            <p className="text-white/30 text-sm animate-pulse">Tap anywhere to chant</p>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ChantingCounter;
