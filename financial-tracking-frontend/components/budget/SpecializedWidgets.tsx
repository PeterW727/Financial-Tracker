import React, { useState } from 'react';
import { Home, CreditCard, Train } from 'lucide-react';
import { parseLocalDate } from '@/lib/dateUtils';
import { Expense } from '@/lib/types';

interface HousingBreakdownProps {
  expenses: Expense[];
}

interface SubscriptionManagerProps {
  subscriptions: Expense[];
}

export function HousingBreakdown({ expenses }: HousingBreakdownProps) {
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  
  const housingExpenses = expenses.filter(e => 
    e.name.toLowerCase().includes('rent') || 
    e.name.toLowerCase().includes('utility') || 
    e.name.toLowerCase().includes('utilities')
  );

  const recurringRentSum = housingExpenses
    .filter(e => e.name.toLowerCase().includes('rent') && e.frequency !== 'Single')
    .reduce((acc, e) => acc + e.amount, 0);
  
  const singleHousingExpenses = housingExpenses.filter(e => e.frequency === 'Single');
  
  const recurringUtilities = housingExpenses
    .filter(e => (e.name.toLowerCase().includes('utility') || e.name.toLowerCase().includes('utilities')) && e.frequency !== 'Single')
    .reduce((acc, e) => acc + e.amount, 0);

  const singleHousingSum = singleHousingExpenses.reduce((acc, e) => acc + e.amount, 0);
  
  const perPersonRent = recurringRentSum;
  
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-zinc-50 font-semibold">
        <Home size={20} className="text-blue-500" />
        Housing Breakdown
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-500">Rent (Per Person)</span>
          <span className="text-sm font-bold">{formatCurrency(perPersonRent)}</span>
        </div>
        
        {singleHousingExpenses.map(e => (
          <div key={e.expenseId || e.name} className="flex justify-between items-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-100 dark:border-amber-900/30">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-amber-800 dark:text-amber-200">{e.name}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">
                Single expense ({e.startDate ? parseLocalDate(e.startDate)?.toLocaleDateString('en-US', { month: 'long' }) : 'N/A'})
              </span>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{formatCurrency(e.amount)}</span>
          </div>
        ))}

        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-500">Utilities (Est.)</span>
          <span className="text-sm font-medium">{formatCurrency(recurringUtilities)}</span>
        </div>
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <span className="text-sm font-semibold">Total Monthly Cost</span>
          <span className="text-base font-bold text-blue-600">
            {formatCurrency(perPersonRent + recurringUtilities + singleHousingSum)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionManager({ subscriptions }: SubscriptionManagerProps) {
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  
  const getMonthly = (s: Expense) => {
    if (s.frequency === 'Monthly') return s.amount;
    if (s.frequency === 'Yearly') return s.amount / 12;
    return s.amount;
  };

  const getYearly = (s: Expense) => {
    if (s.frequency === 'Yearly') return s.amount;
    if (s.frequency === 'Monthly') return s.amount * 12;
    return s.amount * 12;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-zinc-50 font-semibold">
        <CreditCard size={20} className="text-purple-500" />
        Subscription Manager
      </div>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <span>Subscription</span>
          <span className="text-right">Monthly</span>
          <span className="text-right">Yearly</span>
        </div>
        {subscriptions.map((sub) => (
          <div key={sub.expenseId || sub.name} className="grid grid-cols-3 items-center py-1">
            <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate pr-2">
              {sub.name.replace(/^Subscriptions?\s*-\s*/i, '')}
            </span>
            <span className={`text-sm text-right ${sub.frequency === 'Monthly' ? 'font-bold text-zinc-900 dark:text-zinc-50' : 'text-zinc-500'}`}>
              {formatCurrency(getMonthly(sub))}
            </span>
            <span className={`text-sm text-right ${sub.frequency === 'Yearly' ? 'font-bold text-zinc-900 dark:text-zinc-50' : 'text-zinc-500'}`}>
              {formatCurrency(getYearly(sub))}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <span className="text-sm font-semibold">Total Monthly</span>
        <span className="text-base font-bold text-purple-600">
          {formatCurrency(subscriptions.reduce((acc, s) => acc + getMonthly(s), 0))}
        </span>
      </div>
    </div>
  );
}

export function CommuterCalculator() {
  const [trips, setTrips] = useState(12);
  const lirrRate = 15.25; // Example rates
  const subwayRate = 2.90;
  
  const lirrCost = trips * lirrRate;
  const subwayCost = trips * 2 * subwayRate;
  const total = lirrCost + subwayCost;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-zinc-50 font-semibold">
        <Train size={20} className="text-amber-500" />
        Commuter Calculator
      </div>
      <div className="space-y-6">
        <div>
          <label className="text-xs text-zinc-500 font-medium mb-2 block">Monthly Office Trips: {trips}</label>
          <input 
            type="range" 
            min="0" 
            max="22" 
            value={trips} 
            onChange={(e) => setTrips(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">LIRR</p>
            <p className="text-sm font-bold">{formatCurrency(lirrCost)}</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Subway</p>
            <p className="text-sm font-bold">{formatCurrency(subwayCost)}</p>
          </div>
        </div>
        <div className="pt-2 flex justify-between items-center">
          <span className="text-sm font-semibold">Budget Allocation</span>
          <span className="text-base font-bold text-amber-600">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
