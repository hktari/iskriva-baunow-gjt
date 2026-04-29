'use server';

import { FieldCategory } from '@/generated/prisma/client';
import { auth } from '@/server/auth';
import { captureError } from '@/shared/lib/capture-error';
import { db } from '@/shared/lib/db';
import { createChildLogger } from '@/shared/lib/logger';
import { createObservabilityContext, extractUserId } from '@/shared/lib/observability-context';
import { revalidatePath } from 'next/cache';

export async function createField(category: FieldCategory, value: string) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'fields',
    action: 'createField',
    userId: extractUserId(session),
  });
  const logger = createChildLogger(context);

  try {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return { error: 'Value cannot be empty' };
    }

    // Check if field already exists
    const existing = await db.configurableField.findUnique({
      where: {
        category_value: {
          category,
          value: trimmedValue,
        },
      },
    });

    if (existing) {
      return { error: 'This value already exists' };
    }

    const field = await db.configurableField.create({
      data: {
        category,
        value: trimmedValue,
      },
    });

    logger.info(
      { entityId: field.id, entityType: 'ConfigurableField', category, value: trimmedValue },
      'Field created successfully'
    );

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'FIELD_CREATED',
        entityType: 'ConfigurableField',
        entityId: field.id,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          category,
          value: trimmedValue,
          requestId: context.requestId,
        },
      },
    });

    revalidatePath('/fields');

    return { success: true, fieldId: field.id };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'create-field-failed',
      severity: 'error',
      extra: { category, value },
    });
    return { error: 'Failed to create field' };
  }
}

export async function updateField(id: string, value: string) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'fields',
    action: 'updateField',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'ConfigurableField',
  });
  const logger = createChildLogger(context);

  try {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return { error: 'Value cannot be empty' };
    }

    const field = await db.configurableField.update({
      where: { id },
      data: { value: trimmedValue },
    });

    logger.info({ category: field.category, newValue: trimmedValue }, 'Field updated successfully');

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'FIELD_UPDATED',
        entityType: 'ConfigurableField',
        entityId: field.id,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          category: field.category,
          newValue: trimmedValue,
          requestId: context.requestId,
        },
      },
    });

    revalidatePath('/fields');

    return { success: true };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'update-field-failed',
      severity: 'error',
      extra: { value },
    });
    return { error: 'Failed to update field' };
  }
}

export async function deleteField(id: string) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'fields',
    action: 'deleteField',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'ConfigurableField',
  });
  const logger = createChildLogger(context);

  try {
    const field = await db.configurableField.findUnique({
      where: { id },
    });

    if (!field) {
      return { error: 'Field not found' };
    }

    await db.configurableField.delete({
      where: { id },
    });

    logger.info({ category: field.category, value: field.value }, 'Field deleted successfully');

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'FIELD_DELETED',
        entityType: 'ConfigurableField',
        entityId: id,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          category: field.category,
          value: field.value,
          requestId: context.requestId,
        },
      },
    });

    revalidatePath('/fields');

    return { success: true };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'delete-field-failed',
      severity: 'error',
    });
    return { error: 'Failed to delete field' };
  }
}
