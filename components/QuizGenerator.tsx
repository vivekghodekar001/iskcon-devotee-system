import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, Save, Trash2, CheckCircle, Plus } from 'lucide-react';
import { generateQuiz } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { Quiz, QuizQuestion } from '../types';

const QuizGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[] | null>(null);
    const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([]);

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

    const handleSave = async () => {
        if (!generatedQuiz) return;
        try {
            await storageService.createQuiz({
                topic,
                questions: generatedQuiz
            });
            alert("Quiz Saved Successfully!");
            setGeneratedQuiz(null);
            setTopic('');
            loadQuizzes();
        } catch (error) {
            alert("Failed to save quiz");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-100px)] overflow-hidden">
            {/* Left Panel: Generator */}
            <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
                        <BrainCircuit className="text-[#0F766E]" /> AI Quiz Generator
                    </h2>
                    <p className="text-slate-500 text-sm">Create instant quizzes from any spiritual topic using Gemini AI.</p>
                </div>

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

                {generatedQuiz && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-800">Preview Quiz ({generatedQuiz.length} Questions)</h3>
                            <button
                                onClick={handleSave}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                            >
                                <Save size={18} /> Save to Library
                            </button>
                        </div>

                        {generatedQuiz.map((q, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                <p className="font-bold text-slate-900 mb-3">{idx + 1}. {q.question}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {q.options.map((opt, i) => (
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
                                {q.explanation && (
                                    <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-50 pt-2">
                                        💡 {q.explanation}
                                    </p>
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
