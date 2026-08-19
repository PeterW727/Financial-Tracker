'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Transaction, TimeRange } from '@/lib/types';
import { isSpending, isIncome, absAmount } from '@/lib/transactionUtils';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type TrendView = 'spending' | 'income' | 'both';

interface TrendChartProps {
  transactions: Transaction[];
  timeRange: TimeRange;
  currentDate: Date;
}

const CustomTooltip = ({ active, payload, label, viewType }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const transactions = data.transactions || [];
    
    let colorClass = viewType === 'income' ? 'text-emerald-600' : 'text-blue-600';
    let labelText = 'Total';
    
    if (viewType === 'both') {
      colorClass = data.amount >= 0 ? 'text-emerald-600' : 'text-red-600';
      labelText = 'Net';
    }

    return (
      <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-xs z-50">
        <p className="font-bold text-sm mb-2 text-zinc-900 dark:text-zinc-50">{data.fullDate || label}</p>
        {viewType === 'both' ? (
          (data.income > 0 || data.spending > 0) && (
            <>
              <p className={`${colorClass} font-semibold mb-2`}>{labelText}: ${data.amount.toFixed(2)}</p>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-emerald-600">Inc: ${data.income.toFixed(2)}</span>
                <span className="text-red-600">Exp: ${data.spending.toFixed(2)}</span>
              </div>
            </>
          )
        ) : (
          <p className={`${colorClass} font-semibold mb-2`}>{labelText}: ${data.amount.toFixed(2)}</p>
        )}
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {transactions.map((t: Transaction, i: number) => (
            <div key={i} className="text-sm flex justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-1">
              <span className="truncate flex-1 text-zinc-600 dark:text-zinc-400">{t.description}</span>
              <span className={`font-medium ${isIncome(t) ? 'text-emerald-600' : 'text-red-600'}`}>
                {isIncome(t) ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
              </span>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-xs text-zinc-500 italic">No transactions</p>}
        </div>
        <p className="mt-2 text-[10px] text-zinc-400 text-center italic">Click to see all transactions</p>
      </div>
    );
  }
  return null;
};

interface ChartDataPoint {
  date: string;
  fullDate: string;
  amount: number;
  spending: number;
  income: number;
  transactions: Transaction[];
  dateStr?: string;
  monthBaseDate?: string;
}

export default function TrendChart({ transactions, timeRange, currentDate }: TrendChartProps) {
  const router = useRouter();
  const [viewType, setViewType] = useState<TrendView>('spending');
  
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (timeRange === 'week') {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);

      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const dayTransactions = transactions.filter(t => t.date === dateStr);
        const spending = dayTransactions.filter(isSpending).reduce((sum, t) => sum + absAmount(t), 0);
        const income = dayTransactions.filter(isIncome).reduce((sum, t) => sum + absAmount(t), 0);
        const net = income - spending;

        let amount = 0;
        let displayTransactions = dayTransactions;

        if (viewType === 'spending') {
          amount = spending;
          displayTransactions = dayTransactions.filter(isSpending);
        } else if (viewType === 'income') {
          amount = income;
          displayTransactions = dayTransactions.filter(isIncome);
        } else {
          amount = net;
          displayTransactions = dayTransactions.filter(t => isSpending(t) || isIncome(t));
        }
        
        days.push({
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          dateStr,
          amount,
          spending,
          income,
          transactions: displayTransactions
        });
      }
      return days;
    } else if (timeRange === 'ytd') {
      const year = currentDate.getFullYear();
      const months = [];
      for (let i = 0; i < 12; i++) {
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date + 'T00:00:00');
          return tDate.getFullYear() === year && tDate.getMonth() === i;
        });

        const spending = monthTransactions.filter(isSpending).reduce((sum, t) => sum + absAmount(t), 0);
        const income = monthTransactions.filter(isIncome).reduce((sum, t) => sum + absAmount(t), 0);
        const net = income - spending;

        let amount = 0;
        let displayTransactions = monthTransactions;

        if (viewType === 'spending') {
          amount = spending;
          displayTransactions = monthTransactions.filter(isSpending);
        } else if (viewType === 'income') {
          amount = income;
          displayTransactions = monthTransactions.filter(isIncome);
        } else {
          amount = net;
          displayTransactions = monthTransactions.filter(t => isSpending(t) || isIncome(t));
        }
        
        months.push({
          date: new Date(year, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          fullDate: new Date(year, i, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          amount,
          spending,
          income,
          transactions: displayTransactions,
          monthBaseDate: new Date(year, i, 1).toISOString()
        });
      }
      return months;
    }
    return [];
  }, [transactions, timeRange, currentDate, viewType]);

  const handleBarClick = (data: any) => {
    if (data.dateStr) {
      router.push(`/transactions?date=${data.dateStr}`);
    } else if (data.monthBaseDate) {
      router.push(`/transactions?range=month&baseDate=${data.monthBaseDate}`);
    }
  };

  if (timeRange === 'month') {
    return <CalendarView transactions={transactions} currentDate={currentDate} viewType={viewType} setViewType={setViewType} />;
  }

  const primaryColor = viewType === 'income' ? '#10b981' : (viewType === 'spending' ? '#3b82f6' : '#8b5cf6');

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 h-[400px] mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {timeRange === 'week' ? 
            (viewType === 'spending' ? 'Weekly Spending Breakdown' : viewType === 'income' ? 'Weekly Income Breakdown' : 'Weekly Net Trend') : 
            (viewType === 'spending' ? 'Yearly Spending Trend' : viewType === 'income' ? 'Yearly Income Trend' : 'Yearly Net Trend')}
        </h3>
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setViewType('spending')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewType === 'spending' 
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Spending
          </button>
          <button
            onClick={() => setViewType('income')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewType === 'income' 
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setViewType('both')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewType === 'both' 
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Both
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value: any) => `${value < 0 ? '-' : ''}$${Math.abs(value)}`}
          />
          <Tooltip 
            cursor={{ fill: '#f3f4f6', opacity: 0.4 }}
            content={<CustomTooltip viewType={viewType} />}
          />
          <Bar 
            dataKey="amount" 
            fill={primaryColor} 
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            className="cursor-pointer"
          >
            {chartData.map((entry, index) => {
              let barColor = primaryColor;
              if (viewType === 'both') {
                barColor = entry.amount >= 0 ? '#10b981' : '#ef4444';
              }
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={barColor} 
                  fillOpacity={entry.amount !== 0 ? 1 : 0.3}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CalendarView({ 
  transactions, 
  currentDate, 
  viewType, 
  setViewType 
}: { 
  transactions: Transaction[], 
  currentDate: Date,
  viewType: TrendView,
  setViewType: (v: TrendView) => void
}) {
  const router = useRouter();
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  
  // Start from the Monday before or on the 1st of the month
  const startDay = firstDayOfMonth.getDay();
  const diff = firstDayOfMonth.getDate() - startDay + (startDay === 0 ? -6 : 1);
  const calendarStart = new Date(firstDayOfMonth);
  calendarStart.setDate(diff);
  
  const days = [];
  const tempDate = new Date(calendarStart);
  
  // 6 weeks to be safe
  for (let i = 0; i < 42; i++) {
    const year = tempDate.getFullYear();
    const monthVal = String(tempDate.getMonth() + 1).padStart(2, '0');
    const dayVal = String(tempDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${monthVal}-${dayVal}`;
    
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    const spending = dayTransactions.filter(isSpending).reduce((sum, t) => sum + absAmount(t), 0);
    const income = dayTransactions.filter(isIncome).reduce((sum, t) => sum + absAmount(t), 0);
    const net = income - spending;

    let amount = 0;
    let displayTransactions = dayTransactions;

    if (viewType === 'spending') {
      amount = spending;
      displayTransactions = dayTransactions.filter(isSpending);
    } else if (viewType === 'income') {
      amount = income;
      displayTransactions = dayTransactions.filter(isIncome);
    } else {
      amount = net;
      displayTransactions = dayTransactions.filter(t => isSpending(t) || isIncome(t));
    }
    
    days.push({
      date: new Date(tempDate),
      amount,
      spending,
      income,
      transactions: displayTransactions,
      isCurrentMonth: tempDate.getMonth() === month
    });
    
    tempDate.setDate(tempDate.getDate() + 1);
    
    // Stop if we finished the month and we are at the end of a week
    if (i >= 28 && tempDate.getMonth() !== month && tempDate.getDay() === 1) {
      break;
    }
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const colorClasses = {
    spending: {
      text: 'text-blue-600 dark:text-blue-400',
      dot: 'bg-blue-400',
      total: 'text-blue-600'
    },
    income: {
      text: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-400',
      total: 'text-emerald-600'
    },
    both: {
      text: 'text-purple-600 dark:text-purple-400',
      dot: 'bg-purple-400',
      total: 'text-purple-600'
    }
  }[viewType] || { text: '', dot: '', total: '' };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {viewType === 'spending' ? 'Calendar Spending View' : viewType === 'income' ? 'Calendar Income View' : 'Calendar Net View'}
        </h3>
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setViewType('spending')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewType === 'spending' 
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Spending
          </button>
          <button
            onClick={() => setViewType('income')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewType === 'income' 
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setViewType('both')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewType === 'both' 
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Both
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        {weekDays.map(day => (
          <div key={day} className="bg-zinc-50 dark:bg-zinc-900/50 py-2 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {days.map((day, idx) => (
          <div 
            key={idx} 
            onClick={() => {
              const year = day.date.getFullYear();
              const monthVal = String(day.date.getMonth() + 1).padStart(2, '0');
              const dayVal = String(day.date.getDate()).padStart(2, '0');
              router.push(`/transactions?date=${year}-${monthVal}-${dayVal}`);
            }}
            onMouseEnter={() => setHoveredDayIdx(idx)}
            onMouseLeave={() => setHoveredDayIdx(null)}
            className={`min-h-[80px] p-2 bg-white dark:bg-zinc-900 group relative transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer ${
              !day.isCurrentMonth ? 'opacity-30' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-xs font-medium ${day.isCurrentMonth ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'}`}>
                {day.date.getDate()}
              </span>
              {viewType === 'both' ? (
                (day.income > 0 || day.spending > 0) && (
                  <div className="flex flex-col items-end -mt-1">
                    {day.income > 0 && <span className="text-[10px] font-bold text-emerald-600 leading-none mb-0.5">+${day.income.toFixed(0)}</span>}
                    {day.spending > 0 && <span className="text-[10px] font-bold text-red-600 leading-none mb-0.5">-${day.spending.toFixed(0)}</span>}
                    <span className={`text-xs font-black leading-none ${day.amount >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                      ${day.amount.toFixed(0)}
                    </span>
                  </div>
                )
              ) : (
                day.amount > 0 && (
                  <span className={`text-sm font-bold ${colorClasses.text}`}>
                    ${day.amount.toFixed(0)}
                  </span>
                )
              )}
            </div>
            
            {/* Simple dot indicator for transactions */}
            <div className="flex flex-wrap gap-0.5 mt-1">
              {day.transactions.slice(0, 4).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              ))}
              {day.transactions.length > 4 && (
                <div className={`w-1 h-1 rounded-full ${colorClasses.dot}`} />
              )}
            </div>

            {/* Hover Popup */}
            <div className="invisible group-hover:visible absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 pointer-events-none">
              <p className="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-50">
                {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {viewType === 'both' ? (
                (day.income > 0 || day.spending > 0) && (
                  <div className="mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Income:</span>
                      <span className="text-emerald-600 font-bold">${day.income.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Spending:</span>
                      <span className="text-red-600 font-bold">${day.spending.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-1">
                      <span className="text-zinc-900 dark:text-zinc-50">Net:</span>
                      <span className={day.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        ${day.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <p className={`${colorClasses.total} font-bold text-sm mb-2`}>Total: ${day.amount.toFixed(2)}</p>
              )}
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {day.transactions.map((t, i) => (
                  <div key={i} className="text-xs flex justify-between gap-1 border-t border-zinc-100 dark:border-zinc-800 pt-1">
                    <span className="truncate flex-1 text-zinc-600 dark:text-zinc-400">{t.description}</span>
                    <span className={`font-medium ${isIncome(t) ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isIncome(t) ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
                {day.transactions.length === 0 && <p className="text-xs text-zinc-500 italic">No transactions</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
