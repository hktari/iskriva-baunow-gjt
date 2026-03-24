import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Custom render function that includes providers
 * Add providers here as needed (e.g., ThemeProvider, SessionProvider)
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

/**
 * Mock session helper for testing authenticated routes
 */
export function mockSession(options?: {
  userId?: string;
  email?: string;
  role?: 'VIEWER' | 'EDITOR' | 'SUPER_USER';
}) {
  const defaults = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'EDITOR' as const,
  };

  const session = {
    user: {
      id: options?.userId ?? defaults.userId,
      email: options?.email ?? defaults.email,
      role: options?.role ?? defaults.role,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  return session;
}

/**
 * Mock auth() function return value
 */
export function mockAuth(options?: Parameters<typeof mockSession>[0]) {
  return vi.fn().mockResolvedValue(mockSession(options));
}

/**
 * Test data factories
 */
export const testData = {
  project: {
    id: 'test-project-id',
    name: 'Test Project',
    country: 'Germany',
    projectType: 'Research',
    investmentType: 'Grant',
    projectValue: 1000000,
    investmentCosts: 500000,
    status: 'IN_PROGRESS',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    description: 'Test project description',
    note: 'Internal note',
    projectManager: 'John Doe',
    contact: 'john@example.com',
    projectWebsite: 'https://example.com',
    program: 'Horizon Europe',
    organization: 'Test Org',
    targetGroup: ['Youth', 'Researchers'],
    impact: ['Environmental', 'Social'],
    lastEdited: new Date().toISOString(),
    kpis: [],
    favorites: [],
  },

  kpi: {
    id: 'test-kpi-id',
    indicatorName: 'Number of beneficiaries',
    targetValue: 1000,
    valueAchieved: 750,
    unit: 'people',
    updated: 'Q1/2025',
    decimals: false,
    thousandSeparators: true,
    isPrimary: true,
    projectId: 'test-project-id',
  },

  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'EDITOR' as const,
    status: 'ACTIVE',
  },

  configurableFields: {
    PROJECT_TYPE: ['Research', 'Infrastructure', 'Education'],
    INVESTMENT_TYPE: ['Grant', 'Loan', 'Equity'],
    ORGANIZATION: ['Org A', 'Org B', 'Org C'],
    KPI_UNIT: ['people', 'EUR', 'tons', 'MW'],
  },
};

/**
 * Helper to create a unique test ID
 */
export function uniqueId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper to wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
