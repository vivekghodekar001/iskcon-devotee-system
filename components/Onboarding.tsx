import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { storageService } from '../services/storageService';
import { UserProfile, StudentCategory } from '../types';
import { User, BookOpen, Heart, CheckCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const CATEGORIES: StudentCategory[] = ['Regular', 'Favourite', 'Sankalpa', 'Guest', 'Volunteer', 'Advanced seeker'];

const INTERESTS = [
    'Bhagavad Gita Study', 'Kirtan', 'Prasadam Cooking', 'Temple Service',
    'Book Distribution', 'Meditation', 'Philosophy', 'Festivals',
    'Youth Preaching', 'Community Service', 'Music', 'Arts'
];

const Onboarding: React.FC = () => {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '', phone: '', spiritualName: '', dob: '',
        nativePlace: '', currentAddress: '', branch: '', yearOfStudy: '',
        category: 'Regular' as StudentCategory,
        goals: '', interests: [] as string[]
    });

    const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
    const toggleInterest = (interest: string) => {
        setForm(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error('Not authenticated');

            await storageService.createProfile({
                name: form.name,
                email: session.user.email!,
                phone: form.phone,
                spiritualName: form.spiritualName,
                dob: form.dob,
                nativePlace: form.nativePlace,
                currentAddress: form.currentAddress,
                branch: form.branch,
                yearOfStudy: form.yearOfStudy,
                category: form.category,
                goals: form.goals,
                interests: form.interests,
                role: 'student',
                photoUrl: session.user.user_metadata?.avatar_url || ''
            } as Partial<UserProfile>);

            window.location.href = '/';
        } catch (err) {
            console.error('Onboarding error:', err);
            alert('Failed to create profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { icon: User, title: 'Personal Info', subtitle: 'Tell us about yourself' },
        { icon: BookOpen, title: 'Spiritual Profile', subtitle: 'Your spiritual journey' },
        { icon: Heart, title: 'Interests', subtitle: 'What inspires you' },
        { icon: CheckCircle, title: 'Review', subtitle: 'Almost there!' },
    ];

    const canNext = () => {
        if (step === 0) return form.name.trim() && form.phone.trim();
        return true;
    };

    return (
        <div className="min-h-screen bg-[#FFFAF3] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-divine-gradient mx-auto flex items-center justify-center shadow-divine mb-4">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-slate-900">Welcome to Gita Life</h1>
                    <p className="text-slate-500 mt-1">Let's set up your spiritual profile</p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-8 px-4">
                    {steps.map((s, i) => (
                        <React.Fragment key={i}>
                            <div className="flex items-center gap-2">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${i <= step ? 'bg-divine-gradient text-white shadow-divine' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {i < step ? <CheckCircle size={16} /> : i + 1}
                                </div>
                                <span className={`hidden sm:block text-sm font-medium transition-colors ${i <= step ? 'text-divine-700' : 'text-slate-400'}`}>
                                    {s.title}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 rounded transition-colors duration-300 ${i < step ? 'bg-divine-500' : 'bg-slate-200'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Card */}
                <div className="glass-card-static p-8 animate-in">
                    {/* Step 0: Personal Info */}
                    {step === 0 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                                <input className="input-divine" placeholder="Enter your full name" value={form.name} onChange={e => update('name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number *</label>
                                <input className="input-divine" placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={e => update('phone', e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                                    <input type="date" className="input-divine" value={form.dob} onChange={e => update('dob', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Native Place</label>
                                    <input className="input-divine" placeholder="City, State" value={form.nativePlace} onChange={e => update('nativePlace', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Address</label>
                                <input className="input-divine" placeholder="Your current address" value={form.currentAddress} onChange={e => update('currentAddress', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch / Center</label>
                                    <input className="input-divine" placeholder="e.g. Pune" value={form.branch} onChange={e => update('branch', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year of Study</label>
                                    <input className="input-divine" placeholder="e.g. FE, SE, TE" value={form.yearOfStudy} onChange={e => update('yearOfStudy', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Spiritual Profile */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Spiritual Name (if any)</label>
                                <input className="input-divine" placeholder="Your initiated name" value={form.spiritualName} onChange={e => update('spiritualName', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => update('category', cat)}
                                            className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${form.category === cat
                                                    ? 'border-divine-600 bg-divine-50 text-divine-700'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Spiritual Goals</label>
                                <textarea className="textarea-divine" placeholder="What are your spiritual aspirations?" value={form.goals} onChange={e => update('goals', e.target.value)} rows={3} />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Interests */}
                    {step === 2 && (
                        <div>
                            <p className="text-sm text-slate-500 mb-4">Select the areas that interest you:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {INTERESTS.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 text-left ${form.interests.includes(interest)
                                                ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        {form.interests.includes(interest) ? '✓ ' : ''}{interest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="bg-divine-50 rounded-xl p-5 border border-divine-100">
                                <h3 className="font-bold text-divine-800 mb-3">Profile Summary</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-slate-500">Name:</span> <span className="font-medium">{form.name}</span></div>
                                    <div><span className="text-slate-500">Phone:</span> <span className="font-medium">{form.phone}</span></div>
                                    {form.spiritualName && <div><span className="text-slate-500">Spiritual Name:</span> <span className="font-medium">{form.spiritualName}</span></div>}
                                    <div><span className="text-slate-500">Category:</span> <span className="font-medium">{form.category}</span></div>
                                    {form.branch && <div><span className="text-slate-500">Branch:</span> <span className="font-medium">{form.branch}</span></div>}
                                    {form.nativePlace && <div><span className="text-slate-500">Native Place:</span> <span className="font-medium">{form.nativePlace}</span></div>}
                                </div>
                                {form.interests.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-divine-200">
                                        <span className="text-sm text-slate-500">Interests:</span>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {form.interests.map(i => (
                                                <span key={i} className="badge badge-saffron text-xs">{i}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                        {step > 0 ? (
                            <button onClick={() => setStep(step - 1)} className="btn-ghost">
                                <ArrowLeft size={16} /> Back
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!canNext()}
                                className="btn-divine disabled:opacity-40"
                            >
                                Next <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading} className="btn-saffron disabled:opacity-50">
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><Sparkles size={16} /> Complete Setup</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
