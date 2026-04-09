'use client';

import { formatCurrencyMillions } from '@/shared/lib/formatters';
import type { InvestmentByType } from '@/types/analytics';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer } from './chart-container';

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
          <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} fontSize={13} />
          <YAxis
            yAxisId="left"
            label={{
              value: 'Investment (M EUR)',
              angle: -90,
              position: 'outsideLeft',
              dx: -30,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            allowDecimals={false}
            label={{ value: 'Project Count', angle: 90, position: 'outsideRight', dx: 30 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'Investment (M EUR)') {
                return [formatCurrencyMillions(value * 1_000_000), 'Investment'];
              }
              return [value, 'Projects'];
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="valueInMillions"
            fill="var(--color-chart-1)"
            name="Investment (M EUR)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="count"
            stroke="var(--color-chart-2)"
            name="Project Count"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
