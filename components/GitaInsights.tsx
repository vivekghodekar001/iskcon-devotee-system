
import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Quote, RefreshCw, Send, Bookmark } from 'lucide-react';
import { getDailyGitaQuote } from '../services/geminiService';
import { GitaQuote } from '../types';

import GitaChat from './GitaChat';

const GitaInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quote' | 'chat'>('quote');
  const [quote, setQuote] = useState<GitaQuote | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuote = async () => {
    setLoading(true);
    const result = await getDailyGitaQuote();
    if (result) setQuote(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-[#FF8C00] px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
          <Sparkles size={16} />
          Divine Wisdom
        </div>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Bhagavad Gita Insights</h2>
        <p className="text-slate-500 max-w-lg mx-auto">Timeless wisdom from Lord Sri Krishna to guide your spiritual journey and temple service.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 inline-flex">
          <button
            onClick={() => setActiveTab('quote')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeTab === 'quote' ? 'bg-[#FF8C00] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}
            `}
          >
            <Quote size={18} />
            Daily Quote
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeTab === 'chat' ? 'bg-[#FF8C00] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}
            `}
          >
            <BookOpen size={18} />
            Ask Krishna
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'quote' ? (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[450px] flex flex-col">
              <div className="p-8 md:p-12 flex-1">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                    <RefreshCw size={48} className="animate-spin text-orange-400" />
                    <p className="text-lg font-medium animate-pulse">Seeking Divine Wisdom...</p>
                  </div>
                ) : quote ? (
                  <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="relative">
                      <Quote className="absolute -top-6 -left-6 text-slate-100 scale-[4]" />
                      <div className="relative z-10 space-y-6">
                        <p className="text-2xl md:text-3xl font-serif text-slate-800 leading-relaxed italic">
                          "{quote.translation}"
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-[2px] w-12 bg-[#FF8C00]" />
                          <p className="text-[#FF8C00] font-bold tracking-wider">BG {quote.chapter}.{quote.text}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-orange-400">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sanskrit Verse</h4>
                      <p className="text-lg text-slate-700 font-medium leading-relaxed">
                        {quote.verse}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Divine Purport</h4>
                      <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                        {quote.purport}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                    <BookOpen size={48} />
                    <p>Could not load divine insights at this time.</p>
                    <button onClick={fetchQuote} className="text-[#FF8C00] font-bold">Try again</button>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-slate-500 hover:text-orange-500 hover:bg-white rounded-xl transition-all shadow-sm">
                    <Bookmark size={20} />
                  </button>
                  <button className="p-2.5 text-slate-500 hover:text-orange-500 hover:bg-white rounded-xl transition-all shadow-sm">
                    <Send size={20} />
                  </button>
                </div>
                <button
                  disabled={loading}
                  onClick={fetchQuote}
                  className="flex items-center gap-2 bg-[#FF8C00] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 shadow-md shadow-orange-200"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  New Insight
                </button>
              </div>
            </div>
          </div>
        ) : (
          <GitaChat />
        )}
      </div>

      {activeTab === 'quote' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <BookOpen size={20} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Daily Sadhana</h4>
            <p className="text-xs text-slate-500">Read one chapter of the Gita daily for transcendental knowledge.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Seva Spirit</h4>
            <p className="text-xs text-slate-500">Apply the teachings to your daily temple management and service.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Quote size={20} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Share Wisdom</h4>
            <p className="text-xs text-slate-500">Spread these insights with other devotees to build community.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitaInsights;
