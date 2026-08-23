import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Expense, ExpenseFrequency, ExpenseType } from '@/lib/types';
import { saveExpense, updateExpense } from '@/lib/api';

interface ExpenseReportProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Expense | null;
}

export default function ExpenseReport({ onClose, onSuccess, initialData }: ExpenseReportProps) {
  const [formData, setFormData] = useState<Partial<Expense>>(initialData || {
    name: '',
    amount: 0,
    frequency: 'Monthly',
    expenseType: 'Fixed',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null
  });
  const [isStillRecurring, setIsStillRecurring] = useState(!initialData?.endDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isStillRecurring) {
      setFormData(prev => ({ ...prev, endDate: null }));
    }
  }, [isStillRecurring]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (initialData?.expenseId) {
        await updateExpense({ ...formData, expenseId: initialData.expenseId } as Expense);
      } else {
        await saveExpense(formData as Expense);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const frequencies: ExpenseFrequency[] = ['Monthly', 'Yearly', 'Quarterly', 'Weekly', 'Daily', 'Single'];
  const types: ExpenseType[] = ['Fixed', 'Variable'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xl font-bold">Add Expense</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Expense Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Rent, Netflix, Groceries"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Amount ($)</label>
            <input
              type="number"
              required
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ExpenseFrequency })}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.expenseType}
                onChange={(e) => setFormData({ ...formData, expenseType: e.target.value as ExpenseType })}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate ? (typeof formData.startDate === 'string' ? formData.startDate.split('T')[0] : new Date(formData.startDate).toISOString().split('T')[0]) : ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="stillRecurring"
                  checked={isStillRecurring}
                  onChange={(e) => setIsStillRecurring(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-zinc-100 border-zinc-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="stillRecurring" className="text-sm font-medium">Ongoing expense (no end date)</label>
              </div>
              <label className={`block text-sm font-medium mb-1 ${isStillRecurring ? 'text-zinc-400' : ''}`}>End Date</label>
              <input
                type="date"
                disabled={isStillRecurring}
                value={formData.endDate ? (typeof formData.endDate === 'string' ? formData.endDate.split('T')[0] : new Date(formData.endDate).toISOString().split('T')[0]) : ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
                  isStillRecurring 
                    ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed' 
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-rose-500">{error}</p>}
          
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : <><Save size={16} /> Save Expense</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
