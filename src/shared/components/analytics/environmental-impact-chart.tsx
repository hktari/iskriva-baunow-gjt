'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EnvironmentalImpactData } from '@/types/analytics';
import { ChartContainer } from './chart-container';
import { formatChartValue } from '@/shared/lib/formatters';

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
            formatter={(value: number, name: string, props: any) => {
              return [formatChartValue(value, props.payload.unit), 'Total Achieved'];
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
