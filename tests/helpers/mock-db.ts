import { vi } from 'vitest';

/**
 * Mock Prisma client for unit tests
 *
 * Usage:
 * import { mockDb } from '@/tests/helpers/mock-db';
 * vi.mock('@/shared/lib/db', () => ({ db: mockDb }));
 */
export const mockDb = {
  project: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  kpi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
  },
  favorite: {
    create: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
  },
  user: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  configurableField: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(fn => fn(mockDb)),
  $disconnect: vi.fn(),
};

/**
 * Reset all mock functions between tests
 */
export function resetMockDb() {
  Object.values(mockDb).forEach(model => {
    if (typeof model === 'object') {
      Object.values(model).forEach(fn => {
        if (vi.isMockFunction(fn)) {
          fn.mockReset();
        }
      });
    }
  });
}

/**
 * Helper to mock a successful database operation
 */
export function mockDbSuccess(model: keyof typeof mockDb, operation: string, result: any) {
  (mockDb[model] as any)[operation].mockResolvedValue(result);
}

/**
 * Helper to mock a database error
 */
export function mockDbError(model: keyof typeof mockDb, operation: string, error: Error) {
  (mockDb[model] as any)[operation].mockRejectedValue(error);
}
