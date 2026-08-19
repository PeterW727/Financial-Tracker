import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Income } from '@/lib/types';
import { saveIncome } from '@/lib/api';

interface IncomeReportProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Income | null;
}

export default function IncomeReport({ onClose, onSuccess, initialData }: IncomeReportProps) {
  const [formData, setFormData] = useState<Partial<Income>>(initialData || {
    salary: 0,
    salaryTaxRate: 0,
    bonus: 0,
    bonusTaxRate: 0,
    bonusPayoutDate: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await saveIncome(formData as Income);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to save income record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xl font-bold">Update Income Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Gross Base Salary (Yearly) ($)</label>
              <input
                type="number"
                required
                value={formData.salary || ''}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 120000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Salary Tax Rate (%)</label>
              <input
                type="number"
                required
                step="0.1"
                value={formData.salaryTaxRate || ''}
                onChange={(e) => setFormData({ ...formData, salaryTaxRate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="col-span-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-sm font-medium mb-1">Expected Bonus ($)</label>
              <input
                type="number"
                value={formData.bonus || ''}
                onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bonus Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.bonusTaxRate || ''}
                onChange={(e) => setFormData({ ...formData, bonusTaxRate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payout Date</label>
              <input
                type="date"
                value={formData.bonusPayoutDate ? (typeof formData.bonusPayoutDate === 'string' ? formData.bonusPayoutDate.split('T')[0] : new Date(formData.bonusPayoutDate).toISOString().split('T')[0]) : ''}
                onChange={(e) => setFormData({ ...formData, bonusPayoutDate: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : <><Save size={16} /> Save Income</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
