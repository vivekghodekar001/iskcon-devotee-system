import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, User as UserIcon, ArrowRight } from 'lucide-react';
import SuccessModal from './common/SuccessModal';

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [successModal, setSuccessModal] = useState({ open: false, message: '' });
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: ''
    });

    // Toggle Mode
    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        setFormData({ email: '', password: '', fullName: '', phone: '' });
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
            if (error) throw error;
        } catch (error: any) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignUp) {
                // Sign Up Logic
                const { data, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                            phone: formData.phone
                        }
                    }
                });
                if (error) throw error;
                // Show Success Modal instead of Alert
                setSuccessModal({
                    open: true,
                    message: "Account created successfully! Please check your email for the verification link."
                });
                setIsSignUp(false);
            } else {
                // Login Logic
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });
                if (error) throw error;
                // Navigation happens automatically via Auth State Listener in App.tsx
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center p-4">
            <SuccessModal
                isOpen={successModal.open}
                onClose={() => setSuccessModal({ ...successModal, open: false })}
                title="Welcome to ISKCON!"
                message={successModal.message}
            />

            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
                {/* Decorative Top */}
                <div className="h-32 bg-gradient-to-br from-[#0F766E] to-[#115E59] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="text-center text-white z-10">
                        <span className="text-4xl block mb-1">🕉️</span>
                        <h2 className="text-2xl font-serif font-bold tracking-wide">ISKCON Portal</h2>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-slate-800 font-serif">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <button
                            onClick={toggleMode}
                            className="text-xs font-medium text-[#0F766E] hover:underline"
                        >
                            {isSignUp ? 'Already have an account?' : 'Need an account?'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm group"
                        >
                            {loading ? (
                                <span className="animate-spin">🌀</span>
                            ) : (
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                            )}
                            <span>{isSignUp ? 'Sign up with Google' : 'Log in with Google'}</span>
                        </button>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-2 bg-white text-slate-400 font-medium tracking-wider">Or continue with</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-4">
                            {isSignUp && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <input
                                            required
                                            placeholder="Full Name"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none text-sm"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                        <input
                                            placeholder="Mobile Number (Optional)"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none text-sm"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    required
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none text-sm"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    required
                                    type="password"
                                    placeholder="Password"
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none text-sm"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-divine py-3 rounded-xl font-medium flex items-center justify-center gap-2 mt-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    </div>
                </div>
                <div className="px-8 pb-8 text-center">
                    <p className="text-xs text-slate-400">
                        Protected by ISKCON Digital Services. <br />
                        By continuing, you agree to our Terms.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
