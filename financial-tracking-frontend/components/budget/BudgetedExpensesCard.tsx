import React from 'react';
import { Expense } from '@/lib/types';

interface BudgetProgressProps {
  expenses: Expense[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getMonthlyEquivalent = (e: Expense) => {
  switch (e.frequency) {
    case 'Monthly': return e.amount;
    case 'Yearly': return e.amount / 12;
    case 'Quarterly': return e.amount / 3;
    case 'Weekly': return e.amount * 4.33;
    case 'Daily': return e.amount * 30;
    case 'Single': return e.amount; // Treat single as full amount for that month
    default: return e.amount;
  }
};

const getWeeklyEquivalent = (e: Expense) => {
  switch (e.frequency) {
    case 'Monthly': return e.amount / 4.33;
    case 'Yearly': return e.amount / 52;
    case 'Quarterly': return e.amount / 13;
    case 'Weekly': return e.amount;
    case 'Daily': return e.amount * 7;
    case 'Single': return e.amount / 4.33;
    default: return e.amount;
  }
};

const ExpenseTable = ({ title, items, isOneTime = false }: { title: string, items: Expense[], isOneTime?: boolean }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50">
          <tr>
            <th className="px-4 py-2 font-medium">Expense Name</th>
            {isOneTime ? (
              <>
                <th className="px-4 py-2 font-medium text-right">Month</th>
                <th className="px-4 py-2 font-medium text-right">Amount</th>
              </>
            ) : (
              <>
                <th className="px-4 py-2 font-medium text-right">Weekly</th>
                <th className="px-4 py-2 font-medium text-right">Monthly</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.map((e) => (
            <tr key={e.expenseId || e.name}>
              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 font-medium">{e.name}</td>
              {isOneTime ? (
                <>
                  <td className="px-4 py-3 text-right text-zinc-500">
                    {e.startDate ? new Date(e.startDate).toLocaleDateString('en-US', { month: 'long' }) : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(e.amount)}
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 text-right text-zinc-500">
                    {formatCurrency(getWeeklyEquivalent(e))}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(getMonthlyEquivalent(e))}
                  </td>
                </>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={isOneTime ? 3 : 3} className="px-4 py-8 text-center text-zinc-400">No {title.toLowerCase()}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default function BudgetedExpensesCard({ expenses }: BudgetProgressProps) {
  const allRecurring = expenses.filter(e => e.frequency !== 'Single');
  
  const totalFixed = allRecurring
    .filter(e => e.expenseType === 'Fixed')
    .reduce((acc, e) => acc + getMonthlyEquivalent(e), 0);
  
  const totalDiscretionary = allRecurring
    .filter(e => e.expenseType === 'Variable')
    .reduce((acc, e) => acc + getMonthlyEquivalent(e), 0);
  
  const totalTotal = totalFixed + totalDiscretionary;

  const subExpenses = allRecurring.filter(e => e.name.toLowerCase().includes('subscription'));
  const otherRecurring = allRecurring.filter(e => !e.name.toLowerCase().includes('subscription'));

  const recurringExpenses = [...otherRecurring];
  if (subExpenses.length > 0) {
    const totalMonthly = subExpenses.reduce((acc, e) => acc + getMonthlyEquivalent(e), 0);
    recurringExpenses.push({
      name: 'Subscriptions',
      amount: totalMonthly,
      frequency: 'Monthly',
      expenseType: 'Fixed',
    });
  }

  const oneTimeExpenses = expenses.filter(e => e.frequency === 'Single');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Budgeted Expenses</h2>
        <div className="grid grid-cols-3 gap-4 mt-2 py-3 border-y border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Fixed</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(totalFixed)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Discretionary</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(totalDiscretionary)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Total</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalTotal)}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <ExpenseTable title="Recurring Expenses" items={recurringExpenses} />
        <ExpenseTable title="One-time Expenses" items={oneTimeExpenses} isOneTime />
      </div>
    </div>
  );
}
