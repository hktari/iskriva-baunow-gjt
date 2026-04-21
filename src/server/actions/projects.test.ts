import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies at the top level before any imports
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/server/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/shared/lib/db', () => ({
  db: {
    project: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    favorite: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    kpi: {
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('@/shared/lib/validations/project', () => ({
  projectSchema: {
    parse: vi.fn(data => data),
  },
}));

import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { createProject, deleteProject, toggleFavorite, updateProject } from './projects';

const mockAuth = auth as ReturnType<typeof vi.fn>;

describe('Projects Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProject', () => {
    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await createProject({ name: 'Test' } as any);
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('returns error when user is viewer', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'VIEWER' } });
      const result = await createProject({ name: 'Test' } as any);
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('creates project when user is editor', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.project.create as any).mockResolvedValue({ id: 'proj-1', name: 'Test Project' });
      const result = await createProject({ name: 'Test Project' } as any);
      expect(result).toEqual({ success: true, projectId: 'proj-1' });
    });

    it('handles database errors', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.project.create as any).mockRejectedValue(new Error('Database error'));
      const result = await createProject({ name: 'Test Project' } as any);
      expect(result).toEqual({ error: 'Failed to create project' });
    });
  });

  describe('updateProject', () => {
    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await updateProject('proj-1', { name: 'Updated' } as any);
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('returns error when user is viewer', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'VIEWER' } });
      const result = await updateProject('proj-1', { name: 'Updated' } as any);
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('updates project successfully', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.project.update as any).mockResolvedValue({ id: 'proj-1', name: 'Updated' });
      const result = await updateProject('proj-1', { name: 'Updated' } as any);
      expect(result).toEqual({ success: true, projectId: 'proj-1' });
    });
  });

  describe('deleteProject', () => {
    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await deleteProject('proj-1');
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('returns error when user is viewer', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'VIEWER' } });
      const result = await deleteProject('proj-1');
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('deletes project successfully as super user', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'SUPER_USER' } });
      (db.project.delete as any).mockResolvedValue({ id: 'proj-1' });
      const result = await deleteProject('proj-1');
      expect(result).toEqual({ success: true });
    });

    it('deletes project successfully when editor is the creator', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.project.findUnique as any).mockResolvedValue({ createdById: 'user-1' });
      (db.project.delete as any).mockResolvedValue({ id: 'proj-1' });
      const result = await deleteProject('proj-1');
      expect(result).toEqual({ success: true });
    });

    it('returns error when editor is not the creator', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.project.findUnique as any).mockResolvedValue({ createdById: 'user-2' });
      const result = await deleteProject('proj-1');
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('returns error when project does not exist and user is not super user', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.project.findUnique as any).mockResolvedValue(null);
      const result = await deleteProject('proj-1');
      expect(result).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('toggleFavorite', () => {
    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await toggleFavorite('proj-1');
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('adds to favorites when not favorited', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'VIEWER' } });
      (db.favorite.findUnique as any).mockResolvedValue(null);
      (db.favorite.create as any).mockResolvedValue({ userId: 'user-1', projectId: 'proj-1' });
      const result = await toggleFavorite('proj-1');
      expect(result).toEqual({ success: true, isFavorite: true });
    });

    it('removes from favorites when already favorited', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'VIEWER' } });
      (db.favorite.findUnique as any).mockResolvedValue({ userId: 'user-1', projectId: 'proj-1' });
      (db.favorite.delete as any).mockResolvedValue({ userId: 'user-1', projectId: 'proj-1' });
      const result = await toggleFavorite('proj-1');
      expect(result).toEqual({ success: true, isFavorite: false });
    });
  });
});
