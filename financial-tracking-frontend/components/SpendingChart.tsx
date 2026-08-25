'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '@/lib/types';
import { isSpending, absAmount } from '@/lib/transactionUtils';
import { useRouter } from 'next/navigation';

interface SpendingChartProps {
  transactions: Transaction[];
  timeRange?: string;
  currentDate?: Date;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function SpendingChart({ transactions, timeRange, currentDate }: SpendingChartProps) {
  const router = useRouter();
  const [ignoreChase, setIgnoreChase] = useState(false);

  const categoryTotals = transactions.reduce((acc, t) => {
    if (isSpending(t)) {
      if (ignoreChase && t.transactionOrigin === 'CHASE') {
        return acc;
      }
      acc[t.category] = (acc[t.category] || 0) + absAmount(t);
    }
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  const handlePieClick = (data: any) => {
    if (data.name) {
      let url = `/transactions?category=${encodeURIComponent(data.name)}`;
      if (timeRange) {
        url += `&range=${timeRange}`;
      }
      if (currentDate) {
        url += `&baseDate=${currentDate.toISOString()}`;
      }
      router.push(url);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Spending by Category</h3>
        <button
          onClick={() => setIgnoreChase(!ignoreChase)}
          className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <div className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${
            ignoreChase ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-zinc-300'
          }`}>
            {ignoreChase && <div className="w-1 h-1 bg-white rounded-full" />}
          </div>
          Ignore Chase
        </button>
      </div>
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-zinc-500">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              onClick={handlePieClick}
              className="cursor-pointer focus:outline-none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
              }}
              formatter={(value: any, name: any) => [
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0)),
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
      {data.length > 0 && (
        <p className="mt-[-10px] text-[10px] text-center text-zinc-400 italic">Click a slice to filter transactions</p>
      )}
    </div>
  );
}
