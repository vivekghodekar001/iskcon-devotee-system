import React, { useState, useEffect } from 'react';
import { BookOpen, Star, MessageCircle, RefreshCw, Sparkles } from 'lucide-react';
import { getDailyGitaQuote } from '../services/geminiService';
import { GitaQuote } from '../types';
import GitaChat from './GitaChat';

const GitaInsights: React.FC = () => {
  const [quote, setQuote] = useState<GitaQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => { loadQuote(); }, []);

  const loadQuote = async () => {
    setLoading(true);
    try {
      const q = await getDailyGitaQuote();
      setQuote(q);
    } catch { }
    finally { setLoading(false); }
  };

  if (showChat) {
    return (
      <div className="space-y-4 animate-in">
        <button onClick={() => setShowChat(false)} className="btn-ghost text-sm">
          ← Back to Daily Verse
        </button>
        <GitaChat />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in max-w-2xl mx-auto">
      <div className="page-header text-center">
        <h1>Gita Wisdom</h1>
        <p>Daily inspiration from the Bhagavad Gita</p>
      </div>

      {/* Daily Verse Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-divine-800 via-divine-700 to-divine-600 text-white">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-saffron-500/10 rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white/5 rounded-full animate-float" />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-2 mb-5">
            <Star className="text-saffron-300" size={20} />
            <span className="text-sm font-bold text-saffron-300 uppercase tracking-wider">Daily Verse</span>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : quote ? (
            <>
              {/* Sanskrit */}
              <div className="bg-white/10 rounded-xl p-4 mb-5 backdrop-blur-sm border border-white/10">
                <p className="text-sm font-light italic leading-relaxed opacity-90 whitespace-pre-line">{quote.verse}</p>
              </div>

              {/* Translation */}
              <div className="mb-5">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Translation</p>
                <p className="text-lg leading-relaxed font-light">{quote.translation}</p>
              </div>

              {/* Purport */}
              <div className="mb-5">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Purport</p>
                <p className="text-sm leading-relaxed opacity-85">{quote.purport}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-saffron-300 font-bold text-sm">
                  Chapter {quote.chapter}, Verse {quote.text}
                </span>
                <button onClick={loadQuote} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                  <RefreshCw size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Sparkles size={32} className="mx-auto mb-3 text-saffron-300/50" />
              <p className="opacity-60">Could not load verse. Please try refreshing.</p>
              <button onClick={loadQuote} className="mt-3 text-sm text-saffron-300 font-semibold hover:underline">Try Again</button>
            </div>
          )}
        </div>
      </div>

      {/* Chat CTA */}
      <div className="glass-card p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-saffron-gradient mx-auto flex items-center justify-center shadow-saffron mb-4">
          <MessageCircle size={24} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Ask the Gita</h3>
        <p className="text-sm text-slate-500 mb-4">Have a question? Get answers grounded in Bhagavad Gita wisdom.</p>
        <button onClick={() => setShowChat(true)} className="btn-saffron">
          <MessageCircle size={16} /> Start Conversation
        </button>
      </div>
    </div>
  );
};

export default GitaInsights;
