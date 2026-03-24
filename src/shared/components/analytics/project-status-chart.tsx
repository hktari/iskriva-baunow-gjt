'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ProjectStatusData } from '@/types/analytics';
import { ChartContainer } from './chart-container';
import { getStatusLabel } from '@/shared/lib/formatters';

interface ProjectStatusChartProps {
  data: ProjectStatusData[];
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'hsl(var(--muted))',
  IN_PROGRESS: 'hsl(var(--primary))',
  COMPLETED: 'hsl(var(--secondary))',
  ON_HOLD: 'hsl(var(--destructive))',
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

  const chartData = data.map((item) => ({
    name: getStatusLabel(item.status),
    value: item.count,
    percentage: item.percentage,
  }));

  return (
    <ChartContainer title="Project Status Distribution" description="Breakdown of projects by status">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => {
              const originalStatus = data[index].status;
              return (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[originalStatus] || 'hsl(var(--primary))'} />
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
