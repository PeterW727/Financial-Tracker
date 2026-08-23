import React from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';

interface ProjectionData {
  month: string;
  income: number;
  expenses: number;
  savingsBalance: number;
  isProjected?: boolean;
  bonus?: number;
}

interface ProjectionsChartProps {
  data: ProjectionData[];
}

export default function ProjectionsChart({ data }: ProjectionsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="h-full min-h-[400px]">
      <h3 className="text-lg font-semibold mb-6">Cash Flow & Projections</h3>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
              tickFormatter={formatCurrency}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
              }}
              formatter={(value: any) => [formatCurrency(value as number), '']}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            
            <Bar 
              yAxisId="left" 
              dataKey="income" 
              name="Income" 
              stackId="a" 
              fill="#6366f1" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
            <Bar 
              yAxisId="left" 
              dataKey="expenses" 
              name="Expenses" 
              stackId="b" 
              fill="#f43f5e" 
              radius={[4, 4, 0, 0]} 
              barSize={20}
            />
            
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="savingsBalance"
              name="Savings Balance"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-indigo-500 opacity-50" />
          <span>Historical Income</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-rose-500 opacity-50" />
          <span>Historical Expenses</span>
        </div>
      </div>
    </div>
  );
}
