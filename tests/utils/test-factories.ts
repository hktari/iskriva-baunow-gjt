/**
 * Test data factories for creating consistent mock data across tests
 */

export const createMockProject = (overrides?: Partial<any>) => ({
  id: 'test-project-1',
  name: 'Test Project',
  country: 'Germany',
  organization: 'Test Organization',
  projectType: 'Research',
  status: 'IN_PROGRESS',
  description: 'A test project description',
  projectValue: 1000000,
  investmentCosts: 500000,
  investmentType: 'Grant',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31'),
  kpis: [],
  favorites: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockKpi = (overrides?: Partial<any>) => ({
  id: 'test-kpi-1',
  projectId: 'test-project-1',
  indicatorName: 'Test KPI',
  targetValue: 1000,
  valueAchieved: 500,
  unit: 'units',
  decimals: false,
  thousandSeparators: true,
  isPrimary: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockUser = (overrides?: Partial<any>) => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'VIEWER',
  emailVerified: null,
  image: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockSession = (overrides?: Partial<any>) => ({
  user: createMockUser(),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

/**
 * Factory for creating projects with related data
 */
export const createMockProjectWithKpis = (
  projectOverrides?: Partial<any>,
  kpiCount: number = 2
) => {
  const project = createMockProject(projectOverrides);
  const kpis = Array.from({ length: kpiCount }, (_, i) =>
    createMockKpi({
      id: `test-kpi-${i + 1}`,
      projectId: project.id,
      indicatorName: `KPI ${i + 1}`,
      isPrimary: i === 0,
    })
  );
  return { ...project, kpis };
};

/**
 * Factory for creating analytics data
 */
export const createMockAnalyticsData = (overrides?: Partial<any>) => ({
  totalProjects: 10,
  activeProjects: 7,
  completedProjects: 3,
  totalInvestment: 5000000,
  totalValue: 10000000,
  averageProgress: 65,
  ...overrides,
});

/**
 * Factory for creating form data
 */
export const createMockProjectFormData = (overrides?: Partial<any>) => ({
  name: 'New Project',
  country: 'Germany',
  organization: 'Test Org',
  projectType: 'Research',
  status: 'PLANNED',
  description: 'Project description',
  projectValue: 1000000,
  investmentCosts: 500000,
  investmentType: 'Grant',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  ...overrides,
});
