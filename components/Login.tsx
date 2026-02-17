import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react';
import SuccessModal from './common/SuccessModal';

// Safe Capacitor check — avoids import crash in web
const isNativePlatform = () => {
    try {
        return !!(window as any).Capacitor?.isNativePlatform?.();
    } catch { return false; }
};

const Login: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const redirectTo = isNativePlatform()
                ? 'com.gitalife.app://login-callback'
                : window.location.origin;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } }
                });
                if (error) throw error;
                setShowSuccess(true);
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const GITA_VERSES = [
        { verse: "BG 2.47", text: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action." },
        { verse: "BG 9.26", text: "If one offers Me with love and devotion a leaf, a flower, a fruit or water, I will accept it." },
        { verse: "BG 18.66", text: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions." },
    ];
    const randomVerse = GITA_VERSES[Math.floor(Math.random() * GITA_VERSES.length)];

    return (
        <>
            {showSuccess && (
                <SuccessModal
                    title="Account Created!"
                    message="Please check your email to verify your account, then log in."
                    onClose={() => { setShowSuccess(false); setIsSignUp(false); }}
                />
            )}

            <div className="min-h-screen flex">
                {/* Left Panel — Decorative (hidden on mobile) */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-divine-800 via-divine-700 to-divine-600">
                    {/* Decorative circles */}
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-sm" />
                    <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-saffron-500/10 rounded-full blur-sm" />
                    <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-white/5 rounded-full animate-float" />

                    <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-2xl">🙏</span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-serif font-bold">Gita Life</h1>
                                    <p className="text-white/60 text-sm font-medium">Devotee Sadhu Sanga</p>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                                <p className="text-lg leading-relaxed font-light italic opacity-90">
                                    "{randomVerse.text}"
                                </p>
                                <p className="mt-4 text-saffron-300 font-semibold text-sm">{randomVerse.verse}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {['Track your Japa Sadhana', 'Access Bhagavad Gita Wisdom', 'Connect with Mentors'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-white/80">
                                    <div className="w-8 h-8 rounded-lg bg-saffron-500/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-saffron-400" />
                                    </div>
                                    <span className="font-medium text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel — Login Form */}
                <div className="flex-1 flex items-center justify-center p-6 bg-[#FFFAF3]">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-divine-gradient mx-auto flex items-center justify-center shadow-divine mb-4">
                                <span className="text-3xl">🙏</span>
                            </div>
                            <h1 className="text-2xl font-serif font-bold text-slate-900">Gita Life</h1>
                            <p className="text-slate-500 text-sm">Devotee Sadhu Sanga</p>
                        </div>

                        <div className="text-center lg:text-left mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {isSignUp ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p className="text-slate-500 mt-1">
                                {isSignUp ? 'Join the spiritual community' : 'Sign in to continue your journey'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium animate-in">
                                {error}
                            </div>
                        )}

                        {/* Google Login */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-semibold text-slate-700 mb-6 active:scale-[0.98] disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#FFFAF3] px-4 text-sm text-slate-400 font-medium">or</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            {isSignUp && (
                                <div className="relative animate-in">
                                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input-divine pl-11"
                                        required
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-divine pl-11"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-divine pl-11 pr-11"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-divine w-full py-3.5 text-base disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button onClick={toggleMode} className="text-divine-700 font-semibold hover:text-divine-800 transition-colors">
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
