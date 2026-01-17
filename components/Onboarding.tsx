import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { storageService } from '../services/storageService';
import { User, Sparkles, Phone, MapPin, Heart, ArrowRight } from 'lucide-react';
import { InitiationStatus } from '../types';

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        spiritualName: '',
        phone: '',
        currentAddress: '',
        status: InitiationStatus.UNINITIATED,
        dailyMalas: 16,
        hobbies: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) throw new Error("No authenticated user found");

            // Create Profile linked to Auth ID
            await storageService.createProfile({
                id: user.id, // CRITICAL: Link to Supabase Auth ID
                email: user.email,
                name: formData.name,
                spiritualName: formData.spiritualName,
                phone: formData.phone,
                currentAddress: formData.currentAddress,
                status: formData.status,
                dailyMalas: Number(formData.dailyMalas),
                hobbies: [formData.hobbies],
                role: 'student',
                category: 'Regular',
                photoUrl: '', // Can be added later
                goals: '',
                skills: [],
                interests: []
            });

            // Redirect to App Dashboard
            navigate('/app');
        } catch (error: any) {
            console.error("Onboarding failed:", error);
            alert(`Failed to save profile: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-[#0F766E] p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2 relative z-10">Welcome to Our Community! 🙏</h1>
                    <p className="text-teal-100 relative z-10">Please take a moment to introduce yourself.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Legal Name*
                            </label>
                            <input
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="e.g. Rahul Kumar"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={14} /> Spiritual Name
                            </label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="e.g. Radhe Shyam Das"
                                value={formData.spiritualName}
                                onChange={e => setFormData({ ...formData, spiritualName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Phone size={14} /> Mobile Number*
                            </label>
                            <input
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="+91 9876543210"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initiation Status</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="Uninitiated">Uninitiated</option>
                                <option value="Aspiring">Aspiring</option>
                                <option value="Shelter">Shelter</option>
                                <option value="First Initiated">First Initiated</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={14} /> Current Address
                        </label>
                        <textarea
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
                            placeholder="City, State..."
                            value={formData.currentAddress}
                            onChange={e => setFormData({ ...formData, currentAddress: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Heart size={14} /> Seva Interests / Hobbies
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            placeholder="Cooking, Kirtan, Book Distribution..."
                            value={formData.hobbies}
                            onChange={e => setFormData({ ...formData, hobbies: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating Profile...' : (
                            <>Complete Registration <ArrowRight size={20} /></>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        By continuing, you become a member of our spiritual family.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
