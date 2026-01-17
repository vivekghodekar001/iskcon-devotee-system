import React, { useState, useEffect } from 'react';
import { Book, Image, Play, Link as LinkIcon, Plus, X, Upload, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Resource } from '../types';

const ResourcesGallery: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'book' | 'video' | 'photo'>('all');
    const [resources, setResources] = useState<Resource[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

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

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm("Are you sure you want to delete this resource?")) {
            try {
                await storageService.deleteResource(id);
                loadResources();
            } catch (error) {
                console.error(error);
                alert("Failed to delete resource");
            }
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
                    <div
                        key={res.id}
                        onClick={() => {
                            if (res.type === 'video') {
                                const videoId = getYouTubeId(res.url);
                                if (videoId) setSelectedVideo(videoId);
                                else window.open(res.url, '_blank');
                            } else {
                                window.open(res.url, '_blank');
                            }
                        }}
                        className="glass-card group hover:shadow-xl transition-all rounded-2xl overflow-hidden flex flex-col cursor-pointer"
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
                            <button
                                onClick={(e) => handleDelete(res.id, e)}
                                className="absolute top-2 left-2 bg-white/90 backdrop-blur rounded-lg p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                                title="Delete Resource"
                            >
                                <Trash2 size={16} />
                            </button>
                            {res.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/90 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                        <Play size={24} className="text-[#0F766E] fill-current" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">{res.category || res.type}</span>
                            <h4 className="font-bold text-slate-800 line-clamp-2 leading-tight mb-2 group-hover:text-[#0F766E] transition-colors">{res.title}</h4>
                            <div className="mt-auto pt-2 flex items-center gap-2 text-xs text-blue-500 font-medium">
                                <span>{res.type === 'video' ? 'Watch Video' : 'Open Resource'}</span>
                                {res.type === 'video' ? <Play size={12} /> : <LinkIcon size={12} />}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredResources.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <p>No resources found in this category yet.</p>
                    </div>
                )}
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <button
                        onClick={() => setSelectedVideo(null)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>
                    <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesGallery;
