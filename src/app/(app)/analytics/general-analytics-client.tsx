'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { ProjectsByCountryChart } from '@/shared/components/analytics/projects-by-country-chart';
import { ProjectStatusChart } from '@/shared/components/analytics/project-status-chart';
import { InvestmentByTypeChart } from '@/shared/components/analytics/investment-by-type-chart';
import { KpiPerformanceChart } from '@/shared/components/analytics/kpi-performance-chart';
import { EnvironmentalImpactChart } from '@/shared/components/analytics/environmental-impact-chart';
import { ValuePerformanceScatter } from '@/shared/components/analytics/value-performance-scatter';
import { TopProjectsList } from '@/shared/components/analytics/top-projects-list';
import { getGeneralAnalytics } from '@/server/queries/analytics';
import { formatCurrency, formatLargeNumber } from '@/shared/lib/formatters';
import type { GeneralAnalyticsData, AnalyticsFilters } from '@/types/analytics';
import { Building2, TrendingUp, Euro, X } from 'lucide-react';

interface GeneralAnalyticsClientProps {
  userId?: string;
}

export function GeneralAnalyticsClient({ userId }: GeneralAnalyticsClientProps) {
  const [data, setData] = useState<GeneralAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [countries, setCountries] = useState<string[]>([]);
  const [projectTypes, setProjectTypes] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [filters, userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getGeneralAnalytics(filters, userId);
      setData(result);
      
      if (!countries.length && result.projectsByCountry.length > 0) {
        const uniqueCountries = result.projectsByCountry.map(p => p.country).sort();
        setCountries(uniqueCountries);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = filters.country || filters.projectType || filters.favoritesOnly;

  const clearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Failed to load analytics data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter analytics data by criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="country-filter">Country</Label>
              <select
                id="country-filter"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.country || ''}
                onChange={(e) => setFilters({ ...filters, country: e.target.value || undefined })}
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-filter">Project Type</Label>
              <select
                id="type-filter"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.projectType || ''}
                onChange={(e) => setFilters({ ...filters, projectType: e.target.value || undefined })}
              >
                <option value="">All Types</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {userId && (
              <div className="space-y-2">
                <Label className="block">Favorites</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="favorites-filter"
                    checked={filters.favoritesOnly || false}
                    onCheckedChange={(checked) =>
                      setFilters({ ...filters, favoritesOnly: checked as boolean })
                    }
                  />
                  <Label htmlFor="favorites-filter" className="cursor-pointer">
                    Show favorites only
                  </Label>
                </div>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {data.metrics.totalProjects} project{data.metrics.totalProjects !== 1 ? 's' : ''}
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Across {data.metrics.totalCountries} {data.metrics.totalCountries === 1 ? 'country' : 'countries'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Project Value</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.metrics.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatLargeNumber(data.metrics.totalValue)} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.metrics.totalInvestment)}</div>
            <p className="text-xs text-muted-foreground">
              {formatLargeNumber(data.metrics.totalInvestment)} invested
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6">
        <ProjectsByCountryChart data={data.projectsByCountry} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <ProjectStatusChart data={data.projectStatus} />
          <InvestmentByTypeChart data={data.investmentByType} />
        </div>

        <KpiPerformanceChart data={data.kpiPerformance} />

        {data.environmentalImpact.length > 0 && (
          <EnvironmentalImpactChart data={data.environmentalImpact} />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <ValuePerformanceScatter data={data.valueVsPerformance} />
          <TopProjectsList data={data.topProjects} />
        </div>
      </div>
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="h-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
