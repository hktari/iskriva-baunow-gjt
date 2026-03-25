'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ProjectStatusChart } from '@/shared/components/analytics/project-status-chart';
import { InvestmentByTypeChart } from '@/shared/components/analytics/investment-by-type-chart';
import { KpiPerformanceChart } from '@/shared/components/analytics/kpi-performance-chart';
import { ValuePerformanceScatter } from '@/shared/components/analytics/value-performance-scatter';
import { TopProjectsList } from '@/shared/components/analytics/top-projects-list';
import { getOrganizationAnalytics } from '@/server/actions/analytics';
import { formatCurrency, formatLargeNumber } from '@/shared/lib/formatters';
import {
  getSelectedOrganization,
  setSelectedOrganization,
  getEnabledCharts,
  setEnabledCharts,
} from '@/shared/lib/analytics-storage';
import type {
  OrganizationAnalyticsData,
  OrganizationOption,
  ChartVisibilitySettings,
} from '@/types/analytics';
import { Building2, TrendingUp, Euro, Settings2 } from 'lucide-react';

interface OrganizationAnalyticsClientProps {
  userOrganization?: string;
  organizations: OrganizationOption[];
  initialData?: OrganizationAnalyticsData | null;
}

export function OrganizationAnalyticsClient({
  userOrganization,
  organizations,
  initialData,
}: OrganizationAnalyticsClientProps) {
  const [data, setData] = useState<OrganizationAnalyticsData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [selectedOrg, setSelectedOrg] = useState<string>(() => {
    const storedOrg = getSelectedOrganization();
    return storedOrg || userOrganization || (organizations.length > 0 ? organizations[0].id : '');
  });
  const [chartVisibility, setChartVisibility] = useState<ChartVisibilitySettings>(() =>
    getEnabledCharts()
  );
  const [showSettings, setShowSettings] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedOrg) return;

    setLoading(true);
    try {
      const result = await getOrganizationAnalytics(selectedOrg);
      setData(result);
    } catch (error) {
      console.error('Failed to load organization analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    // Only fetch when selectedOrg changes and it's different from initialData's org
    if (selectedOrg && selectedOrg !== initialData?.organizationId) {
      loadData();
    }
  }, [selectedOrg, initialData, loadData]);

  const handleOrgChange = (orgId: string) => {
    setSelectedOrg(orgId);
    setSelectedOrganization(orgId);
  };

  const handleChartToggle = (chartId: string, enabled: boolean) => {
    const newVisibility = { ...chartVisibility, [chartId]: enabled };
    setChartVisibility(newVisibility);
    setEnabledCharts(newVisibility);
  };

  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">No organizations available</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Failed to load organization analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Selector & Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization</CardTitle>
              <CardDescription>Select an organization to view its analytics</CardDescription>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle chart settings"
            >
              <Settings2 className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-select">Organization</Label>
            <select
              id="org-select"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedOrg}
              onChange={e => handleOrgChange(e.target.value)}
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {showSettings ? (
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-medium text-sm">Chart Visibility</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chart-status"
                    checked={chartVisibility.projectStatus !== false}
                    onCheckedChange={checked =>
                      handleChartToggle('projectStatus', checked as boolean)
                    }
                  />
                  <Label htmlFor="chart-status" className="cursor-pointer text-sm">
                    Project Status Distribution
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chart-investment"
                    checked={chartVisibility.investmentByType !== false}
                    onCheckedChange={checked =>
                      handleChartToggle('investmentByType', checked as boolean)
                    }
                  />
                  <Label htmlFor="chart-investment" className="cursor-pointer text-sm">
                    Investment by Project Type
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chart-kpi"
                    checked={chartVisibility.kpiPerformance !== false}
                    onCheckedChange={checked =>
                      handleChartToggle('kpiPerformance', checked as boolean)
                    }
                  />
                  <Label htmlFor="chart-kpi" className="cursor-pointer text-sm">
                    KPI Performance
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chart-value"
                    checked={chartVisibility.valueVsPerformance !== false}
                    onCheckedChange={checked =>
                      handleChartToggle('valueVsPerformance', checked as boolean)
                    }
                  />
                  <Label htmlFor="chart-value" className="cursor-pointer text-sm">
                    Value vs Performance
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="chart-top"
                    checked={chartVisibility.topProjects !== false}
                    onCheckedChange={checked =>
                      handleChartToggle('topProjects', checked as boolean)
                    }
                  />
                  <Label htmlFor="chart-top" className="cursor-pointer text-sm">
                    Top Performing Projects
                  </Label>
                </div>
              </div>
            </div>
          ) : null}
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
              Across {data.metrics.totalCountries}{' '}
              {data.metrics.totalCountries === 1 ? 'country' : 'countries'}
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
        {chartVisibility.projectStatus !== false && (
          <ProjectStatusChart data={data.projectStatus} />
        )}

        {chartVisibility.investmentByType !== false && (
          <InvestmentByTypeChart data={data.investmentByType} />
        )}

        {chartVisibility.kpiPerformance !== false && (
          <KpiPerformanceChart data={data.kpiPerformance} />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {chartVisibility.valueVsPerformance !== false && (
            <ValuePerformanceScatter data={data.valueVsPerformance} />
          )}

          {chartVisibility.topProjects !== false && <TopProjectsList data={data.topProjects} />}
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
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
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
