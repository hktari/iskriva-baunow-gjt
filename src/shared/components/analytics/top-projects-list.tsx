'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { TopProject } from '@/types/analytics';
import { Trophy, Medal, Award } from 'lucide-react';
import { formatPercentage } from '@/shared/lib/formatters';

interface TopProjectsListProps {
  data: TopProject[];
}

export function TopProjectsList({ data }: TopProjectsListProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Projects</CardTitle>
          <CardDescription>Projects ranked by average KPI achievement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No project performance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <div className="h-5 w-5 flex items-center justify-center text-sm font-semibold text-muted-foreground">{rank}</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Projects</CardTitle>
        <CardDescription>Projects ranked by average KPI achievement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((project) => (
            <div
              key={project.projectId}
              className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0">
                {getRankIcon(project.rank)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{project.name}</p>
                <p className="text-sm text-muted-foreground">
                  {project.country} • {project.kpiCount} KPI{project.kpiCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Badge 
                  variant={project.avgAchievement >= 100 ? 'default' : project.avgAchievement >= 80 ? 'secondary' : 'outline'}
                  className="font-semibold"
                >
                  {formatPercentage(project.avgAchievement)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
