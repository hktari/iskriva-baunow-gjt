'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { FieldCategory } from '@prisma/client';

export async function createField(category: FieldCategory, value: string) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

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
        },
      },
    });

    revalidatePath('/fields');

    return { success: true, fieldId: field.id };
  } catch (error) {
    console.error('Create field error:', error);
    return { error: 'Failed to create field' };
  }
}

export async function updateField(id: string, value: string) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  try {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return { error: 'Value cannot be empty' };
    }

    const field = await db.configurableField.update({
      where: { id },
      data: { value: trimmedValue },
    });

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
        },
      },
    });

    revalidatePath('/fields');

    return { success: true };
  } catch (error) {
    console.error('Update field error:', error);
    return { error: 'Failed to update field' };
  }
}

export async function deleteField(id: string) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

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
        },
      },
    });

    revalidatePath('/fields');

    return { success: true };
  } catch (error) {
    console.error('Delete field error:', error);
    return { error: 'Failed to delete field' };
  }
}
