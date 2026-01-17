import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { supabase } from '../lib/supabaseClient';
import { User, Sparkles, Phone, MapPin, Heart, Save, Camera } from 'lucide-react';

const MyProfile: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                const profile = await storageService.getProfileByEmail(user.email);
                if (profile) {
                    setFormData({
                        ...profile,
                        hobbies: profile.hobbies?.[0] || '' // Flatten array for input
                    });
                }
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await storageService.createProfile({
                ...formData,
                hobbies: [formData.hobbies] // Re-array
            });
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header>
                <h2 className="text-3xl font-bold font-serif text-slate-900">My Profile</h2>
                <p className="text-slate-500">Update your personal information and spiritual progress.</p>
            </header>

            <form onSubmit={handleSave} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Photo Section */}
                <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative group">
                        {formData.photoUrl ? (
                            <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-slate-300" />
                        )}
                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                            <Camera size={20} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{formData.name}</h3>
                        <p className="text-slate-500 text-sm">{formData.role === 'admin' ? 'Administrator' : 'Devotee / Student'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} /> Legal Name
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} /> Spiritual Name
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                            value={formData.spiritualName || ''}
                            onChange={e => setFormData({ ...formData, spiritualName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Phone size={14} /> Phone
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                            value={formData.phone || ''}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initiation Status</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none bg-white"
                            value={formData.status || 'Uninitiated'}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none resize-none"
                        value={formData.currentAddress || ''}
                        onChange={e => setFormData({ ...formData, currentAddress: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Heart size={14} /> Hobbies & Interests
                    </label>
                    <input
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                        value={formData.hobbies || ''}
                        onChange={e => setFormData({ ...formData, hobbies: e.target.value })}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-divine px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MyProfile;
