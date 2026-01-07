import React, { useState } from 'react';
import { User, MapPin, Book, Heart, Camera, ChevronRight, ChevronLeft, Save, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

const StudentRegistration: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>({
        role: 'student',
        category: 'Regular',
        hobbies: [],
        skills: [],
        interests: []
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'hobbies' | 'skills' | 'interests') => {
        const values = e.target.value.split(',').map(item => item.trim());
        setFormData(prev => ({ ...prev, [field]: values }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Basic validation
            if (!formData.name || !formData.email) {
                alert("Name and Email are required!");
                setLoading(false);
                return;
            }

            await storageService.createProfile(formData as any);
            alert("Registration Successful! Welcome to the spiritual family.");
            navigate('/');
        } catch (error) {
            console.error(error);
            alert("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(p => p + 1);
    const prevStep = () => setStep(p => p - 1);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-[#0F766E] font-serif mb-2">Student Registration</h1>
                <p className="text-slate-500">Join our spiritual community and start your journey</p>
            </div>

            {/* Progress Steps */}
            <div className="flex justify-center mb-12">
                <div className="flex items-center gap-4">
                    <StepIndicator current={step} number={1} icon={<User size={18} />} label="Personal" />
                    <div className={`w-12 h-1 rounded-full transition-colors ${step > 1 ? 'bg-[#0F766E]' : 'bg-slate-200'}`} />
                    <StepIndicator current={step} number={2} icon={<MapPin size={18} />} label="Background" />
                    <div className={`w-12 h-1 rounded-full transition-colors ${step > 2 ? 'bg-[#0F766E]' : 'bg-slate-200'}`} />
                    <StepIndicator current={step} number={3} icon={<Heart size={18} />} label="Spiritual" />
                </div>
            </div>

            <div className="glass-card p-8 rounded-3xl shadow-xl relative overflow-hidden">
                {/* Decorative Background Element */}
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Sparkles size={120} />
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-[#0F766E] flex items-center gap-2">
                                <User size={24} /> Personal Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                                <InputGroup label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                                <InputGroup label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                                <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Profile Photo</label>
                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        {/* Photo Preview */}
                                        <div className="relative group w-32 h-32 shrink-0">
                                            <div className="w-full h-full rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                                {formData.photoUrl ? (
                                                    <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={40} className="text-slate-300" />
                                                )}
                                            </div>
                                            {formData.photoUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(p => ({ ...p, photoUrl: '' }))}
                                                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    <User size={14} className="rotate-45" /> {/* Using X icon would be better but keeping icons consistent */}
                                                </button>
                                            )}
                                        </div>

                                        {/* Upload Controls */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-wrap gap-3">
                                                <label className="flex-1 min-w-[140px] cursor-pointer bg-white border border-slate-200 hover:border-[#0F766E] text-slate-700 hover:text-[#0F766E] px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium shadow-sm">
                                                    <Camera size={20} />
                                                    <span>Take Photo</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        capture="user"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Max size check (e.g. 2MB)
                                                                if (file.size > 2 * 1024 * 1024) {
                                                                    alert("File is too large! Please upload under 2MB.");
                                                                    return;
                                                                }
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>

                                                <label className="flex-1 min-w-[140px] cursor-pointer bg-[#0F766E]/5 border border-[#0F766E]/20 hover:bg-[#0F766E]/10 text-[#0F766E] px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium">
                                                    <Sparkles size={20} />
                                                    <span>Upload File</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                if (file.size > 2 * 1024 * 1024) {
                                                                    alert("File is too large! Please upload under 2MB.");
                                                                    return;
                                                                }
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Supports JPEG, PNG. Max 2MB.
                                                <br />On mobile, "Take Photo" opens your camera directly.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-[#0F766E] flex items-center gap-2">
                                <MapPin size={24} /> Background & Education
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="Native Place" name="nativePlace" value={formData.nativePlace} onChange={handleChange} />
                                <InputGroup label="Current Address" name="currentAddress" value={formData.currentAddress} onChange={handleChange} />
                                <InputGroup label="Branch / College" name="branch" value={formData.branch} onChange={handleChange} />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Year of Study</label>
                                    <select
                                        name="yearOfStudy"
                                        value={formData.yearOfStudy}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border-slate-200 focus:border-[#0F766E] focus:ring-[#0F766E] py-2.5"
                                    >
                                        <option value="">Select Year</option>
                                        <option value="FE">First Year (FE)</option>
                                        <option value="SE">Second Year (SE)</option>
                                        <option value="TE">Third Year (TE)</option>
                                        <option value="BE">Final Year (BE)</option>
                                        <option value="Graduated">Graduated</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-[#0F766E] flex items-center gap-2">
                                <Heart size={24} /> Spiritual Interests
                            </h3>

                            <div className="space-y-5">
                                <InputGroup
                                    label="Spiritual Introduction (Short Bio)"
                                    name="goals"
                                    as="textarea"
                                    value={formData.goals}
                                    onChange={handleChange}
                                    placeholder="Share a bit about your spiritual journey or goals..."
                                />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hobbies (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.hobbies?.join(', ')}
                                        onChange={(e) => handleArrayChange(e, 'hobbies')}
                                        placeholder="Reading, Kirtan, Cooking..."
                                        className="w-full rounded-xl border-slate-200 focus:border-[#0F766E] focus:ring-[#0F766E]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Skills (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.skills?.join(', ')}
                                        onChange={(e) => handleArrayChange(e, 'skills')}
                                        placeholder="Video Editing, Singing, Management..."
                                        className="w-full rounded-xl border-slate-200 focus:border-[#0F766E] focus:ring-[#0F766E]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <ChevronLeft size={20} /> Back
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="btn-divine px-6 py-2.5 rounded-xl font-medium flex items-center gap-2"
                            >
                                Next Step <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-divine px-8 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Registering...' : 'Complete Registration'} <Save size={20} />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

// Helper Components
const StepIndicator: React.FC<{ current: number; number: number; icon: React.ReactNode; label: string }> = ({ current, number, icon, label }) => {
    const active = current >= number;
    const isCurrent = current === number;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`
        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
        ${active ? 'bg-[#0F766E] text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-400'}
        ${isCurrent ? 'ring-4 ring-teal-100' : ''}
      `}>
                {icon}
            </div>
            <span className={`text-xs font-bold ${active ? 'text-[#0F766E]' : 'text-slate-400'}`}>{label}</span>
        </div>
    );
};

const InputGroup: React.FC<any> = ({ label, as = 'input', ...props }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            {as === 'textarea' ? (
                <textarea
                    {...props}
                    className="w-full rounded-xl border-slate-200 focus:border-[#0F766E] focus:ring-[#0F766E] min-h-[100px]"
                />
            ) : (
                <input
                    {...props}
                    className="w-full rounded-xl border-slate-200 focus:border-[#0F766E] focus:ring-[#0F766E] py-2.5"
                />
            )}
        </div>
    );
};

export default StudentRegistration;
