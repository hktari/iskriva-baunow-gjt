'use server';

import { auth } from '@/server/auth';
import { captureError } from '@/shared/lib/capture-error';
import { db } from '@/shared/lib/db';
import { createChildLogger } from '@/shared/lib/logger';
import { createObservabilityContext, extractUserId } from '@/shared/lib/observability-context';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/shared/lib/validations/password';
import bcrypt from 'bcryptjs';

export async function changePassword(data: ChangePasswordFormData) {
  const session = await auth();

  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'profile',
    action: 'changePassword',
    userId: extractUserId(session),
  });
  const logger = createChildLogger(context);

  try {
    const validated = changePasswordSchema.parse(data);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true, email: true },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    const isValidPassword = await bcrypt.compare(validated.currentPassword, user.password);

    if (!isValidPassword) {
      return { error: 'Current password is incorrect' };
    }

    const hashedPassword = await bcrypt.hash(validated.newPassword, 10);

    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    logger.info('Password changed successfully');

    await db.auditLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        entityType: 'User',
        entityId: session.user.id,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          requestId: context.requestId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'change-password-failed',
      severity: 'error',
    });
    return { error: 'Failed to change password' };
  }
}
