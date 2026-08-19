'use client';

import { Transaction } from '@/lib/types';
import { isSpending, absAmount } from '@/lib/transactionUtils';
import { LucideIcon, ShoppingBag, CreditCard, Utensils, Zap, Car, Home, MoreHorizontal, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<string, LucideIcon> = {
  'Food': Utensils,
  'Dining': Utensils,
  'Shopping': ShoppingBag,
  'Utilities': Zap,
  'Transport': Car,
  'Housing': Home,
  'Entertainment': MoreHorizontal,
};

interface TransactionListProps {
  transactions: Transaction[];
  timeRange?: string;
  currentDate?: Date;
}

export default function TransactionList({ transactions, timeRange, currentDate }: TransactionListProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:divide-zinc-800 flex justify-between items-center">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Recent Transactions</h3>
        <Link 
          href={`/transactions?${[
            timeRange ? `range=${timeRange}` : '',
            currentDate ? `baseDate=${currentDate.toISOString()}` : ''
          ].filter(Boolean).join('&')}`} 
          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No transactions found</div>
        ) : (
          transactions.slice(0, 10).map((transaction) => {
            const Icon = categoryIcons[transaction.category] || CreditCard;
            return (
              <div key={transaction.transactionId} className="p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {transaction.date} • {transaction.category}
                  </p>
                </div>
                <div className={`font-semibold ${isSpending(transaction) ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(absAmount(transaction))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
