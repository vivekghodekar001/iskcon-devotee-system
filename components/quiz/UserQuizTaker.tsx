import React, { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { Quiz } from '../../types';
import { supabase } from '../../lib/supabaseClient';

const UserQuizTaker: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const quizId = searchParams.get('id');

    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!quizId) {
            setLoading(false);
            return;
        }
        loadQuiz(quizId);
    }, [quizId]);

    const loadQuiz = async (id: string) => {
        try {
            // In a real app, optimize this to get single quiz. For now, filter from list.
            const quizzes = await storageService.getQuizzes();
            const quiz = quizzes.find(q => q.id === id);

            if (quiz) {
                setActiveQuiz(quiz);
                setAnswers({});
                setSubmitted(false);
                setScore(0);
            } else {
                setError('Quiz not found.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load quiz.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionIndex: number, optionIndex: number) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (!activeQuiz) return;

        // Calculate score
        let correctCount = 0;
        activeQuiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) {
                correctCount++;
            }
        });

        const calculatedScore = Math.round((correctCount / activeQuiz.questions.length) * 100);
        setScore(calculatedScore);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                const profile = await storageService.getProfileByEmail(user.email);
                if (profile) {
                    await storageService.saveQuizResult({
                        quizId: activeQuiz.id,
                        studentId: profile.id,
                        score: calculatedScore,
                        totalQuestions: activeQuiz.questions.length
                    });
                }
            }
            setSubmitted(true);
        } catch (err) {
            console.error("Failed to save assignment", err);
            alert("Failed to submit result. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p>Loading Quiz...</p>
            </div>
        );
    }

    if (!quizId || !activeQuiz || error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Quiz Unavailable</h2>
                <p className="text-slate-500 mb-6 text-center max-w-md">
                    {error || "No quiz specified. Please select a pending quiz from your dashboard."}
                </p>
                <button
                    onClick={() => navigate('/app')}
                    className="px-6 py-2 bg-slate-100 font-bold text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="mb-8 border-b border-slate-100 pb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 font-serif">{activeQuiz.topic}</h1>
                            <p className="text-slate-500 mt-2 flex items-center gap-2">
                                <BrainCircuit size={16} /> {activeQuiz.questions.length} Questions
                            </p>
                        </div>
                        {!submitted && (
                            <div className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs">
                                <Clock size={14} /> In Progress
                            </div>
                        )}
                    </div>
                </div>

                {submitted && (
                    <div className="mb-8 bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-4">
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Score: {score}%</h3>
                            <p className="opacity-90 font-medium">
                                {score === 100 ? 'Perfect Score! Haribol!' : 'Good effort! Keep studying!'}
                            </p>
                            <button
                                onClick={() => navigate('/app')}
                                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                        <div className="bg-white/20 p-4 rounded-full">
                            <CheckCircle size={40} />
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {activeQuiz.questions.map((q, qIdx) => {
                        const isCorrect = answers[qIdx] === q.correctAnswer;
                        const userAnswer = answers[qIdx];

                        return (
                            <div key={qIdx} className={`relative p-4 rounded-xl transition-all ${submitted ? (isCorrect ? 'bg-green-50/50' : 'bg-red-50/50') : 'hover:bg-slate-50'}`}>
                                <h3 className="font-bold text-lg text-slate-800 mb-4 flex gap-3">
                                    <span className="text-slate-300 font-mono">{qIdx + 1}.</span> {q.question}
                                </h3>

                                <div className="space-y-2 pl-8">
                                    {q.options.map((opt, oIdx) => {
                                        let optionClass = "border-slate-200 hover:bg-slate-50";

                                        if (submitted) {
                                            if (oIdx === q.correctAnswer) optionClass = "border-green-500 bg-green-100 text-green-900 font-bold";
                                            else if (oIdx === userAnswer && userAnswer !== q.correctAnswer) optionClass = "border-red-300 bg-red-100 text-red-900";
                                            else optionClass = "opacity-40 border-transparent";
                                        } else if (userAnswer === oIdx) {
                                            optionClass = "border-[#0F766E] bg-teal-50 ring-1 ring-[#0F766E] text-teal-900 font-bold shadow-sm";
                                        }

                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleAnswer(qIdx, oIdx)}
                                                disabled={submitted}
                                                className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${optionClass}`}
                                            >
                                                <span>{opt}</span>
                                                {submitted && oIdx === q.correctAnswer && <CheckCircle size={18} className="text-green-600" />}
                                                {submitted && oIdx === userAnswer && userAnswer !== q.correctAnswer && <AlertCircle size={18} className="text-red-500" />}
                                            </button>
                                        )
                                    })}
                                </div>

                                {submitted && q.explanation && (
                                    <div className="ml-8 mt-4 p-3 bg-white rounded-lg text-sm text-slate-600 border-l-4 border-slate-300 shadow-sm">
                                        <strong>Explanation:</strong> {q.explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {!submitted && (
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={Object.keys(answers).length < activeQuiz.questions.length}
                            className="btn-divine px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all"
                        >
                            Submit Answers
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserQuizTaker;
