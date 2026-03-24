'use server';

import { db } from '@/shared/lib/db';
import type {
  AnalyticsFilters,
  GeneralAnalyticsData,
  OrganizationAnalyticsData,
  AnalyticsMetrics,
} from '@/types/analytics';

const CO2_INDICATORS = [
  'CO2eq reduction per year',
  'Percentage CO2eq reduction per year',
];

const RENEWABLE_ENERGY_INDICATORS = [
  'Renewable energy produced per year',
];

const ENERGY_SAVED_INDICATORS = [
  'Energy saved per year',
  'Percentage energy saved per year',
  'Reduction in energy consumption',
];

export async function getGeneralAnalytics(
  filters?: AnalyticsFilters,
  userId?: string
): Promise<GeneralAnalyticsData> {
  const whereClause = buildWhereClause(filters, userId);

  const [
    projects,
    totalProjects,
    uniqueCountries,
    aggregates,
    kpis,
  ] = await Promise.all([
    db.project.findMany({
      where: whereClause,
      include: {
        kpis: true,
      },
    }),
    db.project.count({ where: whereClause }),
    db.project.findMany({
      where: whereClause,
      select: { country: true },
      distinct: ['country'],
    }),
    db.project.aggregate({
      where: whereClause,
      _sum: {
        projectValue: true,
        investmentCosts: true,
      },
    }),
    db.kpi.findMany({
      where: {
        project: whereClause,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            country: true,
            status: true,
            projectValue: true,
            investmentCosts: true,
          },
        },
      },
    }),
  ]);

  const metrics: AnalyticsMetrics = {
    totalProjects,
    totalCountries: uniqueCountries.length,
    totalValue: aggregates._sum.projectValue || 0,
    totalInvestment: aggregates._sum.investmentCosts || 0,
  };

  const projectsByCountry = calculateProjectsByCountry(projects);
  const projectStatus = calculateProjectStatus(projects);
  const investmentByType = calculateInvestmentByType(projects);
  const kpiPerformance = calculateKpiPerformance(kpis);
  const environmentalImpact = calculateEnvironmentalImpact(kpis);
  const valueVsPerformance = calculateValueVsPerformance(projects);
  const topProjects = calculateTopProjects(projects);

  return {
    metrics,
    projectsByCountry,
    projectStatus,
    investmentByType,
    kpiPerformance,
    environmentalImpact,
    valueVsPerformance,
    topProjects,
  };
}

export async function getOrganizationAnalytics(
  organizationId: string
): Promise<OrganizationAnalyticsData> {
  const whereClause = {
    organization: organizationId,
  };

  const [
    projects,
    totalProjects,
    uniqueCountries,
    aggregates,
    kpis,
    organization,
  ] = await Promise.all([
    db.project.findMany({
      where: whereClause,
      include: {
        kpis: true,
      },
    }),
    db.project.count({ where: whereClause }),
    db.project.findMany({
      where: whereClause,
      select: { country: true },
      distinct: ['country'],
    }),
    db.project.aggregate({
      where: whereClause,
      _sum: {
        projectValue: true,
        investmentCosts: true,
      },
    }),
    db.kpi.findMany({
      where: {
        project: whereClause,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            country: true,
            status: true,
            projectValue: true,
            investmentCosts: true,
          },
        },
      },
    }),
    db.configurableField.findFirst({
      where: {
        category: 'ORGANIZATION',
        value: organizationId,
      },
    }),
  ]);

  const metrics: AnalyticsMetrics = {
    totalProjects,
    totalCountries: uniqueCountries.length,
    totalValue: aggregates._sum.projectValue || 0,
    totalInvestment: aggregates._sum.investmentCosts || 0,
  };

  const projectStatus = calculateProjectStatus(projects);
  const investmentByType = calculateInvestmentByType(projects);
  const kpiPerformance = calculateKpiPerformance(kpis);
  const valueVsPerformance = calculateValueVsPerformance(projects);
  const topProjects = calculateTopProjects(projects);

  return {
    organizationId,
    organizationName: organization?.value || organizationId,
    metrics,
    projectStatus,
    investmentByType,
    kpiPerformance,
    valueVsPerformance,
    topProjects,
  };
}

function buildWhereClause(filters?: AnalyticsFilters, userId?: string) {
  const where: any = {};

  if (filters?.country) {
    where.country = filters.country;
  }

  if (filters?.projectType) {
    where.projectType = filters.projectType;
  }

  if (filters?.favoritesOnly && userId) {
    where.favorites = {
      some: {
        userId,
      },
    };
  }

  return where;
}

function calculateProjectsByCountry(projects: any[]) {
  const countryMap = new Map<string, number>();

  projects.forEach((project) => {
    const count = countryMap.get(project.country) || 0;
    countryMap.set(project.country, count + 1);
  });

  return Array.from(countryMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

function calculateProjectStatus(projects: any[]) {
  const statusMap = new Map<string, number>();
  const total = projects.length;

  projects.forEach((project) => {
    const count = statusMap.get(project.status) || 0;
    statusMap.set(project.status, count + 1);
  });

  return Array.from(statusMap.entries())
    .map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateInvestmentByType(projects: any[]) {
  const typeMap = new Map<string, { value: number; count: number }>();

  projects.forEach((project) => {
    const type = project.investmentType || 'Not specified';
    const existing = typeMap.get(type) || { value: 0, count: 0 };
    typeMap.set(type, {
      value: existing.value + (project.investmentCosts || 0),
      count: existing.count + 1,
    });
  });

  return Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      value: data.value,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);
}

function calculateKpiPerformance(kpis: any[]) {
  const indicatorMap = new Map<string, { totalAchieved: number; totalTarget: number; count: number }>();

  kpis.forEach((kpi) => {
    const existing = indicatorMap.get(kpi.indicatorName) || {
      totalAchieved: 0,
      totalTarget: 0,
      count: 0,
    };
    indicatorMap.set(kpi.indicatorName, {
      totalAchieved: existing.totalAchieved + kpi.valueAchieved,
      totalTarget: existing.totalTarget + kpi.targetValue,
      count: existing.count + 1,
    });
  });

  return Array.from(indicatorMap.entries())
    .map(([indicator, data]) => ({
      indicator,
      avgAchievement: data.totalTarget > 0 ? (data.totalAchieved / data.totalTarget) * 100 : 0,
      totalAchieved: data.totalAchieved,
      projectCount: data.count,
    }))
    .sort((a, b) => b.avgAchievement - a.avgAchievement)
    .slice(0, 10);
}

function calculateEnvironmentalImpact(kpis: any[]) {
  const impacts: { metric: string; value: number; unit: string }[] = [];

  const co2Total = kpis
    .filter((kpi) => CO2_INDICATORS.includes(kpi.indicatorName))
    .reduce((sum, kpi) => sum + kpi.valueAchieved, 0);

  if (co2Total > 0) {
    impacts.push({
      metric: 'CO2 Reduction',
      value: co2Total,
      unit: 'tonnes/year',
    });
  }

  const renewableTotal = kpis
    .filter((kpi) => RENEWABLE_ENERGY_INDICATORS.includes(kpi.indicatorName))
    .reduce((sum, kpi) => sum + kpi.valueAchieved, 0);

  if (renewableTotal > 0) {
    impacts.push({
      metric: 'Renewable Energy',
      value: renewableTotal,
      unit: 'MWh/year',
    });
  }

  const energySavedTotal = kpis
    .filter((kpi) => ENERGY_SAVED_INDICATORS.includes(kpi.indicatorName))
    .reduce((sum, kpi) => sum + kpi.valueAchieved, 0);

  if (energySavedTotal > 0) {
    impacts.push({
      metric: 'Energy Saved',
      value: energySavedTotal,
      unit: 'MWh/year',
    });
  }

  return impacts;
}

function calculateValueVsPerformance(projects: any[]) {
  return projects
    .filter((project) => project.kpis && project.kpis.length > 0)
    .map((project) => {
      const avgKpi = project.kpis.reduce((sum: number, kpi: any) => {
        const achievement = kpi.targetValue > 0 ? (kpi.valueAchieved / kpi.targetValue) * 100 : 0;
        return sum + achievement;
      }, 0) / project.kpis.length;

      return {
        projectId: project.id,
        name: project.name,
        value: project.investmentCosts || project.projectValue,
        avgKpi,
        status: project.status,
      };
    })
    .filter((item) => item.value > 0);
}

function calculateTopProjects(projects: any[]) {
  const projectsWithKpis = projects
    .filter((project) => project.kpis && project.kpis.length > 0)
    .map((project) => {
      const avgAchievement = project.kpis.reduce((sum: number, kpi: any) => {
        const achievement = kpi.targetValue > 0 ? (kpi.valueAchieved / kpi.targetValue) * 100 : 0;
        return sum + achievement;
      }, 0) / project.kpis.length;

      return {
        projectId: project.id,
        name: project.name,
        country: project.country,
        kpiCount: project.kpis.length,
        avgAchievement,
      };
    })
    .sort((a, b) => b.avgAchievement - a.avgAchievement)
    .slice(0, 5);

  return projectsWithKpis.map((project, index) => ({
    rank: index + 1,
    ...project,
  }));
}
