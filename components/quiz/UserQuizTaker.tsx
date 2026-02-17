import React, { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle, Clock, AlertCircle, Trophy, ArrowLeft } from 'lucide-react';
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
        if (!quizId) { setLoading(false); return; }
        loadQuiz(quizId);
    }, [quizId]);

    const loadQuiz = async (id: string) => {
        try {
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

        let correctCount = 0;
        activeQuiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) correctCount++;
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
            console.error("Failed to save result", err);
            alert("Failed to submit result. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
                <p className="text-sm">Loading Quiz...</p>
            </div>
        );
    }

    if (!quizId || !activeQuiz || error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertCircle size={48} className="text-red-300 mb-4" />
                <h2 className="text-lg font-bold text-slate-800 mb-2">Quiz Unavailable</h2>
                <p className="text-sm text-slate-500 mb-6 max-w-md">
                    {error || "No quiz specified. Please select a pending quiz from your dashboard."}
                </p>
                <button onClick={() => navigate('/app/my-quizzes')} className="btn-ghost">
                    <ArrowLeft size={16} /> Back to Quizzes
                </button>
            </div>
        );
    }

    const allAnswered = Object.keys(answers).length >= activeQuiz.questions.length;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in pb-8">
            {/* Header */}
            <div className="glass-card-static p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 font-serif">{activeQuiz.topic}</h1>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                            <BrainCircuit size={14} /> {activeQuiz.questions.length} Questions
                        </p>
                    </div>
                    {!submitted && (
                        <span className="badge badge-saffron flex items-center gap-1">
                            <Clock size={12} /> In Progress
                        </span>
                    )}
                </div>
            </div>

            {/* Score Banner */}
            {submitted && (
                <div className="glass-card-static overflow-hidden animate-in">
                    <div className={`p-6 text-white flex items-center justify-between ${score >= 80 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                            score >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}>
                        <div>
                            <p className="text-sm font-medium opacity-90">Your Score</p>
                            <p className="text-3xl font-bold mt-1">{score}%</p>
                            <p className="text-sm opacity-90 mt-1">
                                {score === 100 ? 'Perfect! Haribol! 🙏' : score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good effort!' : 'Keep studying!'}
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            {score >= 80 ? <Trophy size={32} /> : <CheckCircle size={32} />}
                        </div>
                    </div>
                    <div className="p-4 bg-white flex gap-3">
                        <button onClick={() => navigate('/app/my-quizzes')} className="btn-ghost flex-1 text-sm">
                            <ArrowLeft size={14} /> Back to Quizzes
                        </button>
                        <button onClick={() => navigate('/app')} className="btn-divine flex-1 text-sm">
                            Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
                {activeQuiz.questions.map((q, qIdx) => {
                    const isCorrect = answers[qIdx] === q.correctAnswer;
                    const userAnswer = answers[qIdx];

                    return (
                        <div key={qIdx} className={`glass-card-static p-5 transition-all ${submitted ? (isCorrect ? 'ring-1 ring-green-200' : 'ring-1 ring-red-200') : ''
                            }`}>
                            <h3 className="font-semibold text-slate-800 mb-4 flex gap-2 text-sm">
                                <span className="text-slate-400 font-mono flex-shrink-0">{qIdx + 1}.</span>
                                {q.question}
                            </h3>
                            <div className="space-y-2 pl-5">
                                {q.options.map((opt, oIdx) => {
                                    let cls = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                                    if (submitted) {
                                        if (oIdx === q.correctAnswer) cls = 'border-green-400 bg-green-50 text-green-800 font-medium';
                                        else if (oIdx === userAnswer && userAnswer !== q.correctAnswer) cls = 'border-red-300 bg-red-50 text-red-800';
                                        else cls = 'border-transparent bg-slate-50 text-slate-400';
                                    } else if (userAnswer === oIdx) {
                                        cls = 'border-divine-500 bg-divine-50 text-divine-800 font-medium ring-1 ring-divine-300';
                                    }

                                    return (
                                        <button
                                            key={oIdx}
                                            onClick={() => handleAnswer(qIdx, oIdx)}
                                            disabled={submitted}
                                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex justify-between items-center ${cls}`}
                                        >
                                            <span>{opt}</span>
                                            {submitted && oIdx === q.correctAnswer && <CheckCircle size={16} className="text-green-600 flex-shrink-0" />}
                                            {submitted && oIdx === userAnswer && userAnswer !== q.correctAnswer && <AlertCircle size={16} className="text-red-500 flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                            {submitted && q.explanation && (
                                <div className="ml-5 mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 border-l-3 border-blue-300">
                                    💡 <strong>Explanation:</strong> {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Submit Button */}
            {!submitted && (
                <div className="text-right">
                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className="btn-divine px-8 py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Submit Answers
                    </button>
                    {!allAnswered && (
                        <p className="text-xs text-slate-400 mt-2">
                            Answer all questions to submit ({Object.keys(answers).length}/{activeQuiz.questions.length})
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserQuizTaker;
