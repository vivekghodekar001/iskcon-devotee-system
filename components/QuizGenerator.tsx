import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, Save, Trash2, CheckCircle, Plus } from 'lucide-react';
import { generateQuiz } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Quiz, QuizQuestion } from '../types';

const QuizGenerator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[] | null>(null);
    const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([]);

    // Manual Form State
    const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
    });

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            const data = await storageService.getQuizzes();
            setSavedQuizzes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        setIsGenerating(true);
        try {
            const questions = await generateQuiz(topic);
            setGeneratedQuiz(questions);
        } catch (error) {
            alert("Failed to generate quiz. Please check your API key or try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleManualAdd = () => {
        if (!currentQuestion.question || currentQuestion.options?.some(o => !o)) {
            alert("Please fill all fields for the question.");
            return;
        }
        setManualQuestions([...manualQuestions, { ...currentQuestion, id: crypto.randomUUID() } as QuizQuestion]);
        setCurrentQuestion({
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: ''
        });
    };

    const handleSave = async (questionsToSave: QuizQuestion[]) => {
        if (!questionsToSave.length || !topic) {
            alert("Please enter a topic and add at least one question.");
            return;
        }
        try {
            await storageService.createQuiz({
                topic,
                questions: questionsToSave
            });
            alert("Quiz Saved Successfully!");
            setGeneratedQuiz(null);
            setManualQuestions([]);
            setTopic('');
            loadQuizzes();
        } catch (error) {
            alert("Failed to save quiz");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-100px)] overflow-hidden">
            {/* Left Panel: Creator */}
            <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
                        <BrainCircuit className="text-[#0F766E]" /> Quiz Creator
                    </h2>
                    <p className="text-slate-500 text-sm">Create quizzes using AI or manually.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'ai' ? 'text-[#0F766E] border-b-2 border-[#0F766E]' : 'text-slate-400'}`}
                    >
                        AI Generator
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`pb-2 px-4 font-medium transition-colors ${activeTab === 'manual' ? 'text-[#0F766E] border-b-2 border-[#0F766E]' : 'text-slate-400'}`}
                    >
                        Manual Entry
                    </button>
                </div>

                {activeTab === 'ai' ? (
                    <form onSubmit={handleGenerate} className="glass-card p-6 rounded-2xl border border-teal-100 shadow-sm">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Quiz Topic</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                                placeholder="e.g. Bhagavad Gita Chapter 2, Karma Yoga..."
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                disabled={isGenerating}
                            />
                            <button
                                type="submit"
                                disabled={isGenerating || !topic}
                                className="btn-divine px-6 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                {isGenerating ? <span className="animate-spin">🌀</span> : <Sparkles size={18} />}
                                {isGenerating ? 'Thinking...' : 'Generate'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="glass-card p-6 rounded-2xl border border-teal-100 shadow-sm space-y-4">
                        <input
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                            placeholder="Quiz Topic / Title"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                        />

                        <div className="space-y-3 p-4 bg-slate-50 rounded-xl">
                            <input
                                className="w-full px-3 py-2 rounded-lg border border-slate-200"
                                placeholder="Type Question Here..."
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
                                        />
                                        <input
                                            className="flex-1 px-2 py-1.5 rounded-md border border-slate-200 text-sm"
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
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                placeholder="Explanation (Optional)"
                                value={currentQuestion.explanation}
                                onChange={e => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                            />
                            <button
                                onClick={handleManualAdd}
                                className="w-full py-2 bg-[#0F766E] text-white rounded-lg font-bold text-sm hover:bg-teal-700 transition-colors"
                            >
                                <Plus size={16} className="inline mr-1" /> Add Question
                            </button>
                        </div>
                    </div>
                )}

                {/* Preview Area */}
                {(generatedQuiz || manualQuestions.length > 0) && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500 pb-10">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-800">
                                Preview ({activeTab === 'ai' ? generatedQuiz?.length : manualQuestions.length} Questions)
                            </h3>
                            <button
                                onClick={() => handleSave((activeTab === 'ai' ? generatedQuiz : manualQuestions) || [])}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                            >
                                <Save size={18} /> Save Quiz
                            </button>
                        </div>

                        {(activeTab === 'ai' ? generatedQuiz : manualQuestions)?.map((q, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative group">
                                <p className="font-bold text-slate-900 mb-3">{idx + 1}. {q?.question}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q?.options.map((opt, i) => (
                                        <div
                                            key={i}
                                            className={`p-2 rounded-lg text-sm border ${i === q.correctAnswer
                                                    ? 'bg-green-50 border-green-200 text-green-800 font-medium'
                                                    : 'bg-slate-50 border-transparent text-slate-600'
                                                }`}
                                        >
                                            {opt} {i === q.correctAnswer && <CheckCircle size={14} className="inline ml-1" />}
                                        </div>
                                    ))}
                                </div>
                                {q?.explanation && (
                                    <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-50 pt-2">
                                        💡 {q.explanation}
                                    </p>
                                )}
                                {activeTab === 'manual' && (
                                    <button
                                        onClick={() => setManualQuestions(manualQuestions.filter((_, i) => i !== idx))}
                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Panel: Library */}
            <div className="glass-card p-6 rounded-2xl flex flex-col h-full overflow-hidden border-l-4 border-[#0F766E]">
                <h3 className="font-bold text-[#0F766E] mb-4 flex items-center gap-2">
                    <Save size={20} /> Quiz Library
                </h3>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {savedQuizzes.length > 0 ? (
                        savedQuizzes.map(quiz => (
                            <div key={quiz.id} className="p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{quiz.topic}</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(quiz.createdAt).toLocaleDateString()} • {quiz.questions?.length || 0} Questions
                                        </p>
                                    </div>
                                    <button className="text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <p>No saved quizzes yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizGenerator;
