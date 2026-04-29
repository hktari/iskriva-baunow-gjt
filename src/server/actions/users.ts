'use server';

import { UserStatus } from '@/generated/prisma/client';
import { auth } from '@/server/auth';
import { captureError } from '@/shared/lib/capture-error';
import { db } from '@/shared/lib/db';
import { createChildLogger } from '@/shared/lib/logger';
import { createObservabilityContext, extractUserId } from '@/shared/lib/observability-context';
import { userSchema, type UserFormData } from '@/shared/lib/validations/user';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function createUser(data: UserFormData) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'users',
    action: 'createUser',
    userId: extractUserId(session),
  });
  const logger = createChildLogger(context);

  try {
    const validated = userSchema.parse(data);

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return { error: 'User with this email already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await db.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        password: hashedPassword,
        role: validated.role,
        organization: validated.organization,
        status: UserStatus.ACTIVE,
        invitedBy: session.user.id,
      },
    });

    logger.info(
      { entityId: user.id, entityType: 'User', role: user.role },
      'User created successfully'
    );

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: user.id,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          userName: user.name,
          userEmail: user.email,
          role: user.role,
          requestId: context.requestId,
        },
      },
    });

    revalidatePath('/users');

    return { success: true, userId: user.id };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'create-user-failed',
      severity: 'error',
      extra: { email: data.email, role: data.role },
    });
    return { error: 'Failed to create user' };
  }
}

export async function updateUser(id: string, data: Partial<UserFormData>) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'users',
    action: 'updateUser',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'User',
  });
  const logger = createChildLogger(context);

  try {
    const updateData: any = {
      name: data.name,
      role: data.role,
      organization: data.organization,
      status: data.status,
    };

    // Only update password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    logger.info({ userEmail: user.email }, 'User updated successfully');

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'USER_UPDATED',
        entityType: 'User',
        entityId: user.id,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          userName: user.name,
          userEmail: user.email,
          changes: data,
          requestId: context.requestId,
        },
      },
    });

    revalidatePath('/users');

    return { success: true, userId: user.id };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'update-user-failed',
      severity: 'error',
    });
    return { error: 'Failed to update user' };
  }
}

export async function deleteUser(id: string) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  // Prevent deleting yourself
  if (id === session.user.id) {
    return { error: 'Cannot delete your own account' };
  }

  const context = await createObservabilityContext({
    scope: 'users',
    action: 'deleteUser',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'User',
  });
  const logger = createChildLogger(context);

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { email: true, name: true, role: true },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Prevent deleting super users - last line of defense against admin lockout
    if (user.role === 'SUPER_USER') {
      return { error: 'Cannot delete a super user account' };
    }

    await db.user.delete({
      where: { id },
    });

    logger.info({ deletedUserEmail: user.email }, 'User deleted successfully');

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: id,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          deletedUserName: user.name,
          deletedUserEmail: user.email,
          requestId: context.requestId,
        },
      },
    });

    revalidatePath('/users');

    return { success: true };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'delete-user-failed',
      severity: 'error',
    });
    return { error: 'Failed to delete user' };
  }
}

export async function updateUserStatus(id: string, status: UserStatus) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'users',
    action: 'updateUserStatus',
    userId: extractUserId(session),
    entityId: id,
    entityType: 'User',
  });
  const logger = createChildLogger(context);

  try {
    const user = await db.user.update({
      where: { id },
      data: { status },
    });

    logger.info({ newStatus: status }, 'User status updated successfully');

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'USER_STATUS_CHANGED',
        entityType: 'User',
        entityId: user.id,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          userName: user.name,
          newStatus: status,
          requestId: context.requestId,
        },
      },
    });

    revalidatePath('/users');

    return { success: true };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'update-user-status-failed',
      severity: 'error',
      extra: { status },
    });
    return { error: 'Failed to update user status' };
  }
}
