'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { projectSchema, type ProjectFormData } from '@/shared/lib/validations/project';

export async function createProject(data: ProjectFormData) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

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

    revalidatePath('/');
    revalidatePath('/analytics');

    return { success: true, projectId: project.id };
  } catch (error) {
    console.error('Create project error:', error);
    return { error: 'Failed to create project' };
  }
}

export async function updateProject(id: string, data: ProjectFormData) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

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

    revalidatePath('/');
    revalidatePath(`/project/${id}`);
    revalidatePath('/analytics');

    return { success: true, projectId: project.id };
  } catch (error) {
    console.error('Update project error:', error);
    return { error: 'Failed to update project' };
  }
}

export async function deleteProject(id: string) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    return { error: 'Unauthorized' };
  }

  try {
    await db.project.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/analytics');

    return { success: true };
  } catch (error) {
    console.error('Delete project error:', error);
    return { error: 'Failed to delete project' };
  }
}

export async function toggleFavorite(projectId: string) {
  const session = await auth();

  if (!session) {
    return { error: 'Unauthorized' };
  }

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

    revalidatePath('/');
    revalidatePath(`/project/${projectId}`);
    revalidatePath('/analytics');

    return { success: true, isFavorite: !existing };
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return { error: 'Failed to toggle favorite' };
  }
}
