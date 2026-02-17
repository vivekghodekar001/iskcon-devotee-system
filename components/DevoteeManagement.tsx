import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, X, Edit2, Trash2, Eye, Mail, Phone, MapPin, Filter } from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserProfile, StudentCategory } from '../types';
import DevoteeProfile from './DevoteeProfile';

const CATEGORIES: StudentCategory[] = ['Favourite', 'Regular', 'Sankalpa', 'Guest', 'Volunteer', 'Advanced seeker'];

const DevoteeManagement: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', spiritualName: '',
    category: 'Regular' as StudentCategory, branch: '', nativePlace: ''
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const p = await storageService.getAllProfiles();
      setProfiles(p);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storageService.createProfile({
        ...form,
        role: 'student',
      } as any);
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', spiritualName: '', category: 'Regular', branch: '', nativePlace: '' });
      load();
    } catch (err) { console.error(err); alert('Failed to add devotee'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this devotee?')) return;
    try {
      await storageService.deleteProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
      if (selectedProfile?.id === id) setSelectedProfile(null);
    } catch (err) { console.error(err); alert('Failed to delete'); }
  };

  const filtered = profiles.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || p.spiritualName?.toLowerCase().includes(q);
    }
    return true;
  });

  const catColor = (cat: string) => {
    switch (cat) {
      case 'Favourite': return 'badge-saffron';
      case 'Sankalpa': return 'badge-purple';
      case 'Volunteer': return 'badge-green';
      case 'Advanced seeker': return 'badge-teal';
      case 'Guest': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1>Devotee Management</h1>
          <p>{profiles.length} devotees in the community</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-divine">
          <Plus size={18} /> Add Devotee
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="search-input" placeholder="Search by name, email, or spiritual name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-divine w-auto min-w-[150px]" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex gap-6">
        {/* Profiles Grid/List */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="empty-state"><Users size={48} /><p>No devotees found</p></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(p => (
                <div
                  key={p.id}
                  className={`glass-card-static p-4 cursor-pointer transition-all hover:shadow-md ${selectedProfile?.id === p.id ? 'ring-2 ring-divine-500 shadow-divine' : ''
                    }`}
                  onClick={() => setSelectedProfile(selectedProfile?.id === p.id ? null : p)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-divine-gradient flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                      {p.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                      {p.spiritualName && <p className="text-xs text-divine-600 font-medium truncate">{p.spiritualName}</p>}
                      <span className={`badge ${catColor(p.category)} text-[10px] mt-1`}>{p.category}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    {p.email && <p className="flex items-center gap-1.5 text-xs text-slate-500 truncate"><Mail size={12} /> {p.email}</p>}
                    {p.phone && <p className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={12} /> {p.phone}</p>}
                    {p.branch && <p className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={12} /> {p.branch}</p>}
                  </div>
                  <div className="flex justify-end gap-1 mt-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Panel */}
        {selectedProfile && (
          <div className="hidden lg:block w-96 flex-shrink-0">
            <DevoteeProfile
              profile={selectedProfile}
              onClose={() => setSelectedProfile(null)}
            />
          </div>
        )}
      </div>

      {/* Mobile Profile Modal */}
      {selectedProfile && (
        <div className="lg:hidden modal-overlay" onClick={() => setSelectedProfile(null)}>
          <div className="modal-content-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <DevoteeProfile profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
          </div>
        </div>
      )}

      {/* Add Devotee Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Add New Devotee</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input className="input-divine" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Spiritual Name</label>
                  <input className="input-divine" placeholder="Initiated name" value={form.spiritualName} onChange={e => setForm({ ...form, spiritualName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input type="email" className="input-divine" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                  <input className="input-divine" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select className="select-divine" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as StudentCategory })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch</label>
                  <input className="input-divine" placeholder="e.g. Pune" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-divine flex-1">Add Devotee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevoteeManagement;
