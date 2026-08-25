'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchTransactions, fetchExceptions } from '@/lib/api';
import { parseLocalDate } from '@/lib/dateUtils';
import { Transaction, TimeRange, TransactionOrigin, Exception } from '@/lib/types';
import { isInternalTransfer } from '@/lib/transactionUtils';
import TransactionList from '@/components/TransactionList';
import SpendingChart from '@/components/SpendingChart';
import TrendChart from '@/components/TrendChart';
import TransactionSummary from '@/components/TransactionSummary';
import ImportButton from '@/components/ImportButton';
import AutopayToggle from '@/components/AutopayToggle';
import { Loader2, RefreshCw, DollarSign, ChevronLeft, ChevronRight, List } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [originFilter, setOriginFilter] = useState<'ALL' | TransactionOrigin>('ALL');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ignoreAutopay, setIgnoreAutopay] = useState(true);
  const [exceptions, setExceptions] = useState<Exception[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [tData, exData] = await Promise.all([
        fetchTransactions(),
        fetchExceptions()
      ]);
      setTransactions(tData);
      setExceptions(exData);
      setError(null);
    } catch (err) {
      setError('Failed to load transactions. Make sure the API is running at http://localhost:8080');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    
    async function init() {
      try {
        const [tData, exData] = await Promise.all([
          fetchTransactions(),
          fetchExceptions()
        ]);
        if (!ignore) {
          setTransactions(tData);
          setExceptions(exData);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError('Failed to load transactions. Make sure the API is running at http://localhost:8080');
          console.error(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    init();
    
    return () => {
      ignore = true;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (ignoreAutopay && isInternalTransfer(t, exceptions)) {
        return false;
      }
      if (originFilter !== 'ALL' && t.transactionOrigin !== originFilter) {
        return false;
      }
      const tDate = parseLocalDate(t.date);
      if (!tDate) return false;
      
      if (timeRange === 'week') {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        
        return tDate >= start && tDate <= end;
      } else if (timeRange === 'month') {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        return tDate >= start && tDate <= end;
      } else if (timeRange === 'ytd') {
        const start = new Date(currentDate.getFullYear(), 0, 1);
        const end = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        return tDate >= start && tDate <= end;
      }
      return true;
    });
  }, [transactions, timeRange, currentDate, ignoreAutopay, originFilter, exceptions]);

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (timeRange === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (timeRange === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (timeRange === 'ytd') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (timeRange === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (timeRange === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (timeRange === 'ytd') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatPeriodLabel = () => {
    if (timeRange === 'week') {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (timeRange === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      return `Year ${currentDate.getFullYear()} (YTD)`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <Loader2 className="animate-spin text-zinc-500" size={48} />
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading your financial data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <DollarSign size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Whitcomb Financial</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/budget"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <DollarSign size={18} />
              Budget
            </Link>
            <Link 
              href={`/transactions?${[
                `range=${timeRange}`,
                `baseDate=${currentDate.toISOString()}`
              ].join('&')}`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <List size={18} />
              Transactions
            </Link>
            <ImportButton onUploadSuccess={loadData} />
            <button 
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Welcome back! Here&apos;s your spending overview.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <AutopayToggle 
              ignoreAutopay={ignoreAutopay} 
              onToggle={setIgnoreAutopay} 
              onUpdate={loadData}
            />
            
            <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <button
                onClick={() => setOriginFilter('ALL')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  originFilter === 'ALL' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setOriginFilter('AMEX')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  originFilter === 'AMEX' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Amex
              </button>
              <button
                onClick={() => setOriginFilter('CHASE')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  originFilter === 'CHASE' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Chase
              </button>
              <button
                onClick={() => setOriginFilter('VENMO')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  originFilter === 'VENMO' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Venmo
              </button>
            </div>

            <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === 'week' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === 'month' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange('ytd')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === 'ytd' 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                YTD
              </button>
            </div>
            
            <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <button 
                onClick={goToPrevious}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-r border-zinc-200 dark:border-zinc-800"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-4 py-2 text-sm font-medium min-w-[150px] text-center">
                {formatPeriodLabel()}
              </div>
              <button 
                onClick={goToNext}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-l border-zinc-200 dark:border-zinc-800"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <TransactionSummary 
          transactions={filteredTransactions} 
          title={formatPeriodLabel()} 
        />

        <TrendChart 
          transactions={filteredTransactions} 
          timeRange={timeRange}
          currentDate={currentDate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SpendingChart transactions={filteredTransactions} timeRange={timeRange} currentDate={currentDate} />

          </div>
          
          <div className="lg:col-span-2">
            <TransactionList transactions={filteredTransactions} timeRange={timeRange} currentDate={currentDate} />
          </div>
        </div>
      </main>
    </div>
  );
}

