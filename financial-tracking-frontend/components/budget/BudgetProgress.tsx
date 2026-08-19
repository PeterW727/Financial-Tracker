import React from 'react';
import { Transaction, MonthlyBudget } from '@/lib/types';
import { isSpending, absAmount } from '@/lib/transactionUtils';

interface BudgetProgressProps {
  budgets: MonthlyBudget[];
  transactions: Transaction[];
}

export default function BudgetProgress({ budgets, transactions }: BudgetProgressProps) {
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-rose-500';
    if (percent >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const calculateSpending = (categoryName: string) => {
    return transactions
      .filter(t => t.budgetCategory?.name === categoryName || t.category === categoryName)
      .filter(isSpending)
      .reduce((acc, t) => acc + absAmount(t), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const recentTransactions = transactions
    .filter(isSpending)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-6">Active Month Budget</h3>
        <div className="space-y-6">
          {budgets.map((budget) => {
            const spending = calculateSpending(budget.category.name);
            const percent = Math.min((spending / budget.amount) * 100, 100);
            const isOver = spending > budget.amount;

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-zinc-700 dark:text-zinc-300">{budget.category.name}</span>
                  <span className={isOver ? 'text-rose-600' : 'text-zinc-500'}>
                    {formatCurrency(spending)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor((spending / budget.amount) * 100)}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {recentTransactions.map((t, i) => (
            <div 
              key={t.transactionId} 
              className={`p-4 flex justify-between items-center ${
                i !== recentTransactions.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate max-w-[180px]">
                  {t.description}
                </p>
                <p className="text-xs text-zinc-500">{t.date}</p>
              </div>
              <span className="text-sm font-bold text-rose-600">
                -{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="p-8 text-center text-sm text-zinc-500">
              No recent transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
