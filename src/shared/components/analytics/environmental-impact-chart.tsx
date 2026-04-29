'use client';

import { formatChartValue } from '@/shared/lib/formatters';
import type { EnvironmentalImpactData } from '@/types/analytics';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from './chart-container';

interface EnvironmentalImpactChartProps {
  data: EnvironmentalImpactData[];
}

export function EnvironmentalImpactChart({ data }: EnvironmentalImpactChartProps) {
  if (data.length === 0) {
    return (
      <ChartContainer title="Environmental Impact">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No environmental impact data available
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Environmental Impact" description="Total achieved environmental metrics">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="metric" width={110} />
          <Tooltip
            formatter={(value, name, props) => {
              return [
                formatChartValue(Number(value ?? 0), (props as any).payload.unit),
                'Total Achieved',
              ];
            }}
          />
          <Bar dataKey="value" fill="var(--color-chart-2)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
