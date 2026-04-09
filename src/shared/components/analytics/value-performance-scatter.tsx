'use client';

import { formatCurrencyMillions, formatPercentage } from '@/shared/lib/formatters';
import type { ValueVsPerformanceData } from '@/types/analytics';
import {
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer } from './chart-container';

interface ValuePerformanceScatterProps {
  data: ValueVsPerformanceData[];
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'var(--color-status-planning)',
  IN_PROGRESS: 'var(--color-status-in-progress)',
  COMPLETED: 'var(--color-status-completed)',
  ON_HOLD: 'var(--color-status-on-hold)',
};

export function ValuePerformanceScatter({ data }: ValuePerformanceScatterProps) {
  if (data.length === 0) {
    return (
      <ChartContainer title="Value vs Performance">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No performance data available
        </div>
      </ChartContainer>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    valueInMillions: item.value / 1_000_000,
  }));

  return (
    <ChartContainer
      title="Value vs Performance"
      description="Investment value compared to average KPI achievement"
    >
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="valueInMillions"
            name="Investment"
            label={{ value: 'Investment (M EUR)', position: 'insideBottom', offset: -25 }}
          />
          <YAxis
            type="number"
            dataKey="avgKpi"
            name="KPI Achievement"
            label={{
              value: 'Avg KPI Achievement (%)',
              angle: -90,
              position: 'outsideLeft',
              dx: -30,
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload?.length) {
                const data = payload[0].payload as ValueVsPerformanceData & {
                  valueInMillions: number;
                };
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-semibold mb-2">{data.name}</p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Investment:</span>{' '}
                      <span className="font-medium">{formatCurrencyMillions(data.value)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Avg KPI:</span>{' '}
                      <span className="font-medium">{formatPercentage(data.avgKpi)}</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend align="right" />
          <Scatter name="Projects" data={chartData}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status] || 'var(--color-primary)'}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
