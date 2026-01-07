import React, { useState, useEffect } from 'react';
import { ChefHat, ShoppingBag, Plus, Trash2, Calendar, AlertTriangle, Search, X } from 'lucide-react';
import { storageService } from '../services/storageService';
import { InventoryItem, MealPlan } from '../types';

const KitchenManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'meals'>('inventory');
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
        itemName: '', quantity: 0, unit: 'kg', minThreshold: 5, category: 'Grains'
    });

    const [isAddMealOpen, setIsAddMealOpen] = useState(false);
    const [newMeal, setNewMeal] = useState<Partial<MealPlan>>({
        date: new Date().toISOString().split('T')[0],
        mealType: 'Lunch',
        items: [],
        chefName: ''
    });
    const [tempMealItem, setTempMealItem] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [inv, meals] = await Promise.all([
                storageService.getInventory(),
                storageService.getMealPlans()
            ]);
            setInventory(inv);
            setMealPlans(meals);
        } catch (error) {
            console.error("Failed to load kitchen data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.itemName) return;
        try {
            await storageService.updateInventoryItem(newItem);
            setIsAddItemOpen(false);
            setNewItem({ itemName: '', quantity: 0, unit: 'kg', minThreshold: 5, category: 'Grains' });
            loadData();
        } catch (error) {
            console.error("Failed to add item", error);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await storageService.deleteInventoryItem(id);
            loadData();
        }
    };

    const handleAddMeal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMeal.chefName || !newMeal.items?.length) return;
        try {
            await storageService.saveMealPlan(newMeal as MealPlan);
            setIsAddMealOpen(false);
            setNewMeal({ date: new Date().toISOString().split('T')[0], mealType: 'Lunch', items: [], chefName: '' });
            loadData();
        } catch (error) {
            console.error("Failed to save meal plan", error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 font-serif">Kitchen & Prasadam</h2>
                    <p className="text-slate-500 mt-1">Manage bhoga inventory and weekly meal offerings</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'inventory' ? 'bg-[#FF9933] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('meals')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'meals' ? 'bg-[#FF9933] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Meal Plans
                    </button>
                </div>
            </div>

            {/* Inventory View */}
            {activeTab === 'inventory' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search items..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-orange-200"
                            />
                        </div>
                        <button
                            onClick={() => setIsAddItemOpen(true)}
                            className="flex items-center gap-2 bg-[#FF9933] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            Add Item
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {inventory.map((item) => (
                            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg ${item.category === 'Spices' ? 'bg-red-50 text-red-600' :
                                        item.category === 'Dairy' ? 'bg-blue-50 text-blue-600' :
                                            item.category === 'Vegetables' ? 'bg-green-50 text-green-600' :
                                                'bg-orange-50 text-orange-600'
                                        }`}>
                                        <ShoppingBag size={20} />
                                    </div>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 className="font-bold text-slate-800">{item.itemName}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mt-1">{item.category}</p>

                                <div className="mt-4 flex items-end justify-between">
                                    <div>
                                        <span className="text-2xl font-bold text-slate-900">{item.quantity}</span>
                                        <span className="text-sm text-slate-500 ml-1">{item.unit}</span>
                                    </div>
                                    {item.quantity <= item.minThreshold && (
                                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded-full">
                                            <AlertTriangle size={12} />
                                            Low Stock
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Meal Plans View */}
            {activeTab === 'meals' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAddMealOpen(true)}
                            className="flex items-center gap-2 bg-[#FF9933] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                        >
                            <ChefHat size={18} />
                            Plan Meal
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {mealPlans.map((plan) => (
                            <div key={plan.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="flex-shrink-0 text-center bg-orange-50 px-4 py-3 rounded-xl border border-orange-100 min-w-[100px]">
                                    <p className="text-xs font-bold text-orange-600 uppercase">
                                        {new Date(plan.date).toLocaleDateString('en-US', { month: 'short' })}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {new Date(plan.date).getDate()}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-md uppercase">
                                            {plan.mealType}
                                        </span>
                                        <span className="text-sm text-slate-500 flex items-center gap-1">
                                            <ChefHat size={14} />
                                            Chef: {plan.chefName}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {plan.items.map((item, i) => (
                                            <span key={i} className="bg-orange-50 text-orange-800 text-sm px-3 py-1 rounded-full border border-orange-100">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Item Modal */}
            {isAddItemOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold font-serif mb-4">Add Inventory Item</h3>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.itemName}
                                    onChange={e => setNewItem({ ...newItem, itemName: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={newItem.quantity}
                                        onChange={e => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                                    <select
                                        value={newItem.unit}
                                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="liters">liters</option>
                                        <option value="pcs">pcs</option>
                                        <option value="packets">packets</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="Grains">Grains</option>
                                        <option value="Spices">Spices</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Oils">Oils</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Min. Alert</label>
                                    <input
                                        type="number"
                                        value={newItem.minThreshold}
                                        onChange={e => setNewItem({ ...newItem, minThreshold: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddItemOpen(false)}
                                    className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-[#FF9933] text-white rounded-lg font-medium hover:bg-orange-600 shadow-sm"
                                >
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Meal Modal */}
            {isAddMealOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold font-serif mb-4">Plan Meal</h3>
                        <form onSubmit={handleAddMeal} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newMeal.date}
                                    onChange={e => setNewMeal({ ...newMeal, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Meal Type</label>
                                <select
                                    value={newMeal.mealType}
                                    onChange={e => setNewMeal({ ...newMeal, mealType: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                >
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Chef Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newMeal.chefName}
                                    onChange={e => setNewMeal({ ...newMeal, chefName: e.target.value })}
                                    placeholder="e.g., Damodar Das"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Menu Items</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tempMealItem}
                                        onChange={e => setTempMealItem(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (tempMealItem.trim()) {
                                                    setNewMeal({ ...newMeal, items: [...(newMeal.items || []), tempMealItem.trim()] });
                                                    setTempMealItem('');
                                                }
                                            }
                                        }}
                                        placeholder="Add item (press Enter)"
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (tempMealItem.trim()) {
                                                setNewMeal({ ...newMeal, items: [...(newMeal.items || []), tempMealItem.trim()] });
                                                setTempMealItem('');
                                            }
                                        }}
                                        className="px-3 py-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {newMeal.items?.map((item, i) => (
                                        <span key={i} className="bg-orange-50 text-orange-800 text-xs px-2 py-1 rounded-full border border-orange-100 flex items-center gap-1">
                                            {item}
                                            <button
                                                type="button"
                                                onClick={() => setNewMeal({ ...newMeal, items: newMeal.items?.filter((_, index) => index !== i) })}
                                                className="hover:text-red-500"
                                            >
                                                <X size={12} /> {/* Note: Need to import X if not available, replacing with simple x char for now as icon imported above is Check? No, imported icons at top. Need to verify X import. Yes X is NOT imported. I'll use Trash2 or just text x. */}
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddMealOpen(false)}
                                    className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-[#FF9933] text-white rounded-lg font-medium hover:bg-orange-600 shadow-sm"
                                >
                                    Save Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


export default KitchenManagement;
