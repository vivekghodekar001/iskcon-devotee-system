import React, { useState, useEffect } from 'react';
import { BrainCircuit, Save, Trash2, CheckCircle, Plus, X, Eye, EyeOff } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Quiz, QuizQuestion } from '../../types';

const AdminQuizManager: React.FC = () => {
    const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([]);
    const [topic, setTopic] = useState('');
    const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
        question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: ''
    });
    const [loading, setLoading] = useState(true);
    const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

    useEffect(() => { loadQuizzes(); }, []);

    const loadQuizzes = async () => {
        try {
            const data = await storageService.getQuizzes();
            setSavedQuizzes(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleManualAdd = () => {
        if (!currentQuestion.question || currentQuestion.options?.some(o => !o)) {
            alert("Please fill all fields for the question.");
            return;
        }
        setManualQuestions([...manualQuestions, { ...currentQuestion, id: crypto.randomUUID() } as QuizQuestion]);
        setCurrentQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
    };

    const handleSave = async () => {
        if (!manualQuestions.length || !topic) {
            alert("Please enter a topic and add at least one question.");
            return;
        }
        try {
            await storageService.createQuiz({ topic, questions: manualQuestions });
            alert("Quiz Saved Successfully!");
            setManualQuestions([]);
            setTopic('');
            loadQuizzes();
        } catch (error) { alert("Failed to save quiz"); }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 animate-in">
            <div className="page-header">
                <h1>Quiz Manager</h1>
                <p>Create and manage quizzes for devotees</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* Left: Creator */}
                <div className="lg:col-span-3 space-y-5">
                    <div className="glass-card-static p-6 space-y-4">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Plus size={18} className="text-divine-600" /> Create New Quiz
                        </h2>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quiz Topic *</label>
                            <input className="input-divine" placeholder="e.g. Bhagavad Gita Chapter 2" value={topic} onChange={e => setTopic(e.target.value)} />
                        </div>

                        {/* Question Builder */}
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Question</p>
                            <input
                                className="input-divine"
                                placeholder="Type your question..."
                                value={currentQuestion.question}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                {currentQuestion.options?.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={currentQuestion.correctAnswer === idx}
                                            onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                                            className="accent-divine-600"
                                        />
                                        <input
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-divine-300 focus:border-divine-400 outline-none transition"
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt}
                                            onChange={e => {
                                                const newOpts = [...(currentQuestion.options || [])];
                                                newOpts[idx] = e.target.value;
                                                setCurrentQuestion({ ...currentQuestion, options: newOpts });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <input
                                className="input-divine text-sm"
                                placeholder="Explanation (Optional)"
                                value={currentQuestion.explanation}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                            />
                            <button onClick={handleManualAdd} className="btn-divine w-full">
                                <Plus size={16} /> Add Question
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    {manualQuestions.length > 0 && (
                        <div className="glass-card-static p-6 space-y-4 animate-in">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-slate-800">Preview ({manualQuestions.length} Questions)</h3>
                                <button onClick={handleSave} className="btn-divine"><Save size={16} /> Save & Publish</button>
                            </div>
                            {manualQuestions.map((q, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 relative group">
                                    <p className="font-semibold text-slate-900 mb-3 pr-8">{idx + 1}. {q.question}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {q.options.map((opt, i) => (
                                            <div key={i} className={`px-3 py-2 rounded-lg text-xs border ${i === q.correctAnswer ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'bg-slate-50 border-transparent text-slate-600'
                                                }`}>
                                                {opt} {i === q.correctAnswer && <CheckCircle size={12} className="inline ml-1" />}
                                            </div>
                                        ))}
                                    </div>
                                    {q.explanation && (
                                        <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-50 pt-2">💡 {q.explanation}</p>
                                    )}
                                    <button
                                        onClick={() => setManualQuestions(manualQuestions.filter((_, i) => i !== idx))}
                                        className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    ><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Published Quizzes Library */}
                <div className="lg:col-span-2">
                    <div className="glass-card-static p-5 sticky top-20">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                            <BrainCircuit size={16} className="text-divine-600" /> Published Quizzes ({savedQuizzes.length})
                        </h3>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                            {savedQuizzes.length > 0 ? (
                                savedQuizzes.map(quiz => (
                                    <div key={quiz.id} className="p-4 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-sm text-slate-800 truncate">{quiz.topic}</h4>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(quiz.createdAt).toLocaleDateString()} • {quiz.questions?.length || 0} Questions
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setPreviewQuiz(previewQuiz?.id === quiz.id ? null : quiz)}
                                                className="text-slate-400 hover:text-divine-600 transition-colors p-1"
                                            ><Eye size={14} /></button>
                                        </div>
                                        {previewQuiz?.id === quiz.id && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in">
                                                {quiz.questions.map((q, i) => (
                                                    <div key={i} className="text-xs text-slate-600">
                                                        <p className="font-medium">{i + 1}. {q.question}</p>
                                                        <p className="text-green-600 ml-3">✓ {q.options[q.correctAnswer]}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400 text-sm">
                                    <BrainCircuit size={32} className="mx-auto mb-3 opacity-30" />
                                    <p>No quizzes published yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminQuizManager;
