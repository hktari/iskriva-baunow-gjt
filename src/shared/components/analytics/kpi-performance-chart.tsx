'use client';

import { formatChartValue } from '@/shared/lib/formatters';
import type { KpiPerformanceData } from '@/types/analytics';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from './chart-container';

interface KpiPerformanceChartProps {
  data: KpiPerformanceData[];
}

export function KpiPerformanceChart({ data }: KpiPerformanceChartProps) {
  if (data.length === 0) {
    return (
      <ChartContainer title="KPI Performance Overview">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No KPI data available
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="KPI Performance Overview"
      description="Average achievement percentage by indicator"
    >
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" unit="%" />
          <YAxis type="category" dataKey="indicator" width={140} fontSize={14} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.length) {
                const data = payload[0].payload as KpiPerformanceData;
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-semibold mb-2">{data.indicator}</p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Achievement:</span>{' '}
                      <span className="font-medium">{data.avgAchievement.toFixed(1)}%</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Total Achieved:</span>{' '}
                      <span className="font-medium">{formatChartValue(data.totalAchieved)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Projects:</span>{' '}
                      <span className="font-medium">{data.projectCount}</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="avgAchievement" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
