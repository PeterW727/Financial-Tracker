import React from 'react';
import { Income } from '@/lib/types';

interface IncomeSummaryTableProps {
  income: Income | null;
}

export default function IncomeSummaryTable({ income }: IncomeSummaryTableProps) {
  if (!income) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Summary of Income</h3>
        <p className="text-zinc-500 text-sm">No income data available. Please update your income.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const baseSalaryGross = income.salary;
  const baseSalaryNet = income.salary * (1 - income.salaryTaxRate / 100);
  
  const monthlyIncomeGross = income.salary / 12;
  const monthlyIncomeNet = (income.salary / 12) * (1 - income.salaryTaxRate / 100);
  
  const bonusGross = income.bonus;
  const bonusNet = income.bonus * (1 - income.bonusTaxRate / 100);
  
  const totalSalaryGross = income.salary + income.bonus;
  const totalSalaryNet = baseSalaryNet + bonusNet;
  
  const totalTax = (income.salary * (income.salaryTaxRate / 100)) + (income.bonus * (income.bonusTaxRate / 100));

  const rows = [
    { label: 'Base Salary', gross: formatCurrency(baseSalaryGross), net: formatCurrency(baseSalaryNet) },
    { label: 'Tax Rate', gross: `${income.salaryTaxRate}%`, net: `${income.salaryTaxRate}%` },
    { label: 'Income Per Month', gross: formatCurrency(monthlyIncomeGross), net: formatCurrency(monthlyIncomeNet) },
    { label: 'Bonus Amount', gross: formatCurrency(bonusGross), net: formatCurrency(bonusNet) },
    { label: 'Tax Rate (for bonus)', gross: `${income.bonusTaxRate}%`, net: `${income.bonusTaxRate}%` },
    { label: 'Bonus Payout Date', gross: income.bonusPayoutDate ? new Date(income.bonusPayoutDate).toLocaleDateString() : 'N/A', net: income.bonusPayoutDate ? new Date(income.bonusPayoutDate).toLocaleDateString() : 'N/A' },
    { label: 'Total Salary', gross: formatCurrency(totalSalaryGross), net: formatCurrency(totalSalaryNet) },
    { label: 'Total Tax', gross: '-', net: formatCurrency(totalTax) },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Summary of Income</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="py-2 font-medium text-zinc-500 dark:text-zinc-400"></th>
              <th className="py-2 font-medium text-zinc-900 dark:text-zinc-50">Gross</th>
              <th className="py-2 font-medium text-zinc-900 dark:text-zinc-50">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="py-3 font-medium text-zinc-700 dark:text-zinc-300">{row.label}</td>
                <td className="py-3 text-zinc-600 dark:text-zinc-400">{row.gross}</td>
                <td className="py-3 text-zinc-600 dark:text-zinc-400">{row.net}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
