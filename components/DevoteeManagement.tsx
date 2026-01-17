
import React, { useState, useEffect, useRef } from 'react';
import { Eye, Camera, Upload, Trash2, Edit2, Search, Filter, Save, X, Users, Heart, Sparkles, Phone, Mail } from 'lucide-react';
import { UserProfile, InitiationStatus, Session, ChantingLog } from '../types';
import { storageService } from '../services/storageService';
import DevoteeProfile from './DevoteeProfile';

interface Props {
  isNew?: boolean;
}

const DevoteeManagement: React.FC<Props> = ({ isNew }) => {
  const [devotees, setDevotees] = useState<UserProfile[]>([]);
  const [showForm, setShowForm] = useState(isNew || false);
  const [searchTerm, setSearchTerm] = useState('');

  // Profile View State
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [viewAttendance, setViewAttendance] = useState<Session[]>([]);
  const [viewChanting, setViewChanting] = useState<ChantingLog[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    spiritualName: '',
    email: '',
    phone: '',
    status: InitiationStatus.UNINITIATED,
    photo: '',
    hobbies: '',
    dailyMalas: 16
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setDevotees(await storageService.getAllProfiles());
      } catch (error) {
        console.error("Failed to load devotees", error);
      }
    };
    load();
  }, [showForm]); // Reload when returning from form

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all mandatory fields (Name, Email, Phone)");
      return;
    }

    try {
      if (isNew) {
        // Create mode
        const newDevotee: any = {
          id: crypto.randomUUID(),
          name: formData.name || '',
          spiritualName: formData.spiritualName || '',
          email: formData.email || '',
          phone: formData.phone || '',
          status: (formData.status as InitiationStatus) || InitiationStatus.UNINITIATED,
          photoUrl: formData.photoUrl || '',
          hobbies: formData.hobbies ? (Array.isArray(formData.hobbies) ? formData.hobbies : [formData.hobbies]) : [],
          dailyMalas: Number(formData.dailyMalas) || 0,
          role: 'student',
          category: 'Regular'
        };
        await storageService.createProfile(newDevotee);
        // Reload list
        const updatedList = await storageService.getAllProfiles();
        setDevotees(updatedList);
      }
      // Note: Edit is not implemented in UI yet

      setShowForm(false);
      resetForm();
    } catch (error: any) {
      console.error("Failed to save devotee", error);
      alert(`Failed to save devotee: ${error.message || error.error_description || "Unknown error"}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      spiritualName: '',
      email: '',
      phone: '',
      status: InitiationStatus.UNINITIATED,
      photoUrl: '',
      hobbies: [],
      dailyMalas: 16
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteDevotee = async (id: string) => {
    if (confirm('Are you sure you want to delete this devotee record?')) {
      try {
        await storageService.deleteProfile(id);
        setDevotees(prev => prev.filter(d => d.id !== id));
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete devotee");
      }
    }
  };

  const filtered = devotees.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.spiritualName && d.spiritualName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Devotee Community</h2>
          <p className="text-slate-500">Manage and connect with our spiritual family.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-[#FF8C00] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 shadow-md transition-all active:scale-95"
          >
            <PlusCircle size={20} />
            Register Devotee
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 max-w-4xl mx-auto mb-12">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="text-lg font-bold text-slate-900">Enrollment Portal</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSave} className="p-8 space-y-8">
            {/* Header & Photo */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all overflow-hidden relative group shrink-0 shadow-inner"
              >
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="text-slate-400 mb-2 group-hover:text-orange-500" size={32} />
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-orange-500 uppercase">Devotee Photo</span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="text-white" size={24} />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
              />
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-xl font-bold text-slate-900">Personal Information</h4>
                <p className="text-sm text-slate-500 italic">"By serving the devotees, one satisfies the Supreme Lord."</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} /> Legal Name*
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Smith"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} /> Spiritual Name
                </label>
                <input
                  type="text"
                  value={formData.spiritualName}
                  onChange={e => setFormData({ ...formData, spiritualName: e.target.value })}
                  placeholder="e.g. Jagannath Das"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as InitiationStatus })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                >
                  {Object.values(InitiationStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} /> Email Address*
                </label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="devotee@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={14} /> Mobile Number*
                </label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} /> Daily Rounds (Malas)
                </label>
                <input
                  type="number"
                  min="0"
                  max="64"
                  value={formData.dailyMalas}
                  onChange={e => setFormData({ ...formData, dailyMalas: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Heart size={14} /> Hobbies & Areas of Interest (Seva Interests)
              </label>
              <textarea
                rows={3}
                value={formData.hobbies}
                onChange={e => setFormData({ ...formData, hobbies: [e.target.value] })}
                placeholder="Cooking, Playing Khol/Mridanga, Teaching, Gardening..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-[#FF8C00] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-md shadow-orange-200 transition-all active:scale-95"
              >
                <Save size={20} />
                Complete Registration
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, spiritual name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg">
              <Filter size={18} />
              Filters
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left">Devotee Profile</th>
                  <th className="px-6 py-4 text-left">Initiation</th>
                  <th className="px-6 py-4 text-left">Sadhana (Malas)</th>
                  <th className="px-6 py-4 text-left">Contact Info</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(devotee => (
                  <tr key={devotee.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                          {devotee.photoUrl ? (
                            <img src={devotee.photoUrl} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Users size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none mb-1">{devotee.spiritualName || devotee.name}</p>
                          {devotee.spiritualName && <p className="text-[11px] text-slate-500 font-medium tracking-tight uppercase">{devotee.name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${devotee.status && typeof devotee.status === 'string' && devotee.status.includes('Initiated') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {devotee.status || 'Uninitiated'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF8C00] font-black text-xs border border-orange-100">
                          {devotee.dailyMalas || 0}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Rounds</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                          <Phone size={10} className="text-slate-400" /> {devotee.phone}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Mail size={10} className="text-slate-400" /> {devotee.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            setSelectedProfile(devotee);
                            setIsLoadingProfile(true); // Start loading
                            setViewAttendance([]); // Clear previous
                            setViewChanting([]); // Clear previous

                            // Fetch attendance independently
                            try {
                              const att = await storageService.getStudentAttendance(devotee.id);
                              setViewAttendance(att);
                            } catch (e) {
                              console.error("Failed to fetch attendance", e);
                            }

                            // Fetch chanting history independently
                            try {
                              const chant = await storageService.getChantingHistory(devotee.email);
                              setViewChanting(chant);
                            } catch (e) {
                              console.error("Failed to fetch chanting history", e);
                            } finally {
                              setIsLoadingProfile(false);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => deleteDevotee(devotee.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <Users size={40} className="text-slate-200 mb-3" />
                        <p className="text-slate-400 font-medium italic">No devotees match your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {selectedProfile && (
        <DevoteeProfile
          profile={selectedProfile}
          attendance={viewAttendance}
          chantingHistory={viewChanting}
          isLoading={isLoadingProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
};

// Custom PlusCircle component
const PlusCircle: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default DevoteeManagement;
