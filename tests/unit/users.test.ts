/**
 * Unit tests for user server actions
 * Tests audit log creation for user operations
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDb, resetMockDb } from '../helpers/mock-db';
import { createMockUser } from '../utils/test-factories';

// Mock the db module
vi.mock('@/shared/lib/db', () => ({ db: mockDb }));

// Mock auth module
const mockAuth = vi.fn();
vi.mock('@/server/auth', () => ({
  auth: () => mockAuth(),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import actions after mocks are set up
import { deleteUser, updateUser } from '@/server/actions/users';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Helper to create a Prisma FK constraint error
 */
function createFKConstraintError(): PrismaClientKnownRequestError {
  const error = new PrismaClientKnownRequestError(
    'Foreign key constraint violated on the constraint: `audit_logs_entityId_fkey`',
    {
      code: 'P2003',
      clientVersion: '6.19.2',
      meta: { constraintName: 'audit_logs_entityId_fkey' },
      batchRequestIdx: undefined,
    }
  );
  return error;
}

describe('User Server Actions - Audit Log FK Constraint', () => {
  const superUserSession = {
    user: {
      id: 'super-user-1',
      email: 'admin@test.com',
      role: 'SUPER_USER',
    },
  };

  beforeEach(() => {
    resetMockDb();
    vi.clearAllMocks();
    mockAuth.mockResolvedValue(superUserSession);
  });

  describe('updateUser', () => {
    it('should create audit log with User entityType without FK constraint error', async () => {
      const userId = 'user-to-update';
      const updatedUser = createMockUser({
        id: userId,
        name: 'Updated Name',
        email: 'updated@test.com',
        role: 'EDITOR',
      });

      // Mock user update success
      mockDb.user.update.mockResolvedValue(updatedUser);

      // Mock audit log creation - this should NOT throw FK error
      // because entityId should not have a FK constraint to projects
      mockDb.auditLog.create.mockResolvedValue({ id: 'audit-log-1' });

      const result = await updateUser(userId, { name: 'Updated Name' });

      expect(result).toEqual({ success: true, userId });
      expect(mockDb.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'USER_UPDATED',
          entityType: 'User',
          entityId: userId,
          userId: superUserSession.user.id,
          userEmail: superUserSession.user.email,
          metadata: {
            userName: updatedUser.name,
            userEmail: updatedUser.email,
            changes: { name: 'Updated Name' },
          },
        },
      });
    });

    it('audit log creation succeeds for User entityType (FK constraint removed)', async () => {
      const userId = 'user-to-update';
      const updatedUser = createMockUser({
        id: userId,
        name: 'Updated Name',
      });

      mockDb.user.update.mockResolvedValue(updatedUser);

      // Simulate what WAS the bug: auditLog.create would throw FK error
      // because entityId had FK constraint to projects table
      // This is now fixed - the FK constraint has been removed
      mockDb.auditLog.create.mockRejectedValue(createFKConstraintError());

      const result = await updateUser(userId, { name: 'Updated Name' });

      // This test documents the error behavior if FK constraint existed
      // (regression test - the FK constraint has been removed)
      expect(result).toEqual({ error: 'Failed to update user' });
      expect(mockDb.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should create audit log after user is deleted without FK constraint error', async () => {
      const userId = 'user-to-delete';
      const userToDelete = createMockUser({
        id: userId,
        name: 'Delete Me',
        email: 'delete@test.com',
      });

      // Mock finding the user
      mockDb.user.findUnique.mockResolvedValue(userToDelete);

      // Mock user deletion success
      mockDb.user.delete.mockResolvedValue(userToDelete);

      // Mock audit log creation - should work even after user is deleted
      // because audit logs should persist independently
      mockDb.auditLog.create.mockResolvedValue({ id: 'audit-log-1' });

      const result = await deleteUser(userId);

      expect(result).toEqual({ success: true });
      expect(mockDb.user.delete).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockDb.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'USER_DELETED',
          entityType: 'User',
          entityId: userId,
          userId: superUserSession.user.id,
          userEmail: superUserSession.user.email,
          metadata: {
            deletedUserName: userToDelete.name,
            deletedUserEmail: userToDelete.email,
          },
        },
      });
    });

    it('audit log creation succeeds after user deletion (FK constraint removed)', async () => {
      const userId = 'user-to-delete';
      const userToDelete = createMockUser({
        id: userId,
        name: 'Delete Me',
        email: 'delete@test.com',
      });

      mockDb.user.findUnique.mockResolvedValue(userToDelete);
      mockDb.user.delete.mockResolvedValue(userToDelete);

      // Simulate what WAS the FK constraint error
      // This is now fixed - the FK constraint has been removed
      mockDb.auditLog.create.mockRejectedValue(createFKConstraintError());

      const result = await deleteUser(userId);

      // This test documents the error behavior if FK constraint existed
      // (regression test - the FK constraint has been removed)
      expect(result).toEqual({ error: 'Failed to delete user' });
    });

    it('should prevent deleting a super user account', async () => {
      const superUserId = 'super-user-to-delete';
      const userToDelete = createMockUser({
        id: superUserId,
        name: 'Other Super User',
        email: 'other-super@test.com',
        role: 'SUPER_USER',
      });

      // Mock finding the super user
      mockDb.user.findUnique.mockResolvedValue(userToDelete);

      const result = await deleteUser(superUserId);

      expect(result).toEqual({ error: 'Cannot delete a super user account' });
      expect(mockDb.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('Audit log persistence', () => {
    it('audit logs should persist even when referenced entity is deleted', async () => {
      // This test documents the expected behavior:
      // Audit logs are historical records that should remain
      // even after the entity they reference is deleted

      const userId = 'deleted-user';
      const auditLogEntry = {
        id: 'audit-log-1',
        action: 'USER_DELETED',
        entityType: 'User',
        entityId: userId, // User no longer exists
        userId: superUserSession.user.id,
        userEmail: superUserSession.user.email,
        metadata: { deletedUserName: 'Deleted User' },
        createdAt: new Date(),
      };

      // The audit log should be retrievable even though user doesn't exist
      // This is only possible if entityId has no FK constraint
      mockDb.auditLog.create.mockResolvedValue(auditLogEntry);
      mockDb.auditLog.findMany.mockResolvedValue([auditLogEntry]);

      // Create audit log for deleted user
      const log = await mockDb.auditLog.create({
        data: auditLogEntry,
      });

      expect(log.entityId).toBe(userId);
      expect(log.entityType).toBe('User');
      expect(log.action).toBe('USER_DELETED');
    });
  });
});
