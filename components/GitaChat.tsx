
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, RefreshCw, BookOpen } from 'lucide-react';
import { getGitaAnswer } from '../services/geminiService';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const GitaChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: 'Hare Krishna! I am your spiritual guide based on the Bhagavad Gita As It Is. Ask me any question about life, duty, or spirituality.',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const answer = await getGitaAnswer(userMessage.text);
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: answer,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I apologize, but I am unable to connect to the divine source at the moment. Please try again.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="bg-orange-50 p-4 border-b border-orange-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C00] to-yellow-500 rounded-full flex items-center justify-center text-white shadow-md">
                    <BookOpen size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Ask the Gita</h3>
                    <p className="text-xs text-orange-600 font-medium">Spiritual guidance for modern life</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
              ${msg.sender === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-[#FF8C00]'}
            `}>
                            {msg.sender === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                        </div>
                        <div className={`
              max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed
              ${msg.sender === 'user'
                                ? 'bg-white text-slate-800 border border-slate-100 rounded-tr-none'
                                : 'bg-white text-slate-800 border-l-4 border-l-orange-400 rounded-tl-none'}
            `}>
                            {msg.text.split('\n').map((line, i) => (
                                <p key={i} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>
                            ))}
                            <span className="text-[10px] text-slate-400 mt-2 block opacity-70">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                            <Sparkles size={16} className="text-[#FF8C00]" />
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question (e.g., How to control anger?)"
                        className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-2 p-2 bg-[#FF8C00] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-[#FF8C00] transition-colors shadow-sm"
                    >
                        {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-2">
                    AI generated answers based on Bhagavad Gita As It Is.
                </p>
            </form>
        </div>
    );
};

export default GitaChat;
