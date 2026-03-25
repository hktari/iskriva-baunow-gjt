import { cache } from 'react';
import { db } from '@/shared/lib/db';

export interface ProjectFilters {
  search?: string;
  country?: string;
  projectType?: string;
  investmentType?: string;
  status?: string;
  organization?: string;
  minValue?: number;
  maxValue?: number;
  favoritesOnly?: boolean;
  userId?: string;
}

export const getProjects = cache(async (filters?: ProjectFilters) => {
  const where: any = {};

  if (filters?.search) {
    where.name = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  if (filters?.country) {
    where.country = filters.country;
  }

  if (filters?.projectType) {
    where.projectType = filters.projectType;
  }

  if (filters?.investmentType) {
    where.investmentType = filters.investmentType;
  }

  if (filters?.status) {
    where.status = filters.status as any;
  }

  if (filters?.organization) {
    where.organization = filters.organization;
  }

  if (filters?.minValue !== undefined || filters?.maxValue !== undefined) {
    where.projectValue = {};
    if (filters.minValue !== undefined) {
      where.projectValue.gte = filters.minValue;
    }
    if (filters.maxValue !== undefined) {
      where.projectValue.lte = filters.maxValue;
    }
  }

  if (filters?.favoritesOnly && filters?.userId) {
    where.favorites = {
      some: {
        userId: filters.userId,
      },
    };
  }

  const projects = await db.project.findMany({
    where,
    include: {
      kpis: {
        where: { isPrimary: true },
      },
      favorites: filters?.userId
        ? {
            where: { userId: filters.userId },
          }
        : false,
      _count: {
        select: {
          kpis: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return projects;
});

export const getProject = cache(async (id: string, userId?: string) => {
  const project = await db.project.findUnique({
    where: { id },
    include: {
      kpis: {
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
      favorites: userId
        ? {
            where: { userId },
          }
        : false,
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return project;
});

export const getConfigurableFields = cache(async () => {
  const fields = await db.configurableField.findMany({
    orderBy: { value: 'asc' },
  });

  const grouped = fields.reduce(
    (acc: Record<string, string[]>, field: { category: string; value: string }) => {
      if (!acc[field.category]) {
        acc[field.category] = [];
      }
      acc[field.category].push(field.value);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return grouped;
});
