'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchTransactions, 
  fetchExpenses, 
  fetchIncome 
} from '@/lib/api';
import { 
  Transaction, 
  Expense, 
  Income 
} from '@/lib/types';
import { isSpending, absAmount } from '@/lib/transactionUtils';
import MetricCards from '@/components/budget/MetricCards';
import BudgetProgress from '@/components/budget/BudgetProgress';
import ProjectionsChart from '@/components/budget/ProjectionsChart';
import { HousingBreakdown, SubscriptionManager, CommuterCalculator } from '@/components/budget/SpecializedWidgets';
import ExpenseReport from '@/components/budget/ExpenseReport';
import IncomeReport from '@/components/budget/IncomeReport';
import { Loader2, ArrowLeft, LayoutDashboard, List, Plus } from 'lucide-react';
import Link from 'next/link';

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeRecords, setIncomeRecords] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [tData, eData, iData] = await Promise.all([
        fetchTransactions(),
        fetchExpenses(),
        fetchIncome(),
      ]);
      setTransactions(tData);
      setExpenses(eData);
      setIncomeRecords(iData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load budget data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(false); // Initial load, loading state is already true
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

  const currentMonthPlannedExpenses = React.useMemo(() => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses.filter(e => {
      if (!e.startDate) return true;
      const start = new Date(e.startDate);
      const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
      return startMonth <= currentMonth;
    });
  }, [expenses]);

  const totalPlannedExpenses = React.useMemo(() => {
    return currentMonthPlannedExpenses.reduce((acc, e) => {
      switch (e.frequency) {
        case 'Monthly': return acc + e.amount;
        case 'Yearly': return acc + (e.amount / 12);
        case 'Quarterly': return acc + (e.amount / 3);
        case 'Weekly': return acc + (e.amount * 4.33);
        case 'Daily': return acc + (e.amount * 30);
        default: return acc;
      }
    }, 0);
  }, [currentMonthPlannedExpenses]);
    
  const activeIncome = incomeRecords[0] || null;
  const netIncome = activeIncome 
    ? (activeIncome.salary / 12) * (1 - activeIncome.salaryTaxRate / 100) 
    : 0;

  const savingsRate = netIncome > 0 ? ((netIncome - totalExpenses) / netIncome) * 100 : 0;
  
  // Projection Data Generation
  const projectionData = React.useMemo(() => {
    const data = [];
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    let currentBalance = 10841.84; // Starting balance from description

    for (let i = 0; i < months.length; i++) {
      const year = i < 6 ? 2026 : 2027;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthNames.indexOf(months[i]);
      const projectionDate = new Date(year, monthIndex, 1);

      const isAugust = months[i] === 'Aug';
      const bonus = (isAugust && activeIncome) ? activeIncome.bonus * (1 - activeIncome.bonusTaxRate / 100) : 0;
      const monthIncome = netIncome + bonus;
      
      const monthExpenses = expenses
        .filter(e => {
          if (!e.startDate) return true;
          const start = new Date(e.startDate);
          const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
          return startMonth <= projectionDate;
        })
        .reduce((acc, e) => {
          switch (e.frequency) {
            case 'Monthly': return acc + e.amount;
            case 'Yearly': return acc + (e.amount / 12);
            case 'Quarterly': return acc + (e.amount / 3);
            case 'Weekly': return acc + (e.amount * 4.33);
            case 'Daily': return acc + (e.amount * 30);
            default: return acc;
          }
        }, 0) || 4500;

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
  }, [netIncome, activeIncome, expenses]);

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
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Budget Overview</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Track your budget and future projections.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowIncomeForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              Update Income
            </button>
            <button 
              onClick={() => setShowExpenseForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Expense
            </button>
          </div>
        </div>

      <MetricCards 
        totalSavings={projectionData[projectionData.length - 1].savingsBalance}
        savingsRate={savingsRate}
        targetSavingsRate={44.35}
        monthlyNetIncome={netIncome}
        totalExpenses={totalExpenses}
        totalPlannedExpenses={totalPlannedExpenses}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <BudgetProgress expenses={currentMonthPlannedExpenses} />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <ProjectionsChart data={projectionData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <HousingBreakdown 
          expenses={currentMonthPlannedExpenses}
        />
        <SubscriptionManager subscriptions={currentMonthPlannedExpenses.filter(e => e.name.toLowerCase().includes('subscription') && e.frequency !== 'Single')} />
        <CommuterCalculator />
      </div>

      {showExpenseForm && (
        <ExpenseReport 
          onClose={() => setShowExpenseForm(false)} 
          onSuccess={loadData} 
        />
      )}
      {showIncomeForm && (
        <IncomeReport 
          onClose={() => setShowIncomeForm(false)} 
          onSuccess={loadData} 
          initialData={activeIncome}
        />
      )}
      </main>
    </div>
  );
}
