import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { getGitaAnswer } from '../services/geminiService';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const GitaChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const answer = await getGitaAnswer(userMsg);
            setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, I am having trouble connecting right now. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQuestions = [
        "How to deal with anxiety according to the Gita?",
        "What does Krishna say about karma yoga?",
        "How to develop devotion to Krishna?",
        "What is the importance of chanting?",
    ];

    return (
        <div className="glass-card-static overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 14rem)' }}>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-saffron-50 to-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-saffron-gradient flex items-center justify-center shadow-saffron">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Gita Wisdom AI</h3>
                        <p className="text-xs text-slate-500">Answers from the Bhagavad Gita As It Is</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-2xl bg-saffron-50 flex items-center justify-center mx-auto mb-4">
                            <Bot size={28} className="text-saffron-500" />
                        </div>
                        <h4 className="text-base font-bold text-slate-700 mb-2">Hare Krishna! 🙏</h4>
                        <p className="text-sm text-slate-500 mb-6">Ask me anything about the Bhagavad Gita</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                            {suggestedQuestions.map(q => (
                                <button
                                    key={q}
                                    onClick={() => { setInput(q); }}
                                    className="text-left text-xs p-3 rounded-xl border border-slate-200 text-slate-600 hover:border-saffron-300 hover:bg-saffron-50 transition-all"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-lg bg-saffron-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot size={16} className="text-saffron-600" />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-divine-gradient text-white rounded-br-md'
                                : 'bg-slate-50 text-slate-700 rounded-bl-md border border-slate-100'
                            }`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-lg bg-divine-100 flex items-center justify-center flex-shrink-0 mt-1">
                                <User size={16} className="text-divine-600" />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-saffron-100 flex items-center justify-center flex-shrink-0">
                            <Bot size={16} className="text-saffron-600" />
                        </div>
                        <div className="bg-slate-50 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-100">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 bg-white/50">
                <div className="flex gap-2">
                    <input
                        className="input-divine flex-1 text-sm"
                        placeholder="Ask about the Bhagavad Gita..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="btn-divine px-4 disabled:opacity-40"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GitaChat;
