import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, Plus, Filter, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Transaction } from '../types';

const TempleTreasury: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    const [newTx, setNewTx] = useState<Partial<Transaction>>({
        date: new Date().toISOString(),
        type: 'income',
        category: 'Donation',
        amount: 0,
        description: '',
        paymentMethod: 'Cash'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await storageService.getTransactions();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to load transactions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTx.amount === 0) return;
        try {
            await storageService.addTransaction(newTx as Transaction);
            setIsAddOpen(false);
            setNewTx({
                date: new Date().toISOString(),
                type: 'income',
                category: 'Donation',
                amount: 0,
                description: '',
                paymentMethod: 'Cash'
            });
            loadData();
        } catch (error) {
            console.error("Failed to add transaction", error);
        }
    };

    const filteredTransactions = transactions.filter(t => filter === 'all' || t.type === filter);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 font-serif">Temple Treasury</h2>
                    <p className="text-slate-500 mt-1">Manage donations, expenses, and financial health</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="flex items-center gap-2 bg-[#FF9933] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    New Transaction
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-emerald-600 font-medium text-sm flex items-center gap-2">
                            <TrendingUp size={16} /> Total Income
                        </p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">₹{totalIncome.toLocaleString()}</h3>
                    </div>
                    <div className="absolute right-[-20px] top-[-20px] text-emerald-100 opacity-50">
                        <Wallet size={120} />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-red-500 font-medium text-sm flex items-center gap-2">
                            <TrendingDown size={16} /> Total Expenses
                        </p>
                        <h3 className="text-3xl font-bold text-slate-900 mt-2">₹{totalExpense.toLocaleString()}</h3>
                    </div>
                    <div className="absolute right-[-20px] top-[-20px] text-red-100 opacity-50">
                        <IndianRupee size={120} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-medium text-sm">Net Balance</p>
                        <h3 className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                            ₹{balance.toLocaleString()}
                        </h3>
                    </div>
                    <div className={`p-4 rounded-full ${balance >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        <Wallet size={24} />
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <IndianRupee size={18} /> Recent Transactions
                    </h3>
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('income')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Income
                        </button>
                        <button
                            onClick={() => setFilter('expense')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === 'expense' ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Expense
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((tx) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {tx.type === 'income' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{tx.description || tx.category}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span>{tx.paymentMethod}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-400 capitalize">{tx.category}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400 italic">No transactions found</div>
                    )}
                </div>
            </div>

            {/* Add Transaction Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold font-serif mb-4">Record Transaction</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setNewTx({ ...newTx, type: 'income' })}
                                    className={`py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 ${newTx.type === 'income'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <TrendingUp size={16} /> Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                                    className={`py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 ${newTx.type === 'expense'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    <TrendingDown size={16} /> Expense
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={newTx.amount || ''}
                                    onChange={e => setNewTx({ ...newTx, amount: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-lg font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    value={newTx.category}
                                    onChange={e => setNewTx({ ...newTx, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                >
                                    {newTx.type === 'income' ? (
                                        <>
                                            <option value="Donation">Donation</option>
                                            <option value="Festival Collection">Festival Collection</option>
                                            <option value="Book Distribution">Book Distribution</option>
                                            <option value="Other">Other</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Bhoga Purchase">Bhoga Purchase</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Festival Exp">Festival Exp</option>
                                            <option value="Other">Other</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    value={newTx.description}
                                    onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                                    placeholder="Optional details"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                                <select
                                    value={newTx.paymentMethod}
                                    onChange={e => setNewTx({ ...newTx, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI / Online</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-[#FF9933] text-white rounded-lg font-medium hover:bg-orange-600 shadow-sm"
                                >
                                    Save Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TempleTreasury;
