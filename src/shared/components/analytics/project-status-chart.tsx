'use client';

import { getStatusLabel } from '@/shared/lib/formatters';
import type { ProjectStatusData } from '@/types/analytics';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer } from './chart-container';

interface ProjectStatusChartProps {
  data: ProjectStatusData[];
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'var(--color-chart-3)',
  IN_PROGRESS: 'var(--color-chart-1)',
  COMPLETED: 'var(--color-chart-2)',
  ON_HOLD: 'var(--color-chart-1)',
};

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  if (data.length === 0) {
    return (
      <ChartContainer title="Project Status Distribution">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No status data available
        </div>
      </ChartContainer>
    );
  }

  const chartData = data.map(item => ({
    name: getStatusLabel(item.status),
    value: item.count,
    percentage: item.percentage,
  }));

  return (
    <ChartContainer
      title="Project Status Distribution"
      description="Breakdown of projects by status"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }: any) => `${name} (${percentage.toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => {
              const originalStatus = data[index].status;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[originalStatus] || 'var(--color-primary)'}
                />
              );
            })}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
