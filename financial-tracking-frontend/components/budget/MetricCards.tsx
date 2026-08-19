import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface MetricCardsProps {
  totalSavings: number;
  savingsRate: number;
  targetSavingsRate: number;
  monthlyNetIncome: number;
  totalExpenses: number;
}

export default function MetricCards({
  totalSavings,
  savingsRate,
  targetSavingsRate,
  monthlyNetIncome,
  totalExpenses
}: MetricCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (rate: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
    }).format(rate / 100);
  };

  const metrics = [
    {
      title: 'Total Savings Balance',
      value: formatCurrency(totalSavings),
      icon: <DollarSign className="text-emerald-500" size={20} />,
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Savings Rate',
      value: formatPercent(savingsRate),
      subValue: `Target: ${formatPercent(targetSavingsRate)}`,
      icon: <PieChart className="text-blue-500" size={20} />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Monthly Net Income',
      value: formatCurrency(monthlyNetIncome),
      icon: <TrendingUp className="text-indigo-500" size={20} />,
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: <TrendingDown className="text-rose-500" size={20} />,
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              {metric.icon}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{metric.title}</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{metric.value}</h3>
            {metric.subValue && (
              <p className="text-xs text-zinc-400 mt-1">{metric.subValue}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
