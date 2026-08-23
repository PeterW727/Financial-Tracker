'use client';

import { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchTransactions } from '@/lib/api';
import { Transaction } from '@/lib/types';
import { isSpending, isIncome, absAmount, isInternalTransfer } from '@/lib/transactionUtils';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Tag, 
  TrendingDown,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Utensils,
  Zap,
  Car,
  Home,
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Link from 'next/link';
import { TimeRange } from '@/lib/types';

const categoryIcons: Record<string, any> = {
  'Food': Utensils,
  'Dining': Utensils,
  'Shopping': ShoppingBag,
  'Utilities': Zap,
  'Transport': Car,
  'Housing': Home,
  'Entertainment': MoreHorizontal,
};

function TransactionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ignoreAutopay, setIgnoreAutopay] = useState(true);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const handleSort = (column: 'date' | 'category' | 'amount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  // Transaction type filter
  type TransactionType = 'all' | 'spending' | 'income';
  const initialType = (searchParams.get('type') as TransactionType) || 'all';
  const [typeFilter, setTypeFilter] = useState<TransactionType>(initialType);
  
  // Date range state
  const range = searchParams.get('range') as TimeRange | null;
  const initialTimeRange = (range && (range === 'week' || range === 'month' || range === 'ytd')) ? range : 'all';
  const [timeRange, setTimeRange] = useState<TimeRange | 'all'>(initialTimeRange);
  
  const baseDateStr = searchParams.get('baseDate');
  const initialCurrentDate = useMemo(() => {
    if (baseDateStr) {
      const d = new Date(baseDateStr);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [baseDateStr]);
  const [currentDate, setCurrentDate] = useState(initialCurrentDate);
  
  // Filter states from URL
  const initialDate = searchParams.get('date') || '';
  const initialCategory = searchParams.get('category') || '';
  
  const [dateFilter, setDateFilter] = useState(initialDate);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Keep local state in sync if URL changes externally (e.g. browser back button)
    const range = searchParams.get('range') as TimeRange | null;
    if (range && (range === 'week' || range === 'month' || range === 'ytd')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeRange(prev => prev !== range ? range : prev);
    }
    
    const baseDate = searchParams.get('baseDate');
    if (baseDate) {
      const parsedDate = new Date(baseDate);
      if (!isNaN(parsedDate.getTime())) {
        setCurrentDate(prev => prev.getTime() !== parsedDate.getTime() ? parsedDate : prev);
      }
    }

    const date = searchParams.get('date');
    if (date !== null) {
      setDateFilter(prev => prev !== date ? date : prev);
    }

    const cat = searchParams.get('category');
    if (cat !== null) {
      setCategoryFilter(prev => prev !== cat ? cat : prev);
    }

    const type = searchParams.get('type') as TransactionType | null;
    if (type && (type === 'all' || type === 'spending' || type === 'income')) {
      setTypeFilter(prev => prev !== type ? type : prev);
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter(t => {
      const matchesSearch = (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (ignoreAutopay && isInternalTransfer(t)) {
        return false;
      }

      let matchesDate = true;
      if (dateFilter) {
        matchesDate = t.date === dateFilter;
      } else if (timeRange !== 'all') {
        const tDate = new Date((t.date || '') + 'T00:00:00');
        if (isNaN(tDate.getTime())) {
          matchesDate = false;
        } else if (timeRange === 'week') {
          const start = new Date(currentDate);
          const day = start.getDay();
          const diff = start.getDate() - day + (day === 0 ? -6 : 1);
          start.setDate(diff);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          matchesDate = tDate >= start && tDate <= end;
        } else if (timeRange === 'month') {
          const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
          matchesDate = tDate >= start && tDate <= end;
        } else if (timeRange === 'ytd') {
          const start = new Date(currentDate.getFullYear(), 0, 1);
          const end = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
          matchesDate = tDate >= start && tDate <= end;
        }
      }

      const matchesCategory = !categoryFilter || t.category === categoryFilter;
      
      const matchesType = typeFilter === 'all' || 
                         (typeFilter === 'spending' && isSpending(t)) || 
                         (typeFilter === 'income' && isIncome(t));
      
      return matchesSearch && matchesDate && matchesCategory && matchesType;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = (a.date || '').localeCompare(b.date || '');
      } else if (sortBy === 'category') {
        comparison = (a.category || '').localeCompare(b.category || '');
      } else if (sortBy === 'amount') {
        const aVal = isIncome(a) ? absAmount(a) : -absAmount(a);
        const bVal = isIncome(b) ? absAmount(b) : -absAmount(b);
        comparison = aVal - bVal;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [transactions, searchTerm, dateFilter, categoryFilter, ignoreAutopay, timeRange, currentDate, typeFilter, sortBy, sortOrder]);

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [transactions]);

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
    } else if (timeRange === 'ytd') {
      return `Year ${currentDate.getFullYear()} (YTD)`;
    }
    return 'All Time';
  };

  const netBalance = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => {
      if (isIncome(t)) return sum + absAmount(t);
      if (isSpending(t)) return sum - absAmount(t);
      return sum;
    }, 0);
  }, [filteredTransactions]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 pb-20">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Transactions</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/budget"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <DollarSign size={18} />
              Budget
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          {/* Filters Card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-1 md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search description or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      if (e.target.value) setTimeRange('all');
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setIgnoreAutopay(!ignoreAutopay)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      ignoreAutopay 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' 
                      : 'bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${
                      ignoreAutopay ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-zinc-300'
                    }`}>
                      {ignoreAutopay && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    Ignore Autopay
                  </button>

                  <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <button
                      onClick={() => setTypeFilter('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        typeFilter === 'all' 
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setTypeFilter('spending')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        typeFilter === 'spending' 
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <TrendingDown size={14} className={typeFilter === 'spending' ? 'text-blue-500' : ''} />
                      Spending
                    </button>
                    <button
                      onClick={() => setTypeFilter('income')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        typeFilter === 'income' 
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <TrendingUp size={14} className={typeFilter === 'income' ? 'text-emerald-500' : ''} />
                      Income
                    </button>
                  </div>

                  <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <button
                      onClick={() => {
                        setTimeRange('week');
                        setDateFilter('');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        timeRange === 'week' 
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => {
                        setTimeRange('month');
                        setDateFilter('');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        timeRange === 'month' 
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => {
                        setTimeRange('ytd');
                        setDateFilter('');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        timeRange === 'ytd' 
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      YTD
                    </button>
                    <button
                      onClick={() => setTimeRange('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        timeRange === 'all' 
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      All
                    </button>
                  </div>

                  {timeRange !== 'all' && (
                    <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                      <button 
                        onClick={goToPrevious}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border-r border-zinc-200 dark:border-zinc-700"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <div className="px-3 py-1.5 text-xs font-medium min-w-[120px] text-center">
                        {formatPeriodLabel()}
                      </div>
                      <button 
                        onClick={goToNext}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border-l border-zinc-200 dark:border-zinc-700"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {(dateFilter || categoryFilter || searchTerm || !ignoreAutopay || timeRange !== 'all' || typeFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setDateFilter('');
                      setCategoryFilter('');
                      setSearchTerm('');
                      setIgnoreAutopay(true);
                      setTimeRange('all');
                      setTypeFilter('all');
                      router.replace('/transactions');
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
            <p className="text-sm text-zinc-500">
              Showing {filteredTransactions.length} transactions
            </p>
            <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-500">Net Balance:</span>
              <span className={`text-lg font-bold ${netBalance < 0 ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(netBalance))}
              </span>
            </div>
          </div>

          {/* Transactions Table/List */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                    <th 
                      className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors group"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        {sortBy === 'date' ? (
                          sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                    <th 
                      className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors group"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-1">
                        Category
                        {sortBy === 'category' ? (
                          sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors group"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Amount
                        {sortBy === 'amount' ? (
                          sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                        Loading transactions...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                        No transactions match your filters
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => {
                      const Icon = categoryIcons[t.category] || CreditCard;
                      return (
                        <tr key={t.transactionId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 text-sm whitespace-nowrap">{t.date}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0">
                                <Icon size={16} />
                              </div>
                              <span className="text-sm font-medium line-clamp-1">{t.description}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                              {t.category}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm font-semibold text-right whitespace-nowrap ${isSpending(t) ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(absAmount(t))}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
