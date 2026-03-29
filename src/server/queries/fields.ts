import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { FieldCategory } from '@prisma/client';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export const getFieldsByCategory = cache(async (category: FieldCategory) => {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    redirect('/');
  }

  return db.configurableField.findMany({
    where: { category },
    orderBy: { value: 'asc' },
  });
});

export const getAllFields = cache(async () => {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    redirect('/');
  }

  const fields = await db.configurableField.findMany({
    orderBy: [{ category: 'asc' }, { value: 'asc' }],
  });

  // Group by category
  const grouped = fields.reduce(
    (acc, field) => {
      if (!acc[field.category]) {
        acc[field.category] = [];
      }
      acc[field.category].push(field);
      return acc;
    },
    {} as Record<FieldCategory, typeof fields>
  );

  return grouped;
});

export const getFieldStats = cache(async () => {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    redirect('/');
  }

  const stats = await db.configurableField.groupBy({
    by: ['category'],
    _count: true,
  });

  return stats.map(s => ({
    category: s.category,
    count: s._count,
  }));
});
