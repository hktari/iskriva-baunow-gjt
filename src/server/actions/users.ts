'use server';

import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { userSchema, type UserFormData } from '@/shared/lib/validations/user';
import { UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function createUser(data: UserFormData) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

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
        },
      },
    });

    revalidatePath('/users');

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Create user error:', error);
    return { error: 'Failed to create user' };
  }
}

export async function updateUser(id: string, data: Partial<UserFormData>) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

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
        },
      },
    });

    revalidatePath('/users');

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Update user error:', error);
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

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { email: true, name: true },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    await db.user.delete({
      where: { id },
    });

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
        },
      },
    });

    revalidatePath('/users');

    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { error: 'Failed to delete user' };
  }
}

export async function updateUserStatus(id: string, status: UserStatus) {
  const session = await auth();

  if (session?.user.role !== 'SUPER_USER') {
    return { error: 'Unauthorized' };
  }

  try {
    const user = await db.user.update({
      where: { id },
      data: { status },
    });

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
        },
      },
    });

    revalidatePath('/users');

    return { success: true };
  } catch (error) {
    console.error('Update user status error:', error);
    return { error: 'Failed to update user status' };
  }
}
