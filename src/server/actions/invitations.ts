'use server';

import { UserRole, UserStatus } from '@/generated/prisma/client';
import { auth } from '@/server/auth';
import {
  EmailConfigurationError,
  resendInvitationEmail,
  sendInvitationEmail,
} from '@/server/lib/email';
import { captureError } from '@/shared/lib/capture-error';
import { db } from '@/shared/lib/db';
import { createChildLogger } from '@/shared/lib/logger';
import { createObservabilityContext, extractUserId } from '@/shared/lib/observability-context';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

const isDemoEnvironment = process.env.NODE_ENV !== 'production';
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const defaultLoginUrl = `${appBaseUrl.replace(/\/$/, '')}/login`;

type InvitationSuccessResponse = {
  success: true;
  userId: string;
  message: string;
  emailStatus: 'sent' | 'skipped' | 'failed';
  demoCredentials?: {
    email: string;
    tempPassword: string;
  };
};

type InvitationErrorResponse = {
  error: string;
};

export async function inviteUser(
  email: string,
  name: string,
  role: UserRole
): Promise<InvitationSuccessResponse | InvitationErrorResponse> {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'invitations',
    action: 'inviteUser',
    userId: extractUserId(session),
  });
  const logger = createChildLogger(context);

  try {
    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: 'User with this email already exists' };
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user with PENDING status
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        status: UserStatus.PENDING,
        invitedBy: session.user.id,
      },
    });

    logger.info({ entityId: user.id, entityType: 'User', role }, 'User invited successfully');

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'USER_INVITED',
        entityType: 'User',
        entityId: user.id,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          invitedUserEmail: email,
          invitedUserName: name,
          role,
          requestId: context.requestId,
        },
      },
    });

    // Send invitation email via Resend
    let emailStatus: InvitationSuccessResponse['emailStatus'] = 'skipped';
    try {
      await sendInvitationEmail({
        to: email,
        userName: name,
        tempPassword,
        loginUrl: defaultLoginUrl,
      });
      emailStatus = 'sent';
    } catch (emailError) {
      if (emailError instanceof EmailConfigurationError) {
        emailStatus = 'skipped';
        logger.warn(
          { scope: 'resend.invitation', reason: emailError.message },
          'Resend configuration missing, invitation email skipped'
        );
      } else {
        emailStatus = 'failed';
        logger.error(
          {
            scope: 'resend.invitation',
            error: emailError instanceof Error ? emailError.message : emailError,
          },
          'Failed to send invitation email'
        );
      }
    }

    revalidatePath('/users');

    return {
      success: true,
      userId: user.id,
      emailStatus,
      message:
        emailStatus === 'sent'
          ? 'User invited successfully. Invitation email sent via Resend.'
          : emailStatus === 'failed'
            ? 'User invited, but the email could not be delivered automatically. Please resend later.'
            : 'User invited successfully. Email notifications are currently disabled.',
      demoCredentials: isDemoEnvironment
        ? {
            email,
            tempPassword,
          }
        : undefined,
    };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'invite-user-failed',
      severity: 'error',
      tags: { role },
      extra: { email, name },
    });
    return { error: 'Failed to invite user' };
  }
}

export async function resendInvitation(
  userId: string
): Promise<InvitationSuccessResponse | InvitationErrorResponse> {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  const context = await createObservabilityContext({
    scope: 'invitations',
    action: 'resendInvitation',
    userId: extractUserId(session),
    entityId: userId,
    entityType: 'User',
  });
  const logger = createChildLogger(context);

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    if (user.status !== UserStatus.PENDING) {
      return { error: 'User is not in pending status' };
    }

    // Generate new temporary password
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info({ userEmail: user.email }, 'Invitation resent successfully');

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'INVITATION_RESENT',
        entityType: 'User',
        entityId: userId,
        userId: session.user.id,
        userEmail: session.user.email,
        metadata: {
          userEmail: user.email,
          requestId: context.requestId,
        },
      },
    });

    // Send new invitation email via Resend
    let emailStatus: InvitationSuccessResponse['emailStatus'] = 'skipped';
    try {
      await resendInvitationEmail({
        to: user.email,
        userName: user.name || 'User',
        tempPassword,
        loginUrl: defaultLoginUrl,
      });
      emailStatus = 'sent';
    } catch (emailError) {
      if (emailError instanceof EmailConfigurationError) {
        emailStatus = 'skipped';
        logger.warn(
          { scope: 'resend.invitation', reason: emailError.message },
          'Resend configuration missing, invitation email skipped'
        );
      } else {
        emailStatus = 'failed';
        logger.error(
          {
            scope: 'resend.invitation',
            error: emailError instanceof Error ? emailError.message : emailError,
          },
          'Failed to resend invitation email'
        );
      }
    }

    return {
      success: true,
      userId: user.id,
      emailStatus,
      message:
        emailStatus === 'sent'
          ? 'Invitation resent successfully via Resend.'
          : emailStatus === 'failed'
            ? 'Invitation resent but email delivery failed - please check logs.'
            : 'Invitation resent. Email notifications are currently disabled.',
      demoCredentials: isDemoEnvironment
        ? {
            email: user.email,
            tempPassword,
          }
        : undefined,
    };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'resend-invitation-failed',
      severity: 'error',
    });
    return { error: 'Failed to resend invitation' };
  }
}

export async function acceptInvitation(userId: string, newPassword: string) {
  const context = await createObservabilityContext({
    scope: 'invitations',
    action: 'acceptInvitation',
    entityId: userId,
    entityType: 'User',
  });
  const logger = createChildLogger(context);

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    if (user.status !== UserStatus.PENDING) {
      return { error: 'Invitation already accepted or invalid' };
    }

    // Update password and activate user
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        status: UserStatus.ACTIVE,
      },
    });

    logger.info({ userEmail: user.email }, 'Invitation accepted successfully');

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'INVITATION_ACCEPTED',
        entityType: 'User',
        entityId: userId,
        userId: userId,
        userEmail: user.email,
        metadata: {
          userEmail: user.email,
          requestId: context.requestId,
        },
      },
    });

    return { success: true, message: 'Invitation accepted successfully' };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'accept-invitation-failed',
      severity: 'error',
    });
    return { error: 'Failed to accept invitation' };
  }
}
