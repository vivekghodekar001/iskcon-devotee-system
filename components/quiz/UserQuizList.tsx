import React, { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { supabase } from '../../lib/supabaseClient';

const UserQuizList: React.FC = () => {
    const [pendingQuizzes, setPendingQuizzes] = useState<any[]>([]);
    const [completedQuizzes, setCompletedQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQuizzes = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user?.email) return;

                const profile = await storageService.getProfileByEmail(user.email);
                if (!profile?.id) return;

                const pending = await storageService.getPendingQuizzes(profile.id);
                setPendingQuizzes(pending);

                const { data: results } = await supabase
                    .from('quiz_results')
                    .select('*, quizzes(*)')
                    .eq('student_id', profile.id)
                    .order('completed_at', { ascending: false });

                if (results) {
                    setCompletedQuizzes(results.map(r => ({
                        ...r.quizzes,
                        score: r.score,
                        completedAt: r.completed_at
                    })));
                }
            } catch (error) {
                console.error("Failed to load quizzes", error);
            } finally {
                setLoading(false);
            }
        };
        loadQuizzes();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-8 animate-in max-w-4xl mx-auto">
            <div className="page-header">
                <h1>My Quizzes</h1>
                <p>Track your spiritual knowledge and progress</p>
            </div>

            {/* Pending Section */}
            <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <Clock className="text-saffron-500" size={18} /> Pending Quizzes
                </h2>
                {pendingQuizzes.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingQuizzes.map(quiz => (
                            <div key={quiz.id} className="glass-card p-5 group">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-saffron-400 to-saffron-500 flex items-center justify-center shadow-sm">
                                        <BrainCircuit size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm text-slate-800 truncate">{quiz.topic}</h3>
                                        <p className="text-xs text-slate-500">{quiz.questions?.length || '?'} Questions</p>
                                    </div>
                                </div>
                                <Link
                                    to={`/app/quiz?id=${quiz.id}`}
                                    className="btn-saffron w-full text-sm"
                                >
                                    Start Quiz <ArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card-static p-8 text-center border-dashed border-2 border-slate-200">
                        <CheckCircle size={32} className="text-green-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400 font-medium">All caught up! No pending quizzes 🎉</p>
                    </div>
                )}
            </div>

            {/* Completed Section */}
            <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <CheckCircle className="text-divine-600" size={18} /> Completed History
                </h2>
                <div className="glass-card-static overflow-hidden">
                    {completedQuizzes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3.5 text-left">Quiz Topic</th>
                                        <th className="px-5 py-3.5 text-left">Date</th>
                                        <th className="px-5 py-3.5 text-center">Score</th>
                                        <th className="px-5 py-3.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {completedQuizzes.map((quiz, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4 font-semibold text-sm text-slate-800">{quiz.topic}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500">
                                                {new Date(quiz.completedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`badge text-xs ${quiz.score >= 80 ? 'badge-green' : quiz.score >= 60 ? 'badge-saffron' : 'badge-red'
                                                    }`}>{quiz.score}%</span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="text-xs font-medium text-divine-600 flex items-center justify-center gap-1">
                                                    <CheckCircle size={12} /> Done
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">No completed quizzes yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserQuizList;
