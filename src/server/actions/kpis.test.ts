import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies at the top level before any imports
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/server/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/shared/lib/db', () => ({
  db: {
    kpi: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/shared/lib/validations/project', () => ({
  kpiSchema: {
    parse: vi.fn((data) => data),
  },
}));

import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { createKpi, updateKpi, deleteKpi, setPrimaryKpi } from './kpis';

const mockAuth = auth as ReturnType<typeof vi.fn>;

describe('KPIs Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createKpi', () => {
    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await createKpi('proj-1', { indicatorName: 'Test' } as any);
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('returns error when user is viewer', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'VIEWER' } });
      const result = await createKpi('proj-1', { indicatorName: 'Test' } as any);
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('creates KPI when user is editor', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.kpi.create as any).mockResolvedValue({ id: 'kpi-1', indicatorName: 'Test' });
      const result = await createKpi('proj-1', { indicatorName: 'Test' } as any);
      expect(result).toEqual({ success: true, kpiId: 'kpi-1' });
    });

    it('handles database errors', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.kpi.create as any).mockRejectedValue(new Error('Database error'));
      const result = await createKpi('proj-1', { indicatorName: 'Test' } as any);
      expect(result).toEqual({ error: 'Failed to create KPI' });
    });
  });

  describe('updateKpi', () => {
    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await updateKpi('kpi-1', 'proj-1', { indicatorName: 'Test' } as any);
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('returns error when user is viewer', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'VIEWER' } });
      const result = await updateKpi('kpi-1', 'proj-1', { indicatorName: 'Test' } as any);
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('updates KPI successfully', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.kpi.update as any).mockResolvedValue({ id: 'kpi-1', indicatorName: 'Updated' });
      const result = await updateKpi('kpi-1', 'proj-1', { indicatorName: 'Updated' } as any);
      expect(result).toEqual({ success: true, kpiId: 'kpi-1' });
    });
  });

  describe('deleteKpi', () => {
    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await deleteKpi('kpi-1', 'proj-1');
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('returns error when user is viewer', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'VIEWER' } });
      const result = await deleteKpi('kpi-1', 'proj-1');
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('deletes KPI successfully', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.kpi.delete as any).mockResolvedValue({ id: 'kpi-1' });
      const result = await deleteKpi('kpi-1', 'proj-1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('setPrimaryKpi', () => {
    it('returns error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const result = await setPrimaryKpi('kpi-1', 'proj-1');
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('returns error when KPI not found', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.kpi.findUnique as any).mockResolvedValue(null);
      const result = await setPrimaryKpi('kpi-1', 'proj-1');
      expect(result).toEqual({ error: 'KPI not found' });
    });

    it('sets primary KPI when not currently primary', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.kpi.findUnique as any).mockResolvedValue({ isPrimary: false });
      (db.kpi.update as any).mockResolvedValue({ id: 'kpi-1', isPrimary: true });
      const result = await setPrimaryKpi('kpi-1', 'proj-1');
      expect(result).toEqual({ success: true, isPrimary: true });
    });

    it('unsets primary when already primary', async () => {
      mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'EDITOR' } });
      (db.kpi.findUnique as any).mockResolvedValue({ isPrimary: true });
      const result = await setPrimaryKpi('kpi-1', 'proj-1');
      expect(result).toEqual({ success: true, isPrimary: false });
    });
  });
});
