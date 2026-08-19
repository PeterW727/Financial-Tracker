import React, { useState } from 'react';
import { Home, CreditCard, Train, Info } from 'lucide-react';
import { RecurringExpense } from '@/lib/types';

interface HousingBreakdownProps {
  totalRent: number;
  perPersonSplit: number;
  utilities: number;
}

interface SubscriptionManagerProps {
  subscriptions: RecurringExpense[];
}

export function HousingBreakdown({ totalRent, perPersonSplit, utilities }: HousingBreakdownProps) {
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-zinc-50 font-semibold">
        <Home size={20} className="text-blue-500" />
        Housing Breakdown
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-500">Total Rent</span>
          <span className="text-sm font-bold">{formatCurrency(totalRent)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            Your Split
            <div className="group relative">
              <Info size={14} className="text-zinc-400" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 p-2 bg-zinc-900 text-white text-[10px] rounded shadow-lg z-10">
                Calculated per-person split
              </div>
            </div>
          </div>
          <span className="text-sm font-bold text-blue-600">{formatCurrency(perPersonSplit)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-500">Utilities (Est.)</span>
          <span className="text-sm font-medium">{formatCurrency(utilities)}</span>
        </div>
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <span className="text-sm font-semibold">Total Monthly Cost</span>
          <span className="text-base font-bold">{formatCurrency(perPersonSplit + utilities)}</span>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionManager({ subscriptions }: SubscriptionManagerProps) {
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const total = subscriptions.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full">
      <div className="flex items-center gap-2 mb-6 text-zinc-900 dark:text-zinc-50 font-semibold">
        <CreditCard size={20} className="text-purple-500" />
        Subscription Manager
      </div>
      <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="flex justify-between items-center">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{sub.name}</span>
            <span className="text-sm font-medium">{formatCurrency(sub.amount)}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <span className="text-sm font-semibold">Monthly Total</span>
        <span className="text-base font-bold text-purple-600">{formatCurrency(total)}</span>
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
