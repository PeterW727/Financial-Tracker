import React from 'react';

interface ProjectionRow {
  label: string;
  values: (number | string)[];
  isHeader?: boolean;
  isBold?: boolean;
  isPercentage?: boolean;
  isCurrency?: boolean;
}

interface CashFlowProjectionsTableProps {
  view: 'Budgeted' | 'Actual';
  months: string[];
  data: ProjectionRow[];
}

export default function CashFlowProjectionsTable({ view, months, data }: CashFlowProjectionsTableProps) {
  const formatValue = (value: number | string, isCurrency?: boolean, isPercentage?: boolean) => {
    if (typeof value === 'string') return value;
    if (isPercentage) return `${value.toFixed(1)}%`;
    if (isCurrency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toString();
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <h3 className="text-lg font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
        Cash Flow Projections ({view})
      </h3>
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr>
              <th className="py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 sticky left-0 bg-white dark:bg-zinc-900 z-10 min-w-[150px]"></th>
              {months.map((month, i) => (
                <th key={i} className="py-2 px-4 font-medium text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-800 text-center min-w-[80px]">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              if (row.label === 'space') {
                return (
                  <tr key={i} className="h-4">
                    <td colSpan={months.length + 1}></td>
                  </tr>
                );
              }
              
              return (
                <tr 
                  key={i} 
                  className={`
                    ${row.isHeader ? 'bg-zinc-50/50 dark:bg-zinc-800/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'} 
                    transition-colors
                  `}
                >
                  <td className={`
                    py-2 pr-4 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-b border-zinc-50 dark:border-zinc-800
                    ${row.isHeader ? 'font-bold text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400'}
                    ${row.isBold ? 'font-bold text-zinc-900 dark:text-zinc-50' : ''}
                  `}>
                    {row.label}
                  </td>
                  {row.values.map((val, j) => (
                    <td 
                      key={j} 
                      className={`
                        py-2 px-4 text-center border-b border-zinc-50 dark:border-zinc-800
                        ${row.isHeader ? 'font-bold' : ''}
                        ${row.isBold ? 'font-bold text-zinc-900 dark:text-zinc-50' : 'text-zinc-600 dark:text-zinc-400'}
                        ${typeof val === 'number' && val < 0 ? 'text-rose-500' : ''}
                      `}
                    >
                      {formatValue(val, row.isCurrency, row.isPercentage)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
