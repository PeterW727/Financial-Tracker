import React, { useState } from 'react';
import { X, Edit2, Trash2, Plus } from 'lucide-react';
import { Expense } from '@/lib/types';
import { deleteExpense } from '@/lib/api';
import ExpenseReport from './ExpenseReport';

interface EditExpensesModalProps {
  expenses: Expense[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditExpensesModal({ expenses, onClose, onSuccess }: EditExpensesModalProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    setLoading(true);
    try {
      await deleteExpense(id);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  if (editingExpense || isAdding) {
    return (
      <ExpenseReport 
        initialData={editingExpense} 
        onClose={() => {
          setEditingExpense(null);
          setIsAdding(false);
        }} 
        onSuccess={() => {
          setEditingExpense(null);
          setIsAdding(false);
          onSuccess();
        }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-xl font-bold">Manage Expenses</h3>
            <p className="text-sm text-zinc-500">View and edit all your recurring and one-time expenses</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Add New
            </button>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Frequency</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-right">Date Range</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {expenses.map((e) => (
                <tr key={e.expenseId}>
                  <td className="px-4 py-4 text-zinc-900 dark:text-zinc-100 font-medium">{e.name}</td>
                  <td className="px-4 py-4 text-zinc-500">{e.expenseType}</td>
                  <td className="px-4 py-4 text-zinc-500">{e.frequency}</td>
                  <td className="px-4 py-4 text-right font-semibold">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-4 text-right text-zinc-500 text-xs">
                    {e.startDate ? new Date(e.startDate).toLocaleDateString() : 'N/A'} 
                    {e.endDate ? ` - ${new Date(e.endDate).toLocaleDateString()}` : ' - Present'}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingExpense(e)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => e.expenseId && handleDelete(e.expenseId)}
                        disabled={loading}
                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400">No expenses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
