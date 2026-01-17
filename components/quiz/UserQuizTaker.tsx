import React, { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Quiz, QuizQuestion } from '../../types';

const UserQuizTaker: React.FC = () => {
    const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            const data = await storageService.getQuizzes();
            setAvailableQuizzes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStartQuiz = (quiz: Quiz) => {
        setActiveQuiz(quiz);
        setAnswers({});
        setSubmitted(false);
        setScore(0);
    };

    const handleAnswer = (questionIndex: number, optionIndex: number) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    };

    const handleSubmit = () => {
        if (!activeQuiz) return;

        // Calculate score
        let correctCount = 0;
        activeQuiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) {
                correctCount++;
            }
        });

        setScore(Math.round((correctCount / activeQuiz.questions.length) * 100));
        setSubmitted(true);
        // Here you would save the result to the DB
    };

    if (activeQuiz) {
        return (
            <div className="max-w-3xl mx-auto pb-10">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setActiveQuiz(null)}
                        className="text-slate-500 hover:text-slate-800 text-sm font-bold"
                    >
                        ← Back to Quizzes
                    </button>
                    {!submitted && (
                        <div className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full text-xs">
                            <Clock size={14} /> In Progress
                        </div>
                    )}
                </div>

                <div className="glass-card p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h1 className="text-2xl font-bold text-slate-900 font-serif">{activeQuiz.topic}</h1>
                        <p className="text-slate-500 mt-2">{activeQuiz.questions.length} Questions</p>
                    </div>

                    {submitted && (
                        <div className="mb-8 bg-gradient-to-r from-teal-500 to-emerald-500 text-white p-6 rounded-xl flex items-center justify-between shadow-lg">
                            <div>
                                <h3 className="text-2xl font-bold mb-1">Score: {score}%</h3>
                                <p className="opacity-90">{score === 100 ? 'Perfect Score! Haribol!' : 'Good effort! Keep studying!'}</p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-full">
                                <CheckCircle size={32} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-8">
                        {activeQuiz.questions.map((q, qIdx) => {
                            const isCorrect = answers[qIdx] === q.correctAnswer;
                            const userAnswer = answers[qIdx];

                            return (
                                <div key={qIdx} className={`relative ${submitted ? (isCorrect ? 'opacity-100' : 'opacity-80') : ''}`}>
                                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex gap-3">
                                        <span className="text-slate-300">{qIdx + 1}.</span> {q.question}
                                    </h3>

                                    <div className="space-y-2 pl-8">
                                        {q.options.map((opt, oIdx) => {
                                            let optionClass = "border-slate-200 hover:bg-slate-50/80";
                                            if (submitted) {
                                                if (oIdx === q.correctAnswer) optionClass = "border-green-500 bg-green-50 text-green-800 font-medium";
                                                else if (oIdx === userAnswer && userAnswer !== q.correctAnswer) optionClass = "border-red-300 bg-red-50 text-red-800";
                                                else optionClass = "opacity-50 border-transparent";
                                            } else if (userAnswer === oIdx) {
                                                optionClass = "border-[#0F766E] bg-teal-50 ring-1 ring-[#0F766E] text-teal-900 font-medium shadow-sm";
                                            }

                                            return (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => handleAnswer(qIdx, oIdx)}
                                                    disabled={submitted}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${optionClass}`}
                                                >
                                                    {opt}
                                                    {submitted && oIdx === q.correctAnswer && <CheckCircle size={16} className="text-green-600" />}
                                                    {submitted && oIdx === userAnswer && userAnswer !== q.correctAnswer && <AlertCircle size={16} className="text-red-500" />}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {submitted && q.explanation && (
                                        <div className="ml-8 mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 italic border-l-2 border-slate-300">
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
                                className="btn-divine px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit Answers
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
                    <BrainCircuit className="text-[#0F766E]" /> Active Quizzes
                </h1>
                <p className="text-slate-500 text-sm">Test your knowledge of the scriptures.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableQuizzes.map(quiz => (
                    <div key={quiz.id} className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all border border-slate-100 group">
                        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                            <BrainCircuit size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{quiz.topic}</h3>
                        <p className="text-xs text-slate-400 mt-2 mb-6">
                            {quiz.questions.length} Questions • Added {new Date(quiz.createdAt).toLocaleDateString()}
                        </p>
                        <button
                            onClick={() => handleStartQuiz(quiz)}
                            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:border-[#0F766E] hover:text-[#0F766E] transition-all"
                        >
                            Start Quiz
                        </button>
                    </div>
                ))}

                {availableQuizzes.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                        <p>No quizzes assigned yet. Check back later!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserQuizTaker;
