export interface AnalyticsFilters {
  country?: string;
  projectType?: string;
  favoritesOnly?: boolean;
}

export interface AnalyticsMetrics {
  totalProjects: number;
  totalCountries: number;
  totalValue: number;
  totalInvestment: number;
}

export interface ProjectsByCountry {
  country: string;
  count: number;
}

export interface ProjectStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface InvestmentByType {
  type: string;
  value: number;
  count: number;
}

export interface KpiPerformanceData {
  indicator: string;
  avgAchievement: number;
  totalAchieved: number;
  projectCount: number;
}

export interface EnvironmentalImpactData {
  metric: string;
  value: number;
  unit: string;
}

export interface ValueVsPerformanceData {
  projectId: string;
  name: string;
  value: number;
  avgKpi: number;
  status: string;
}

export interface TopProject {
  rank: number;
  projectId: string;
  name: string;
  country: string;
  kpiCount: number;
  avgAchievement: number;
}

export interface GeneralAnalyticsData {
  metrics: AnalyticsMetrics;
  projectsByCountry: ProjectsByCountry[];
  projectStatus: ProjectStatusData[];
  investmentByType: InvestmentByType[];
  kpiPerformance: KpiPerformanceData[];
  environmentalImpact: EnvironmentalImpactData[];
  valueVsPerformance: ValueVsPerformanceData[];
  topProjects: TopProject[];
}

export interface OrganizationAnalyticsData {
  organizationId: string;
  organizationName: string;
  metrics: AnalyticsMetrics;
  projectStatus: ProjectStatusData[];
  investmentByType: InvestmentByType[];
  kpiPerformance: KpiPerformanceData[];
  valueVsPerformance: ValueVsPerformanceData[];
  topProjects: TopProject[];
}

export interface OrganizationOption {
  id: string;
  name: string;
}

export type ChartId = 
  | 'projectStatus'
  | 'investmentByType'
  | 'kpiPerformance'
  | 'valueVsPerformance'
  | 'topProjects';

export interface ChartVisibilitySettings {
  [key: string]: boolean;
}
