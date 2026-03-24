'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { kpiSchema, type KpiFormData } from '@/shared/lib/validations/project';

export async function createKpi(projectId: string, data: KpiFormData) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  try {
    const validated = kpiSchema.parse(data);

    if (validated.isPrimary) {
      await db.kpi.updateMany({
        where: { projectId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const kpi = await db.kpi.create({
      data: {
        ...validated,
        projectId,
      },
    });

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true, kpiId: kpi.id };
  } catch (error) {
    console.error('Create KPI error:', error);
    return { error: 'Failed to create KPI' };
  }
}

export async function updateKpi(id: string, projectId: string, data: KpiFormData) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  try {
    const validated = kpiSchema.parse(data);

    if (validated.isPrimary) {
      await db.kpi.updateMany({
        where: { projectId, isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const kpi = await db.kpi.update({
      where: { id },
      data: validated,
    });

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true, kpiId: kpi.id };
  } catch (error) {
    console.error('Update KPI error:', error);
    return { error: 'Failed to update KPI' };
  }
}

export async function deleteKpi(id: string, projectId: string) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  try {
    await db.kpi.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true };
  } catch (error) {
    console.error('Delete KPI error:', error);
    return { error: 'Failed to delete KPI' };
  }
}

export async function setPrimaryKpi(id: string, projectId: string) {
  const session = await auth();

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    const currentKpi = await db.kpi.findUnique({
      where: { id },
      select: { isPrimary: true },
    });

    if (!currentKpi) {
      return { error: 'KPI not found' };
    }

    const newPrimaryState = !currentKpi.isPrimary;

    await db.kpi.updateMany({
      where: { projectId, isPrimary: true },
      data: { isPrimary: false },
    });

    if (newPrimaryState) {
      await db.kpi.update({
        where: { id },
        data: { isPrimary: true },
      });
    }

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true, isPrimary: newPrimaryState };
  } catch (error) {
    console.error('Set primary KPI error:', error);
    return { error: 'Failed to set primary KPI' };
  }
}
