import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { formatCurrency, formatDateRange, getStatusColor, getStatusLabel, calculateKpiProgress, formatNumber } from '@/shared/lib/formatters';
import { FavoriteButton } from './favorite-button';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    country: string;
    organization: string | null;
    projectType: string;
    status: string;
    description: string;
    projectValue: number;
    investmentCosts: number | null;
    investmentType: string | null;
    startDate: Date | string;
    endDate: Date | string | null;
    kpis: Array<{
      id: string;
      indicatorName: string;
      targetValue: number;
      valueAchieved: number;
      unit: string;
      decimals: boolean;
      thousandSeparators: boolean;
      isPrimary: boolean;
    }>;
    favorites?: Array<{ userId: string }>;
  };
  userId?: string;
  canEdit?: boolean;
}

export function ProjectCard({ project, userId }: ProjectCardProps) {
  const primaryKpi = project.kpis.find(kpi => kpi.isPrimary);
  const isFavorite = !!(userId && project.favorites && project.favorites.length > 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="truncate">{project.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{project.country}</span>
              {project.organization && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {project.organization}
                  </span>
                </>
              )}
              <span>•</span>
              <span>{project.projectType}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {userId && <FavoriteButton projectId={project.id} isFavorite={isFavorite} />}
            <Badge variant={getStatusColor(project.status) as any}>
              {getStatusLabel(project.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        {primaryKpi ? (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
              Primary KPI: {primaryKpi.indicatorName}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {formatNumber(primaryKpi.valueAchieved, {
                  decimals: primaryKpi.decimals,
                  thousandSeparators: primaryKpi.thousandSeparators,
                })}
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                / {formatNumber(primaryKpi.targetValue, {
                  decimals: primaryKpi.decimals,
                  thousandSeparators: primaryKpi.thousandSeparators,
                })} {primaryKpi.unit}
              </span>
              <span className="ml-auto text-sm font-medium text-blue-900 dark:text-blue-100">
                {calculateKpiProgress(primaryKpi.valueAchieved, primaryKpi.targetValue)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">No primary KPI selected</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Project Value:</span>
            <div className="font-medium">{formatCurrency(project.projectValue)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Investment:</span>
            <div className="font-medium">{formatCurrency(project.investmentCosts)}</div>
          </div>
          {project.investmentType && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Type:</span>
              <div className="font-medium">{project.investmentType}</div>
            </div>
          )}
          <div className="col-span-2">
            <span className="text-muted-foreground">Duration:</span>
            <div className="font-medium">{formatDateRange(project.startDate, project.endDate)}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/project/${project.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
