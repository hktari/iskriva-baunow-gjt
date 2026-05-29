'use server';

import { auth } from '@/server/auth';
import {
  EmailConfigurationError,
  sendMagicLinkEmail,
  sendPasswordResetEmail,
} from '@/server/lib/email';
import { captureError } from '@/shared/lib/capture-error';
import { db } from '@/shared/lib/db';
import { createChildLogger } from '@/shared/lib/logger';
import { createObservabilityContext, extractUserId } from '@/shared/lib/observability-context';
import { UserRole, UserStatus } from '@prisma/enums';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TOKEN_EXPIRY_HOURS = 48;

// Helper function to create password reset token
async function createPasswordResetToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expires = new Date();
  expires.setHours(expires.getHours() + TOKEN_EXPIRY_HOURS);

  await db.passwordResetToken.create({
    data: {
      tokenHash,
      userId,
      expires,
    },
  });

  return rawToken;
}

// Helper function to build magic link URL
function buildMagicLinkUrl(token: string): string {
  return `${appBaseUrl.replace(/\/$/, '')}/set-password?token=${token}`;
}

type InvitationSuccessResponse = {
  success: true;
  userId: string;
  message: string;
  emailStatus: 'sent' | 'skipped' | 'failed';
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

    // Create user with PENDING status (no password yet — set via reset link)
    const user = await db.user.create({
      data: {
        email,
        name,
        password: '',
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

    // Create magic link token and send email
    let emailStatus: InvitationSuccessResponse['emailStatus'] = 'skipped';
    try {
      const rawToken = await createPasswordResetToken(user.id);
      const magicLinkUrl = buildMagicLinkUrl(rawToken);

      await sendMagicLinkEmail({
        to: email,
        userName: name,
        magicLinkUrl,
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

    // Create new magic link token and send email
    let emailStatus: InvitationSuccessResponse['emailStatus'] = 'skipped';
    try {
      const rawToken = await createPasswordResetToken(user.id);
      const magicLinkUrl = buildMagicLinkUrl(rawToken);

      await sendMagicLinkEmail({
        to: user.email,
        userName: user.name || 'User',
        magicLinkUrl,
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

export async function validatePasswordResetToken(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetToken) {
    return { valid: false, error: 'Invalid token' };
  }

  if (resetToken.used) {
    return { valid: false, error: 'Token has already been used' };
  }

  if (new Date() > resetToken.expires) {
    return { valid: false, error: 'Token has expired' };
  }

  return {
    valid: true,
    userId: resetToken.userId,
    email: resetToken.user.email,
  };
}

export async function setPasswordWithToken(token: string, newPassword: string) {
  const context = await createObservabilityContext({
    scope: 'invitations',
    action: 'setPasswordWithToken',
    entityType: 'User',
  });
  const logger = createChildLogger(context);

  try {
    // Validate token first
    const validation = await validatePasswordResetToken(token);
    if (!validation.valid) {
      return { error: validation.error };
    }

    const { userId, email } = validation;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password only — status is promoted to ACTIVE on first successful login
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await db.passwordResetToken.update({
      where: { tokenHash },
      data: { used: true },
    });

    logger.info(
      { userEmail: email },
      'Password set via token; user will be activated on first login'
    );

    // Log audit
    await db.auditLog.create({
      data: {
        action: 'INVITATION_ACCEPTED',
        entityType: 'User',
        entityId: userId,
        userId: userId,
        userEmail: email,
        metadata: {
          userEmail: email,
          method: 'magic_link',
          requestId: context.requestId,
        },
      },
    });

    return { success: true, message: 'Password set successfully. You can now log in.' };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'set-password-with-token-failed',
      severity: 'error',
    });
    return { error: 'Failed to set password' };
  }
}

export async function requestPasswordReset(
  email: string
): Promise<{ success: true; message: string } | { error: string }> {
  const context = await createObservabilityContext({
    scope: 'invitations',
    action: 'requestPasswordReset',
  });
  const logger = createChildLogger(context);

  try {
    const user = await db.user.findUnique({ where: { email } });

    // Always return success to avoid email enumeration
    if (!user || user.status === UserStatus.INACTIVE) {
      return { success: true, message: 'If that email exists, a reset link has been sent.' };
    }

    const rawToken = await createPasswordResetToken(user.id);
    const resetUrl = buildMagicLinkUrl(rawToken);

    try {
      await sendPasswordResetEmail({
        to: user.email,
        userName: user.name || 'User',
        resetUrl,
      });
    } catch (emailError) {
      if (emailError instanceof EmailConfigurationError) {
        logger.warn(
          { scope: 'resend.password-reset', reason: emailError.message },
          'Resend configuration missing, password reset email skipped'
        );
      } else {
        logger.error(
          {
            scope: 'resend.password-reset',
            error: emailError instanceof Error ? emailError.message : emailError,
          },
          'Failed to send password reset email'
        );
      }
    }

    logger.info({ userEmail: email }, 'Password reset requested');

    return { success: true, message: 'If that email exists, a reset link has been sent.' };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'request-password-reset-failed',
      severity: 'error',
      extra: { email },
    });
    return { error: 'Failed to process password reset request' };
  }
}

// Deprecated: Kept for backward compatibility, use setPasswordWithToken instead
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
