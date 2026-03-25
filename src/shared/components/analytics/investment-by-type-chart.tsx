'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { InvestmentByType } from '@/types/analytics';
import { ChartContainer } from './chart-container';
import { formatCurrencyMillions } from '@/shared/lib/formatters';

interface InvestmentByTypeChartProps {
  data: InvestmentByType[];
}

export function InvestmentByTypeChart({ data }: InvestmentByTypeChartProps) {
  if (data.length === 0) {
    return (
      <ChartContainer title="Investment by Project Type">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No investment data available
        </div>
      </ChartContainer>
    );
  }

  const chartData = data.map(item => ({
    type: item.type,
    valueInMillions: item.value / 1_000_000,
    count: item.count,
  }));

  return (
    <ChartContainer
      title="Investment by Project Type"
      description="Total investment value and project count per type"
    >
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} fontSize={12} />
          <YAxis
            yAxisId="left"
            label={{ value: 'Investment (M EUR)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Project Count', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'valueInMillions') {
                return [formatCurrencyMillions(value * 1_000_000), 'Investment'];
              }
              return [value, 'Projects'];
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="valueInMillions"
            fill="hsl(var(--primary))"
            name="Investment (M EUR)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--destructive))"
            name="Project Count"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
