'use server';

import { auth } from '@/server/auth';
import { captureError } from '@/shared/lib/capture-error';
import { db } from '@/shared/lib/db';
import { createChildLogger } from '@/shared/lib/logger';
import { createObservabilityContext, extractUserId } from '@/shared/lib/observability-context';
import { projectSchema, type ProjectFormData } from '@/shared/lib/validations/project';
import { revalidatePath } from 'next/cache';

export async function createProject(data: ProjectFormData) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'projects',
    action: 'createProject',
    userId: extractUserId(session),
  });
  const logger = createChildLogger(context);

  try {
    const validated = projectSchema.parse(data);

    const project = await db.project.create({
      data: {
        ...validated,
        createdById: session.user.id,
        targetGroup: validated.targetGroup || [],
        impact: validated.impact || [],
      },
    });

    logger.info(
      { entityId: project.id, entityType: 'Project', projectName: project.name },
      'Project created successfully'
    );

    revalidatePath('/');
    revalidatePath('/analytics');

    return { success: true, projectId: project.id };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'create-project-failed',
      severity: 'error',
      extra: { projectName: data.name },
    });
    return { error: 'Failed to create project' };
  }
}

export async function updateProject(id: string, data: ProjectFormData) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'projects',
    action: 'updateProject',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'Project',
  });
  const logger = createChildLogger(context);

  try {
    const validated = projectSchema.parse(data);

    const project = await db.project.update({
      where: { id },
      data: {
        ...validated,
        lastEdited: new Date(),
        targetGroup: validated.targetGroup || [],
        impact: validated.impact || [],
      },
    });

    logger.info({ projectName: project.name }, 'Project updated successfully');

    revalidatePath('/');
    revalidatePath(`/project/${id}`);
    revalidatePath('/analytics');

    return { success: true, projectId: project.id };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'update-project-failed',
      severity: 'error',
    });
    return { error: 'Failed to update project' };
  }
}

export async function deleteProject(id: string) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'projects',
    action: 'deleteProject',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'Project',
  });
  const logger = createChildLogger(context);

  try {
    if (session.user.role !== 'SUPER_USER') {
      const project = await db.project.findUnique({
        where: { id },
        select: { createdById: true },
      });
      if (!project || project.createdById !== session.user.id) {
        return { error: 'Unauthorized' };
      }
    }

    await db.project.delete({
      where: { id },
    });

    logger.info('Project deleted successfully');

    revalidatePath('/');
    revalidatePath('/analytics');

    return { success: true };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'delete-project-failed',
      severity: 'error',
    });
    return { error: 'Failed to delete project' };
  }
}

export async function toggleFavorite(projectId: string) {
  const session = await auth();

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'projects',
    action: 'toggleFavorite',
    userId: extractUserId(session),
    entityId: projectId,
    entityType: 'Project',
  });
  const logger = createChildLogger(context);

  try {
    const existing = await db.favorite.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId,
        },
      },
    });

    if (existing) {
      await db.favorite.delete({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId,
          },
        },
      });
    } else {
      await db.favorite.create({
        data: {
          userId: session.user.id,
          projectId,
        },
      });
    }

    logger.info({ isFavorite: !existing }, 'Favorite toggled successfully');

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true, isFavorite: !existing };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'toggle-favorite-failed',
      severity: 'error',
    });
    return { error: 'Failed to toggle favorite' };
  }
}
