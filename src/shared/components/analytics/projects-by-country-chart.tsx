'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProjectsByCountry } from '@/types/analytics';
import { ChartContainer } from './chart-container';

interface ProjectsByCountryChartProps {
  data: ProjectsByCountry[];
}

export function ProjectsByCountryChart({ data }: ProjectsByCountryChartProps) {
  if (data.length === 0) {
    return (
      <ChartContainer title="Projects by Country">
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No project data available
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title="Projects by Country"
      description="Distribution of projects across countries"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="country" angle={-45} textAnchor="end" height={100} fontSize={12} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
