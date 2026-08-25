'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchTransactions, 
  fetchExpenses, 
  fetchIncome,
  fetchExceptions
} from '@/lib/api';
import { parseLocalDate } from '@/lib/dateUtils';
import { 
  Transaction, 
  Expense, 
  Income,
  Exception
} from '@/lib/types';
import { isSpending, isIncome, absAmount, isInternalTransfer } from '@/lib/transactionUtils';
import BudgetedExpensesCard from '@/components/budget/BudgetedExpensesCard';
import IncomeSummaryTable from '@/components/budget/IncomeSummaryTable';
import CashFlowProjectionsTable, { ProjectionRow } from '@/components/budget/CashFlowProjectionsTable';
import { HousingBreakdown, SubscriptionManager, CommuterCalculator } from '@/components/budget/SpecializedWidgets';
import ExpenseReport from '@/components/budget/ExpenseReport';
import IncomeReport from '@/components/budget/IncomeReport';
import EditExpensesModal from '@/components/budget/EditExpensesModal';
import { Loader2, ArrowLeft, LayoutDashboard, List, Plus, Edit3 } from 'lucide-react';
import Link from 'next/link';

function doesExpenseOccurInMonth(e: Expense, date: Date): boolean {
  const start = parseLocalDate(e.startDate) || new Date(0);
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  
  let endMonth = null;
  if (e.endDate) {
    const end = parseLocalDate(e.endDate);
    if (end) {
      endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    }
  }

  const isStarted = startMonth <= date;
  const isNotEnded = !endMonth || endMonth >= date;
  
  if (!isStarted || !isNotEnded) return false;

  const monthsDiff = (date.getFullYear() - startMonth.getFullYear()) * 12 + (date.getMonth() - startMonth.getMonth());

  switch (e.frequency) {
    case 'Single':
      return monthsDiff === 0;
    case 'Monthly':
      return true;
    case 'Yearly':
      return monthsDiff % 12 === 0;
    case 'Quarterly':
      return monthsDiff % 3 === 0;
    case 'Weekly':
    case 'Daily':
      return true;
    default:
      return true;
  }
}

interface ProjectionResult {
  month: string;
  income: {
    netBaseSalary: number;
    netBonus: number;
    other: number;
    investment: number;
    taxRefund: number;
    total: number;
  };
  budgeted: {
    rent: number;
    expenses: number;
    discretionary: number;
    oneTime: number;
    total: number;
    netIncome: number;
    savingsBalance: number;
  };
  actual: {
    rent: number;
    originTotals: Record<string, number>;
    total: number;
    budget: number;
    percentOfBudget: number;
    savedOver: number;
    netIncome: number;
    percentSaved: number;
  };
}

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeRecords, setIncomeRecords] = useState<Income[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showEditExpensesModal, setShowEditExpensesModal] = useState(false);
  const [view, setView] = useState<'Budgeted' | 'Actual'>('Budgeted');

  const loadData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [tData, eData, iData, exData] = await Promise.all([
        fetchTransactions(),
        fetchExpenses(),
        fetchIncome(),
        fetchExceptions(),
      ]);
      setTransactions(tData);
      setExpenses(eData);
      setIncomeRecords(iData);
      setExceptions(exData);
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

  const currentMonthPlannedExpenses = React.useMemo(() => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses.filter(e => doesExpenseOccurInMonth(e, currentMonth));
  }, [expenses]);
    
  const activeIncome = React.useMemo(() => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return incomeRecords.find(i => {
      const start = parseLocalDate(i.startDate);
      if (!start) return false;
      const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
      let endMonth = null;
      if (i.endDate) {
        const end = parseLocalDate(i.endDate);
        if (end) {
          endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
        }
      }
      return startMonth <= currentMonth && (!endMonth || endMonth >= currentMonth);
    }) || incomeRecords[0] || null;
  }, [incomeRecords]);
  const netIncome = activeIncome 
    ? (activeIncome.salary / 12) * (1 - activeIncome.salaryTaxRate / 100) 
    : 0;

  // Projection Data for Table
  const tableData = React.useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const results: ProjectionResult[] = [];
    let currentBalance = 0;

    // Get all unique transaction origins that have at least one non-transfer transaction
    const activeOrigins = Array.from(new Set(
      transactions
        .filter(t => !isInternalTransfer(t, exceptions))
        .map(t => t.transactionOrigin)
        .filter(Boolean)
    )).sort();

    for (let i = 0; i < months.length; i++) {
      const year = i < 6 ? 2026 : 2027;
      const monthIndex = monthNamesShort.indexOf(months[i]);
      const date = new Date(year, monthIndex, 1);
      
      // Income for this specific month
      const activeIncomesForMonth = incomeRecords.filter(incomeRecord => {
        const start = parseLocalDate(incomeRecord.startDate);
        if (!start) return false;
        const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
        let endMonth = null;
        if (incomeRecord.endDate) {
          const end = parseLocalDate(incomeRecord.endDate);
          if (end) {
            endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
          }
        }
        return startMonth <= date && (!endMonth || endMonth >= date);
      });
      
      const monthNetIncome = activeIncomesForMonth.reduce((acc, incomeRecord) => {
        return acc + (incomeRecord.salary / 12) * (1 - incomeRecord.salaryTaxRate / 100);
      }, 0);

      const netBonus = activeIncomesForMonth.reduce((acc, incomeRecord) => {
        if (!incomeRecord.bonusPayoutDate) return acc;
        const payout = parseLocalDate(incomeRecord.bonusPayoutDate);
        if (!payout) return acc;
        const payoutMonth = new Date(payout.getFullYear(), payout.getMonth(), 1);
        if (payoutMonth.getTime() === date.getTime()) {
           return acc + incomeRecord.bonus * (1 - incomeRecord.bonusTaxRate / 100);
        }
        return acc;
      }, 0);
      
      const totalIncome = monthNetIncome + netBonus;

      // Expenses - Budgeted
      const monthBudgetedExpenses = expenses.filter(e => doesExpenseOccurInMonth(e, date));

      const oneTimeBudgeted = monthBudgetedExpenses
        .filter(e => e.frequency === 'Single')
        .reduce((acc, e) => acc + e.amount, 0);

      const rentBudgeted = monthBudgetedExpenses
        .filter(e => (e.expenseType === 'Housing' || e.name.toLowerCase().includes('rent')) && e.frequency !== 'Single')
        .reduce((acc, e) => acc + e.amount, 0) + oneTimeBudgeted;

      const otherFixedBudgeted = monthBudgetedExpenses
        .filter(e => (e.expenseType === 'Fixed' || e.expenseType === 'Subscription') && !e.name.toLowerCase().includes('rent') && e.frequency !== 'Single')
        .reduce((acc, e) => {
          switch (e.frequency) {
            case 'Monthly': return acc + e.amount;
            case 'Yearly': return acc + e.amount;
            case 'Quarterly': return acc + e.amount;
            case 'Weekly': return acc + (e.amount * 4.33);
            case 'Daily': return acc + (e.amount * 30);
            default: return acc;
          }
        }, 0);
        
      const discretionaryBudgeted = monthBudgetedExpenses
        .filter(e => (e.expenseType === 'Variable' || e.expenseType === 'Utilities') && e.frequency !== 'Single')
        .reduce((acc, e) => {
          switch (e.frequency) {
            case 'Monthly': return acc + e.amount;
            case 'Yearly': return acc + e.amount;
            case 'Quarterly': return acc + e.amount;
            case 'Weekly': return acc + (e.amount * 4.33);
            case 'Daily': return acc + (e.amount * 30);
            default: return acc;
          }
        }, 0);

      const totalExpensesBudgeted = rentBudgeted + otherFixedBudgeted + discretionaryBudgeted;

      // Expenses - Actual
      const monthTransactions = transactions.filter(t => {
        const d = parseLocalDate(t.date);
        if (!d) return false;
        return d.getMonth() === monthIndex && d.getFullYear() === year;
      });

      // Separate actual income and spending from transactions to follow the universal rule:
      // Positive = Income, Negative = Spending
      const transactionIncome = monthTransactions
        .filter(t => !t.transactionOrigin && isIncome(t) && !isInternalTransfer(t, exceptions))
        .reduce((acc, t) => acc + t.amount, 0);

      const originTotals: Record<string, number> = {};
      activeOrigins.forEach(origin => {
        originTotals[origin] = monthTransactions
          .filter(t => t.transactionOrigin === origin && !isInternalTransfer(t, exceptions))
          .reduce((acc, t) => acc - t.amount, 0);
      });
      
      const totalExpensesActual = Object.values(originTotals).reduce((acc, val) => acc + val, 0);

      const netIncomeBudgeted = totalIncome - totalExpensesBudgeted;
      const netIncomeActual = totalIncome + transactionIncome - totalExpensesActual - rentBudgeted;
      
      // For Savings Balance, we MUST include all expenses (recurring + one-time)
      const balanceImpact = view === 'Budgeted' 
        ? (totalIncome - totalExpensesBudgeted) 
        : (totalIncome + transactionIncome - totalExpensesActual - rentBudgeted);
      
      currentBalance += balanceImpact;

      results.push({
        month: `${months[i]}-${year.toString().slice(-2)}`,
        income: {
          netBaseSalary: monthNetIncome,
          netBonus: netBonus,
          other: view === 'Budgeted' ? 0 : transactionIncome,
          investment: 0,
          taxRefund: 0,
          total: view === 'Budgeted' ? totalIncome : (totalIncome + transactionIncome),
        },
        budgeted: {
          rent: rentBudgeted,
          expenses: otherFixedBudgeted,
          discretionary: discretionaryBudgeted,
          oneTime: oneTimeBudgeted,
          total: totalExpensesBudgeted,
          netIncome: netIncomeBudgeted,
          savingsBalance: currentBalance,
        },
        actual: {
          rent: rentBudgeted,
          originTotals,
          total: totalExpensesActual,
          budget: totalExpensesBudgeted,
          percentOfBudget: totalExpensesBudgeted > 0 ? (totalExpensesActual / totalExpensesBudgeted) * 100 : 0,
          savedOver: totalExpensesBudgeted - totalExpensesActual,
          netIncome: netIncomeActual,
          percentSaved: (totalIncome + transactionIncome) > 0 ? (netIncomeActual / (totalIncome + transactionIncome)) * 100 : 0,
        }
      });
    }

    const monthLabels = results.map(r => r.month);

    const incomeRows: ProjectionRow[] = [
      { label: 'Income', values: results.map(() => ''), isHeader: true },
      { label: 'Net Base Salary', values: results.map(r => r.income.netBaseSalary), isCurrency: true },
      { label: 'Net Bonus', values: results.map(r => r.income.netBonus), isCurrency: true },
      ...(results.some(r => r.income.other > 0) ? [{ label: 'Other Income', values: results.map(r => r.income.other), isCurrency: true }] : []),
      // { label: 'Investment', values: results.map(r => r.income.investment), isCurrency: true },
      // { label: 'Tax Refund', values: results.map(r => r.income.taxRefund), isCurrency: true },
      { label: 'Total Income', values: results.map(r => r.income.total), isCurrency: true, isBold: true },
    ];

    const budgetedExpenseRows: ProjectionRow[] = [
      { label: 'Expense', values: results.map(() => ''), isHeader: true },
      { label: 'Rent', values: results.map(r => r.budgeted.rent), isCurrency: true },
      { label: 'Budgeted Expenses', values: results.map(r => r.budgeted.expenses), isCurrency: true },
      { label: 'Discretionary', values: results.map(r => r.budgeted.discretionary), isCurrency: true },
      { label: 'Total Monthly Cost', values: results.map(r => r.budgeted.total), isCurrency: true, isBold: true },
      { label: 'space', values: [] },
      { label: 'Net Income', values: results.map(r => r.budgeted.netIncome), isCurrency: true, isBold: true },
      { label: 'space', values: [] },
      { label: 'Savings Balance', values: results.map(r => r.budgeted.savingsBalance), isCurrency: true, isBold: true },
    ];

    const actualExpenseRows: ProjectionRow[] = [
      { label: 'Expense', values: results.map(() => ''), isHeader: true },
      ...activeOrigins.map(origin => ({
        label: origin.charAt(0).toUpperCase() + origin.slice(1).toLowerCase(),
        values: results.map(r => r.actual.originTotals[origin] || 0),
        isCurrency: true
      })),
      { label: 'Total Expenses', values: results.map(r => r.actual.total), isCurrency: true, isBold: true },
      { label: 'Budget', values: results.map(r => r.actual.budget), isCurrency: true },
      { label: '% of Budget', values: results.map(r => r.actual.percentOfBudget), isPercentage: true, colorLogic: 'percentage' },
      { label: '$ Saved/Over', values: results.map(r => r.actual.savedOver), isCurrency: true, colorLogic: 'savings' },
      { label: 'Net Income', values: results.map(r => r.actual.netIncome), isCurrency: true, isBold: true },
      { label: '% Saved', values: results.map(r => r.actual.percentSaved), isPercentage: true },
    ];

    return {
      months: monthLabels,
      rows: view === 'Budgeted' ? [...incomeRows, { label: 'space', values: [] }, ...budgetedExpenseRows] : [...incomeRows, { label: 'space', values: [] }, ...actualExpenseRows]
    };
  }, [view, expenses, transactions, incomeRecords]);

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
          onClick={() => loadData()}
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
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-xl mr-2">
              <button
                onClick={() => setView('Budgeted')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'Budgeted' 
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Budgeted
              </button>
              <button
                onClick={() => setView('Actual')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'Actual' 
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Actual
              </button>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowEditExpensesModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                <Edit3 size={18} />
                Edit Expenses
              </button>
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
        </div>

      <div className="mb-8">
        <CashFlowProjectionsTable 
          view={view}
          months={tableData.months}
          data={tableData.rows}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <IncomeSummaryTable income={activeIncome} />
        <BudgetedExpensesCard expenses={expenses} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <HousingBreakdown 
          expenses={currentMonthPlannedExpenses}
        />
        <SubscriptionManager subscriptions={currentMonthPlannedExpenses.filter(e => e.expenseType === 'Subscription' && e.frequency !== 'Single')} />
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
      {showEditExpensesModal && (
        <EditExpensesModal
          expenses={expenses}
          onClose={() => setShowEditExpensesModal(false)}
          onSuccess={loadData}
        />
      )}
      </main>
    </div>
  );
}
