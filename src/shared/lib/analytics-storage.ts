import type { ChartVisibilitySettings } from '@/types/analytics';

const STORAGE_KEYS = {
  SELECTED_ORGANIZATION: 'analytics_org',
  ENABLED_CHARTS: 'analytics_org_charts',
} as const;

const DEFAULT_CHART_VISIBILITY: ChartVisibilitySettings = {
  projectStatus: true,
  investmentByType: true,
  kpiPerformance: true,
  valueVsPerformance: true,
  topProjects: true,
};

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function getSelectedOrganization(): string | null {
  if (!isClient()) return null;
  
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_ORGANIZATION);
  } catch (error) {
    console.error('Failed to read selected organization from localStorage:', error);
    return null;
  }
}

export function setSelectedOrganization(organizationId: string): void {
  if (!isClient()) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_ORGANIZATION, organizationId);
  } catch (error) {
    console.error('Failed to save selected organization to localStorage:', error);
  }
}

export function getEnabledCharts(): ChartVisibilitySettings {
  if (!isClient()) return DEFAULT_CHART_VISIBILITY;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ENABLED_CHARTS);
    if (!stored) return DEFAULT_CHART_VISIBILITY;
    
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_CHART_VISIBILITY, ...parsed };
  } catch (error) {
    console.error('Failed to read enabled charts from localStorage:', error);
    return DEFAULT_CHART_VISIBILITY;
  }
}

export function setEnabledCharts(settings: ChartVisibilitySettings): void {
  if (!isClient()) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.ENABLED_CHARTS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save enabled charts to localStorage:', error);
  }
}

export function clearAnalyticsStorage(): void {
  if (!isClient()) return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ORGANIZATION);
    localStorage.removeItem(STORAGE_KEYS.ENABLED_CHARTS);
  } catch (error) {
    console.error('Failed to clear analytics storage:', error);
  }
}
