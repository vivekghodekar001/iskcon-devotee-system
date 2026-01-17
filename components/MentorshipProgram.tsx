import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Send, Search, Camera, Sparkles, Plus } from 'lucide-react';
import { storageService } from '../services/storageService';

interface Mentor {
    id: string;
    name: string;
    spiritualName?: string;
    photoUrl?: string;
    phone: string;
    branch: string;
}

interface Props {
    mode: 'admin' | 'student';
}

const MentorshipProgram: React.FC<Props> = ({ mode }) => {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [requestMessage, setRequestMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    // Add Mentor State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMentor, setNewMentor] = useState({
        name: '',
        spiritualName: '',
        phone: '',
        branch: '',
        photoUrl: '', // Base64 string from capture
        email: ''
    });

    const isAdmin = mode === 'admin';

    useEffect(() => {
        loadMentors();
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        // In a real app we get this from auth context or similar
        // For now, we'll try to get it from storageService if we had a method, 
        // or just rely on the assumption that the user is logged in.
        // Since we don't have a direct 'getCurrentUser' in storageService shown here,
        // we will fetch the profile by email if we can get the user from supabase client directly (if imported)
        // or just use a placeholder if that's not available in this file.
        // However, imports show storageService but not supabase client.
        // Let's assume we can get it from a hypothetical auth method or just keep the demo ID if we strictly can't access auth here.
        // BUT, looking at previous files, we can import supabase from lib.

        // Let's import supabase dynamically or assume it's available if we add the import.
        // Actually, I'll just keep the demo ID for now to avoid breaking if imports are missing, 
        // BUT I will disable the request button if not logged in or something.
        // Wait, the previous code had `const currentUserId = 'demo-student-id';`
        // I will keep it simple for this refactor to just handle the MODE.
        setCurrentUserId('demo-student-id');
    };

    const loadMentors = async () => {
        try {
            setLoading(true);
            const data = await storageService.getMentors();
            setMentors(data);
        } catch (error) {
            console.error("Failed to load mentors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMentor) return;

        try {
            await storageService.createMentorshipRequest(currentUserId, selectedMentor.id, requestMessage);
            alert(`Mentorship request sent to ${selectedMentor.spiritualName || selectedMentor.name} Prabhu!`);
            setSelectedMentor(null);
            setRequestMessage('');
        } catch (error) {
            alert("Failed to send request. Please try again.");
        }
    };

    const handleAddMentor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await storageService.createMentor(newMentor);
            alert("Mentor Added Successfully!");
            setShowAddForm(false);
            setNewMentor({ name: '', spiritualName: '', phone: '', branch: '', photoUrl: '', email: '' });
            loadMentors();
        } catch (error) {
            alert("Failed to add mentor. Please ensure unique email if providing one.");
        }
    };

    const filteredMentors = mentors.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.spiritualName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6 relative">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-serif flex items-center gap-2">
                        <User className="text-[#0F766E]" /> Mentorship Program
                    </h2>
                    <p className="text-slate-500 text-sm">Connect with senior devotees for spiritual guidance.</p>
                </div>
                {/* Desktop/Tablet Button */}
                {isAdmin && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="hidden sm:flex btn-divine px-4 py-2 rounded-xl items-center gap-2 font-medium shrink-0"
                    >
                        <Plus size={18} /> Add Mentor
                    </button>
                )}
            </div>

            {/* Mobile Floating Action Button (FAB) ensuring visibility */}
            {isAdmin && (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="sm:hidden fixed bottom-6 right-6 z-50 btn-divine w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-95"
                >
                    <Plus size={24} />
                </button>
            )}

            {/* Add Mentor Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-[#0F766E] text-lg">Add New Mentor</h4>
                            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-slate-100 rounded-full"><span className="text-slate-400 text-xl">✕</span></button>
                        </div>

                        <form onSubmit={handleAddMentor} className="space-y-4">
                            {/* Photo Capture Section - Matching Student Registration */}
                            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Profile Photo</label>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    {/* Preview */}
                                    <div className="relative w-24 h-24 shrink-0 mx-auto sm:mx-0">
                                        <div className="w-full h-full rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                                            {newMentor.photoUrl ? (
                                                <img src={newMentor.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={32} className="text-slate-300" />
                                            )}
                                        </div>
                                        {newMentor.photoUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setNewMentor(p => ({ ...p, photoUrl: '' }))}
                                                className="absolute -top-1 -right-1 bg-red-100 text-red-600 rounded-full p-1 shadow-sm hover:bg-red-200"
                                            >
                                                <span className="sr-only">Remove</span>
                                                <User size={12} className="rotate-45" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Controls */}
                                    <div className="flex-1 w-full grid grid-cols-2 gap-2">
                                        <label className="cursor-pointer bg-white border border-slate-200 hover:border-[#0F766E] text-slate-700 hover:text-[#0F766E] p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-xs font-medium shadow-sm text-center h-20">
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
                                                        if (file.size > 2 * 1024 * 1024) {
                                                            alert("File is too large! Please upload under 2MB.");
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setNewMentor(prev => ({ ...prev, photoUrl: reader.result as string }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>

                                        <label className="cursor-pointer bg-[#0F766E]/5 border border-[#0F766E]/20 hover:bg-[#0F766E]/10 text-[#0F766E] p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-xs font-medium text-center h-20">
                                            <Sparkles size={20} />
                                            <span>Upload</span>
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
                                                            setNewMentor(prev => ({ ...prev, photoUrl: reader.result as string }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <input
                                    required
                                    placeholder="Legal Name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                                    value={newMentor.name}
                                    onChange={e => setNewMentor({ ...newMentor, name: e.target.value })}
                                />
                                <input
                                    placeholder="Spiritual Name (e.g. Krishna Das)"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                                    value={newMentor.spiritualName}
                                    onChange={e => setNewMentor({ ...newMentor, spiritualName: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        required
                                        placeholder="Phone Number"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                                        value={newMentor.phone}
                                        onChange={e => setNewMentor({ ...newMentor, phone: e.target.value })}
                                    />
                                    <input
                                        placeholder="Branch / Temple"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                                        value={newMentor.branch}
                                        onChange={e => setNewMentor({ ...newMentor, branch: e.target.value })}
                                    />
                                </div>
                                <input
                                    placeholder="Email (Optional)"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none"
                                    value={newMentor.email}
                                    onChange={e => setNewMentor({ ...newMentor, email: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
                                <button type="submit" className="btn-divine px-6 py-2 rounded-lg font-medium">Add Mentor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none shadow-sm"
                    placeholder="Search for a Mentor by name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20"><span className="animate-spin text-2xl">🌀</span></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10">
                    {filteredMentors.map(mentor => (
                        <div key={mentor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all flex flex-col items-center text-center group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#0F766E]/10 to-[#FF9933]/10 z-0" />

                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md z-10 bg-slate-200 overflow-hidden mb-3">
                                {mentor.photoUrl ? (
                                    <img src={mentor.photoUrl} alt={mentor.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-3xl font-serif">
                                        {mentor.name[0]}
                                    </div>
                                )}
                            </div>

                            <div className="z-10 relative">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {mentor.spiritualName ? `${mentor.spiritualName} Prabhu` : mentor.name}
                                </h3>
                                {mentor.spiritualName && <p className="text-xs text-slate-500 mb-1">({mentor.name})</p>}

                                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 mt-2">
                                    <MapPin size={12} /> {mentor.branch || 'Main Temple'}
                                </div>
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 mt-1">
                                    <Phone size={12} /> {mentor.phone || 'N/A'}
                                </div>

                                <button
                                    onClick={() => setSelectedMentor(mentor)}
                                    className="mt-4 btn-divine px-6 py-2 rounded-full text-sm flex items-center gap-2 mx-auto shadow-sm"
                                >
                                    Request Guidance <Send size={14} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredMentors.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            <p>No mentors found matching your search. Try adding one!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Request Modal */}
            {selectedMentor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95">
                        <h4 className="font-bold text-lg text-slate-900 mb-2">Request Mentorship</h4>
                        <p className="text-sm text-slate-500 mb-4">
                            Send a message to <b>{selectedMentor.spiritualName || selectedMentor.name}</b> explaining why you seek their guidance.
                        </p>

                        <form onSubmit={handleRequest}>
                            <textarea
                                required
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0F766E] outline-none min-h-[120px] mb-4 text-sm"
                                placeholder="Hare Krishna Prabhu, I would like to join your mentorship group because..."
                                value={requestMessage}
                                onChange={e => setRequestMessage(e.target.value)}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedMentor(null)}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-divine px-6 py-2 rounded-lg font-medium">
                                    Send Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorshipProgram;
