import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const getUsers = cache(async () => {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    redirect('/');
  }

  return db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organization: true,
      status: true,
      invitedAt: true,
      createdAt: true,
      _count: {
        select: {
          projects: true,
          favorites: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
});

export const getUser = cache(async (id: string) => {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    redirect('/');
  }

  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organization: true,
      status: true,
      invitedAt: true,
      invitedBy: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          projects: true,
          favorites: true,
          auditLogs: true,
        },
      },
    },
  });
});

export const getUserStats = cache(async () => {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    redirect('/');
  }

  const [total, active, pending, inactive, byRole] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: 'ACTIVE' } }),
    db.user.count({ where: { status: 'PENDING' } }),
    db.user.count({ where: { status: 'INACTIVE' } }),
    db.user.groupBy({
      by: ['role'],
      _count: true,
    }),
  ]);

  return {
    total,
    active,
    pending,
    inactive,
    byRole: byRole.map(r => ({ role: r.role, count: r._count })),
  };
});
