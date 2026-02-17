import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { supabase } from '../lib/supabaseClient';
import { User, Sparkles, Phone, MapPin, Heart, Save, Camera, Calendar, Mail, BookOpen } from 'lucide-react';
import { StudentCategory, UserProfile } from '../types';

const CATEGORIES: StudentCategory[] = ['Favourite', 'Regular', 'Sankalpa', 'Guest', 'Volunteer', 'Advanced seeker'];

const MyProfile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        name: '', spiritualName: '', phone: '', dob: '',
        branch: '', nativePlace: '', goals: '', category: 'Regular' as StudentCategory, photoUrl: ''
    });

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) return;
            const p = await storageService.getProfileByEmail(session.user.email);
            if (p) {
                setProfile(p);
                setForm({
                    name: p.name || '',
                    spiritualName: p.spiritualName || '',
                    phone: p.phone || '',
                    dob: p.dob || '',
                    branch: p.branch || '',
                    nativePlace: p.nativePlace || '',
                    goals: p.goals || '',
                    category: p.category || 'Regular',
                    photoUrl: p.photoUrl || ''
                });
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        try {
            await storageService.updateProfile(profile.id, form);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error(err);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setForm({ ...form, photoUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-divine-200 border-t-divine-600 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 animate-in max-w-2xl mx-auto">
            <div className="page-header">
                <h1>My Profile</h1>
                <p>Manage your devotee profile</p>
            </div>

            {/* Avatar Card */}
            <div className="glass-card-static overflow-hidden">
                <div className="bg-gradient-to-br from-divine-700 to-divine-600 p-8 text-center relative">
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="relative z-10">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            <div className="w-24 h-24 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-2 border-white/20 shadow-xl overflow-hidden">
                                {form.photoUrl ? (
                                    <img src={form.photoUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    form.name?.[0]?.toUpperCase() || <User size={32} />
                                )}
                            </div>
                            <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                <Camera size={14} className="text-slate-600" />
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            </label>
                        </div>
                        <h2 className="text-xl font-bold text-white">{form.name || 'Devotee'}</h2>
                        {form.spiritualName && <p className="text-sm text-white/70">{form.spiritualName}</p>}
                        <p className="text-xs text-white/50 mt-1">{profile?.email}</p>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSave} className="glass-card-static p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            <User size={14} className="inline mr-1" /> Full Name
                        </label>
                        <input className="input-divine" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            <Sparkles size={14} className="inline mr-1" /> Spiritual Name
                        </label>
                        <input className="input-divine" placeholder="Initiated name" value={form.spiritualName} onChange={e => setForm({ ...form, spiritualName: e.target.value })} />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            <Phone size={14} className="inline mr-1" /> Phone
                        </label>
                        <input className="input-divine" placeholder="Phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            <Calendar size={14} className="inline mr-1" /> Date of Birth
                        </label>
                        <input type="date" className="input-divine" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            <MapPin size={14} className="inline mr-1" /> Branch / Location
                        </label>
                        <input className="input-divine" placeholder="e.g. Pune" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            <BookOpen size={14} className="inline mr-1" /> Category
                        </label>
                        <select className="select-divine" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as StudentCategory })}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        <MapPin size={14} className="inline mr-1" /> Native Place
                    </label>
                    <input className="input-divine" placeholder="Where are you from?" value={form.nativePlace} onChange={e => setForm({ ...form, nativePlace: e.target.value })} />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        <Heart size={14} className="inline mr-1" /> Spiritual Goals
                    </label>
                    <textarea className="textarea-divine" placeholder="What are your spiritual aspirations?" value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} rows={3} />
                </div>

                <button type="submit" disabled={saving} className="btn-divine w-full">
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved ? (
                        <><Save size={16} /> Saved ✓</>
                    ) : (
                        <><Save size={16} /> Save Profile</>
                    )}
                </button>
            </form>
        </div>
    );
};

export default MyProfile;
