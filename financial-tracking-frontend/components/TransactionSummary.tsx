import { Transaction } from '@/lib/types';
import { isSpending, isIncome, absAmount } from '@/lib/transactionUtils';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface TransactionSummaryProps {
  transactions: Transaction[];
  title: string;
}

export default function TransactionSummary({ transactions, title }: TransactionSummaryProps) {
  const totalSpending = transactions
    .filter(isSpending)
    .reduce((acc, t) => acc + absAmount(t), 0);
    
  const totalIncome = transactions
    .filter(isIncome)
    .reduce((acc, t) => acc + absAmount(t), 0);

  const netBalance = totalIncome - totalSpending;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 text-zinc-500 mb-2 text-sm font-medium">
          <TrendingDown size={18} className="text-red-500" />
          Total Spending ({title})
        </div>
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSpending)}
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 text-zinc-500 mb-2 text-sm font-medium">
          <TrendingUp size={18} className="text-emerald-500" />
          Total Income ({title})
        </div>
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalIncome)}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 text-zinc-500 mb-2 text-sm font-medium">
          <DollarSign size={18} className="text-blue-500" />
          Net Balance ({title})
        </div>
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netBalance)}
        </div>
      </div>
    </div>
  );
}
