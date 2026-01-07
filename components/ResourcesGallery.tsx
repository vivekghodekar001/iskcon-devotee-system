import React, { useState, useEffect } from 'react';
import { Book, Image, Play, Link as LinkIcon, Plus, X, Upload } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Resource } from '../types';

const ResourcesGallery: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'book' | 'video' | 'photo'>('all');
    const [resources, setResources] = useState<Resource[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    // New Resource State
    const [newItem, setNewItem] = useState({
        title: '',
        type: 'book', // Default
        category: '',
        url: '',
        thumbnailUrl: ''
    });

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            const data = await storageService.getResources();
            setResources(data);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredResources = activeTab === 'all'
        ? resources
        : resources.filter(r => r.type === activeTab);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await storageService.createResource(newItem);
            alert("Resource Added Successfully!");
            setShowAddForm(false);
            setNewItem({ title: '', type: 'book', category: '', url: '', thumbnailUrl: '' });
            loadResources();
        } catch (error) {
            alert("Failed to add resource");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'book': return <Book size={20} className="text-blue-500" />;
            case 'video': return <Play size={20} className="text-red-500" />;
            case 'photo': return <Image size={20} className="text-purple-500" />;
            default: return <LinkIcon size={20} className="text-slate-500" />;
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-serif">Wisdom Gallery</h2>
                    <p className="text-slate-500 text-sm">Divine books, lectures, and memories.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-divine px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
                >
                    <Plus size={18} /> Add Resource
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 pb-2 overflow-x-auto">
                {['all', 'book', 'video', 'photo'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${activeTab === tab
                                ? 'bg-[#0F766E] text-white shadow-md'
                                : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {tab === 'all' ? 'All Items' : tab + 's'}
                    </button>
                ))}
            </div>

            {/* Add Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-[#0F766E]">Add New Resource</h4>
                            <button onClick={() => setShowAddForm(false)}><X size={18} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input
                                required
                                placeholder="Title"
                                className="w-full px-4 py-2 rounded-xl border-slate-200 focus:ring-[#0F766E]"
                                value={newItem.title}
                                onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    className="w-full px-4 py-2 rounded-xl border-slate-200"
                                    value={newItem.type}
                                    onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                                >
                                    <option value="book">Book (PDF)</option>
                                    <option value="video">Video</option>
                                    <option value="photo">Photo</option>
                                    <option value="lecture">Lecture (Audio)</option>
                                </select>
                                <input
                                    placeholder="Category (e.g. Kirtan)"
                                    className="w-full px-4 py-2 rounded-xl border-slate-200"
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                />
                            </div>
                            <input
                                required
                                placeholder="Resource URL (Link/Drive)"
                                className="w-full px-4 py-2 rounded-xl border-slate-200"
                                value={newItem.url}
                                onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                            />
                            <input
                                placeholder="Thumbnail Image URL (Optional)"
                                className="w-full px-4 py-2 rounded-xl border-slate-200"
                                value={newItem.thumbnailUrl}
                                onChange={e => setNewItem({ ...newItem, thumbnailUrl: e.target.value })}
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" className="btn-divine px-6 py-2 rounded-lg font-medium">Add Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto pb-10">
                {filteredResources.map(res => (
                    <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        className="glass-card group hover:shadow-xl transition-all rounded-2xl overflow-hidden flex flex-col"
                    >
                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                            {res.thumbnailUrl ? (
                                <img src={res.thumbnailUrl} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    {getIcon(res.type)}
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-lg p-1.5 shadow-sm">
                                {getIcon(res.type)}
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">{res.category || res.type}</span>
                            <h4 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-[#0F766E] transition-colors">{res.title}</h4>
                            <div className="mt-auto pt-2 flex items-center gap-2 text-xs text-blue-500 font-medium">
                                <span>Open Resource</span>
                                <LinkIcon size={12} />
                            </div>
                        </div>
                    </a>
                ))}

                {filteredResources.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <p>No resources found in this category yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourcesGallery;
