import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export const getAuditLogs = cache(async (filters?: AuditLogFilters, limit = 100) => {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    redirect('/');
  }

  const where: any = {};

  if (filters?.action) {
    where.action = filters.action;
  }

  if (filters?.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters?.userId) {
    where.userId = filters.userId;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  if (filters?.search) {
    where.OR = [
      { userEmail: { contains: filters.search, mode: 'insensitive' } },
      { action: { contains: filters.search, mode: 'insensitive' } },
      { entityType: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return db.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
});

export const getAuditLogStats = cache(async () => {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    redirect('/');
  }

  const [total, last24h, last7d, byAction] = await Promise.all([
    db.auditLog.count(),
    db.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    db.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    db.auditLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
      take: 10,
    }),
  ]);

  return {
    total,
    last24h,
    last7d,
    topActions: byAction.map(a => ({ action: a.action, count: a._count })),
  };
});

export const getAuditLogsByEntity = cache(async (entityType: string, entityId: string) => {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    redirect('/');
  }

  return db.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
});
