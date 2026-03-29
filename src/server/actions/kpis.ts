'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { kpiSchema, type KpiFormData } from '@/shared/lib/validations/project';
import { createChildLogger } from '@/shared/lib/logger';
import { captureError } from '@/shared/lib/capture-error';
import { createObservabilityContext, extractUserId } from '@/shared/lib/observability-context';

export async function createKpi(projectId: string, data: KpiFormData) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'kpis',
    action: 'createKpi',
    userId: extractUserId(session),
    entityId: projectId,
    entityType: 'Project',
  });
  const logger = createChildLogger(context);

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

    logger.info(
      { kpiId: kpi.id, kpiName: kpi.indicatorName, isPrimary: kpi.isPrimary },
      'KPI created successfully'
    );

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true, kpiId: kpi.id };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'create-kpi-failed',
      severity: 'error',
      extra: { kpiName: data.indicatorName },
    });
    return { error: 'Failed to create KPI' };
  }
}

export async function updateKpi(id: string, projectId: string, data: KpiFormData) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'kpis',
    action: 'updateKpi',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'Kpi',
  });
  const logger = createChildLogger(context);

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

    logger.info(
      { kpiName: kpi.indicatorName, isPrimary: kpi.isPrimary },
      'KPI updated successfully'
    );

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true, kpiId: kpi.id };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'update-kpi-failed',
      severity: 'error',
    });
    return { error: 'Failed to update KPI' };
  }
}

export async function deleteKpi(id: string, projectId: string) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'kpis',
    action: 'deleteKpi',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'Kpi',
  });
  const logger = createChildLogger(context);

  try {
    await db.kpi.delete({
      where: { id },
    });

    logger.info('KPI deleted successfully');

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'delete-kpi-failed',
      severity: 'error',
    });
    return { error: 'Failed to delete KPI' };
  }
}

export async function setPrimaryKpi(id: string, projectId: string) {
  const session = await auth();

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'kpis',
    action: 'setPrimaryKpi',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'Kpi',
  });
  const logger = createChildLogger(context);

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

    logger.info({ isPrimary: newPrimaryState }, 'Primary KPI status updated successfully');

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true, isPrimary: newPrimaryState };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'set-primary-kpi-failed',
      severity: 'error',
    });
    return { error: 'Failed to set primary KPI' };
  }
}
