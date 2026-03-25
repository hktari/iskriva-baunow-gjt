'use server';

import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export async function inviteUser(email: string, name: string, role: UserRole) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

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
        },
      },
    });

    // In a real application, you would send an email here with the temporary password
    // For now, we'll return it in the response (NOT recommended for production)
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)

    revalidatePath('/users');

    return {
      success: true,
      userId: user.id,
      tempPassword, // Only for demo purposes
      message: 'User invited successfully. In production, an email would be sent.',
    };
  } catch (error) {
    console.error('Invite user error:', error);
    return { error: 'Failed to invite user' };
  }
}

export async function resendInvitation(userId: string) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

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
        },
      },
    });

    // TODO: Send email with new temporary password

    return {
      success: true,
      tempPassword, // Only for demo purposes
      message: 'Invitation resent successfully.',
    };
  } catch (error) {
    console.error('Resend invitation error:', error);
    return { error: 'Failed to resend invitation' };
  }
}

export async function acceptInvitation(userId: string, newPassword: string) {
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
        },
      },
    });

    return { success: true, message: 'Invitation accepted successfully' };
  } catch (error) {
    console.error('Accept invitation error:', error);
    return { error: 'Failed to accept invitation' };
  }
}
