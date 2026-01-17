import React, { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle, Clock, ChevronRight, ArrowRight } from 'lucide-react';
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

                // 1. Get Pending
                const pending = await storageService.getPendingQuizzes(profile.id);
                setPendingQuizzes(pending);

                // 2. Get Completed (We'll assume we can filter storageService.getQuizzes or fetch results)
                // Since specific method missing, we'll implement a basic fetch for now using existing storageService patterns
                // Or just show pending. The user asked for "quiz session".
                // Let's stick to Pending + maybe "Recently Completed" if we had the API.
                // For now, let's fetch ALL quizzes and see which ones are in "results"

                // Fetching all quizzes to find completed ones
                // Ideally storageService should have getCompletedQuizzes but we can do it manually here for now
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
        return <div className="p-8 text-center text-slate-400">Loading quizzes...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">My Quizzes</h1>
                    <p className="text-slate-500">Track your spiritual knowledge and progress</p>
                </div>
            </div>

            {/* Pending Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Clock className="text-orange-500" size={20} /> Pending Quizzes
                </h2>

                {pendingQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingQuizzes.map(quiz => (
                            <div key={quiz.id} className="glass-card p-5 rounded-xl border border-orange-100 bg-orange-50/30 hover:shadow-md transition-all relative group">
                                <div className="absolute top-4 right-4 text-orange-400 bg-white p-2 rounded-full shadow-sm">
                                    <BrainCircuit size={20} />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 pr-12 line-clamp-1">{quiz.topic}</h3>
                                <p className="text-sm text-slate-500 mt-1 mb-4">{quiz.questions?.length || '?'} Questions</p>

                                <Link
                                    to={`/app/quiz?id=${quiz.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FF8C00] hover:bg-orange-600 text-white rounded-lg font-bold transition-colors shadow-sm"
                                >
                                    Start Quiz <ArrowRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-8 rounded-2xl text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
                        <p className="text-slate-400 font-medium">No pending quizzes! Great job!</p>
                    </div>
                )}
            </div>

            {/* Completed Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <CheckCircle className="text-teal-600" size={20} /> Completed History
                </h2>

                <div className="glass-card rounded-2xl overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">Quiz Topic</th>
                                    <th className="px-6 py-4 text-left">Date</th>
                                    <th className="px-6 py-4 text-center">Score</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {completedQuizzes.map((quiz, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-bold text-slate-800">{quiz.topic}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(quiz.completedAt).toLocaleDateString()}
                                        </td >
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${quiz.score >= 80 ? 'bg-green-100 text-green-700' :
                                                    quiz.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {quiz.score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-teal-600 flex items-center justify-center gap-1">
                                                <CheckCircle size={14} /> Completed
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {completedQuizzes.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                                            No completed quizzes yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserQuizList;
