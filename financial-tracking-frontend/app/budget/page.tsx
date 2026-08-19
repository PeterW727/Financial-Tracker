'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchTransactions, 
  fetchMonthlyBudgets, 
  fetchRecurringExpenses, 
  fetchBudgetProfile 
} from '@/lib/api';
import { 
  Transaction, 
  MonthlyBudget, 
  RecurringExpense, 
  BudgetProfile 
} from '@/lib/types';
import { isSpending, isIncome, absAmount } from '@/lib/transactionUtils';
import MetricCards from '@/components/budget/MetricCards';
import BudgetProgress from '@/components/budget/BudgetProgress';
import ProjectionsChart from '@/components/budget/ProjectionsChart';
import { HousingBreakdown, SubscriptionManager, CommuterCalculator } from '@/components/budget/SpecializedWidgets';
import { Loader2, ArrowLeft, LayoutDashboard, List } from 'lucide-react';
import Link from 'next/link';

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [profile, setProfile] = useState<BudgetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tData, bData, rData, pData] = await Promise.all([
        fetchTransactions(),
        fetchMonthlyBudgets(),
        fetchRecurringExpenses(),
        fetchBudgetProfile(),
      ]);
      setTransactions(tData);
      setBudgets(bData);
      setRecurringExpenses(rData);
      setProfile(pData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load budget data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculations for Metric Cards
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalExpenses = currentMonthTransactions
    .filter(isSpending)
    .reduce((acc, t) => acc + absAmount(t), 0);
    
  const netIncome = profile 
    ? (profile.grossBaseSalary / 12) * (1 - profile.taxRate / 100) 
    : 0;

  const savingsRate = netIncome > 0 ? ((netIncome - totalExpenses) / netIncome) * 100 : 0;
  
  // Projection Data Generation
  const projectionData = React.useMemo(() => {
    const data = [];
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    let currentBalance = 10841.84; // Starting balance from description

    for (let i = 0; i < months.length; i++) {
      const isAugust = months[i] === 'Aug';
      const bonus = isAugust ? 7000 : 0;
      const monthIncome = netIncome + bonus;
      const monthExpenses = 4500; // Average expenses
      const savings = monthIncome - monthExpenses;
      currentBalance += savings;

      data.push({
        month: `${months[i]} ${i < 6 ? '26' : '27'}`,
        income: monthIncome,
        expenses: monthExpenses,
        savingsBalance: currentBalance,
        bonus: bonus > 0 ? bonus : undefined,
      });
    }
    return data;
  }, [netIncome]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center gap-4 text-center px-4">
        <p className="text-rose-500 font-medium">{error}</p>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-lg text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Financial Planning</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link 
              href="/transactions"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <List size={18} />
              Transactions
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Budget Overview</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Track your budget and future projections.</p>
        </div>

      <MetricCards 
        totalSavings={projectionData[projectionData.length - 1].savingsBalance}
        savingsRate={savingsRate}
        targetSavingsRate={44.35}
        monthlyNetIncome={netIncome}
        totalExpenses={totalExpenses}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <BudgetProgress budgets={budgets} transactions={currentMonthTransactions} />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <ProjectionsChart data={projectionData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <HousingBreakdown totalRent={4870} perPersonSplit={2435} utilities={150} />
        <SubscriptionManager subscriptions={recurringExpenses} />
        <CommuterCalculator />
      </div>
      </main>
    </div>
  );
}
