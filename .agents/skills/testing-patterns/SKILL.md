---
name: testing-patterns
description: "Testing guidelines for the EU Project Manager application. Use when writing unit, integration, and E2E tests. Best practices on testing patterns and how to structure tests."
---
# Testing Guidelines

Comprehensive testing strategy for the EU Project Manager application.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Writing Unit Tests](#writing-unit-tests)
- [Writing E2E Tests](#writing-e2e-tests)
- [Test Utilities](#test-utilities)
- [Best Practices](#best-practices)

## Testing Philosophy

Our testing strategy focuses on:

1. **Catching errors early** - Tests should catch bugs before they reach production
2. **Confidence in refactoring** - Tests enable safe code changes
3. **Documentation** - Tests serve as living documentation
4. **Fast feedback** - Tests should run quickly during development

## Test Types

### Unit Tests (Vitest)

**Purpose**: Test individual components and functions in isolation

**When to write**:
- All shared components (`src/shared/components/`)
- Utility functions (`src/shared/lib/`)
- Server Actions with business logic
- Complex data transformations

**Coverage target**: 80%+ for shared code

### Integration Tests (Vitest)

**Purpose**: Test how components work together

**When to write**:
- Form submission flows
- Multi-component interactions
- Data fetching and state management

### E2E Tests (Playwright)

**Purpose**: Test complete user workflows

**When to write**:
- Critical user journeys (login, create project, etc.)
- Multi-page workflows
- Complex interactions

**Note**: Follow the memory guidelines - run tests efficiently, one at a time initially.

## Writing Unit Tests

### Component Test Structure

```tsx
import { render, screen, fireEvent } from '@/tests/utils/custom-render';
import { describe, it, expect, vi } from 'vitest';
import { createMockProject } from '@/tests/utils/test-factories';
import { ProjectCard } from './project-card';

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    const project = createMockProject();
    render(<ProjectCard project={project} />);
    
    expect(screen.getByText(project.name)).toBeInTheDocument();
    expect(screen.getByText(project.country)).toBeInTheDocument();
  });
  
  it('handles missing optional data gracefully', () => {
    const project = createMockProject({ organization: null });
    render(<ProjectCard project={project} />);
    
    // Should not crash
    expect(screen.getByText(project.name)).toBeInTheDocument();
  });
  
  it('handles user interactions', async () => {
    const project = createMockProject();
    const user = userEvent.setup();
    
    render(<ProjectCard project={project} />);
    
    const button = screen.getByRole('button', { name: /view details/i });
    await user.click(button);
    
    // Assert expected behavior
  });
});
```

### Testing Async Components

```tsx
import { waitFor } from '@testing-library/react';

it('loads and displays data', async () => {
  const mockData = createMockProject();
  vi.mocked(fetchProject).mockResolvedValue(mockData);
  
  render(<AsyncComponent />);
  
  // Initially shows loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText(mockData.name)).toBeInTheDocument();
  });
});
```

### Testing Error States

```tsx
it('displays error message when fetch fails', async () => {
  vi.mocked(fetchProject).mockRejectedValue(new Error('Network error'));
  
  render(<AsyncComponent />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Testing Server Actions

```tsx
import { describe, it, expect, vi } from 'vitest';
import { createProject } from './actions';

// Mock Prisma
vi.mock('@/server/db', () => ({
  db: {
    project: {
      create: vi.fn(),
    },
  },
}));

describe('createProject', () => {
  it('creates project successfully', async () => {
    const mockProject = createMockProject();
    vi.mocked(db.project.create).mockResolvedValue(mockProject);
    
    const result = await createProject(createMockProjectFormData());
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockProject);
  });
  
  it('handles database errors', async () => {
    vi.mocked(db.project.create).mockRejectedValue(new Error('DB Error'));
    
    const result = await createProject(createMockProjectFormData());
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## Writing E2E Tests

### E2E Test Structure

```tsx
import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'editor@example.com');
    await page.fill('[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });
  
  test('creates a new project', async ({ page }) => {
    await page.goto('/projects');
    await page.click('text=New Project');
    
    // Fill form
    await page.fill('[name="name"]', 'Test Project');
    await page.fill('[name="country"]', 'Germany');
    await page.selectOption('[name="status"]', 'PLANNED');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page).toHaveURL(/\/project\/.+/);
    await expect(page.locator('h1')).toContainText('Test Project');
  });
});
```

### E2E Best Practices

1. **Start small**: Run single test first, then whole file
2. **Use data-testid for stable selectors**:
   ```tsx
   <button data-testid="submit-project">Submit</button>
   ```
   ```tsx
   await page.click('[data-testid="submit-project"]');
   ```

3. **Wait for network requests**:
   ```tsx
   await page.waitForResponse(response => 
     response.url().includes('/api/projects')
   );
   ```

4. **Take screenshots on failure** (already configured):
   ```tsx
   test('example', async ({ page }) => {
     // Test will auto-screenshot on failure
   });
   ```

## Test Utilities

### Test Factories

Use factories for consistent mock data:

```tsx
import { 
  createMockProject, 
  createMockKpi,
  createMockUser,
  createMockProjectWithKpis 
} from '@/tests/utils/test-factories';

// Basic usage
const project = createMockProject();

// With overrides
const project = createMockProject({ 
  name: 'Custom Name',
  status: 'COMPLETED' 
});

// With related data
const projectWithKpis = createMockProjectWithKpis({}, 3); // 3 KPIs
```

### Custom Render

Use custom render for components that need providers:

```tsx
import { render } from '@/tests/utils/custom-render';

// Automatically wraps with necessary providers
render(<MyComponent />);
```

### Mock Server Actions

```tsx
import { 
  createMockServerAction,
  createMockServerActionError 
} from '@/tests/utils/mock-server-actions';

// Mock successful action
const mockAction = createMockServerAction({ id: '123' });

// Mock error action
const mockError = createMockServerActionError('Something went wrong');
```

## Best Practices

### DO ✅

1. **Use test factories** for mock data
   ```tsx
   const project = createMockProject();
   ```

2. **Test user behavior, not implementation**
   ```tsx
   // Good - tests what user sees
   expect(screen.getByRole('button', { name: /submit/i }));
   
   // Bad - tests implementation
   expect(component.state.isSubmitting).toBe(false);
   ```

3. **Use semantic queries**
   ```tsx
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText(/email/i)
   screen.getByText(/welcome/i)
   ```

4. **Test error states**
   ```tsx
   it('shows error when API fails', async () => {
     mockApi.mockRejectedValue(new Error());
     render(<Component />);
     await waitFor(() => {
       expect(screen.getByText(/error/i)).toBeInTheDocument();
     });
   });
   ```

5. **Clean up after tests**
   ```tsx
   afterEach(() => {
     vi.clearAllMocks();
   });
   ```

### DON'T ❌

1. **Don't test implementation details**
   ```tsx
   // Bad
   expect(wrapper.find('.className')).toHaveLength(1);
   
   // Good
   expect(screen.getByRole('button')).toBeInTheDocument();
   ```

2. **Don't use arbitrary waits**
   ```tsx
   // Bad
   await new Promise(resolve => setTimeout(resolve, 1000));
   
   // Good
   await waitFor(() => {
     expect(screen.getByText(/loaded/i)).toBeInTheDocument();
   });
   ```

3. **Don't test external libraries**
   ```tsx
   // Bad - testing React Router
   it('navigates correctly', () => {
     // Testing library behavior
   });
   
   // Good - testing your component's behavior
   it('calls onNavigate when button clicked', () => {
     const onNavigate = vi.fn();
     render(<Component onNavigate={onNavigate} />);
     fireEvent.click(screen.getByRole('button'));
     expect(onNavigate).toHaveBeenCalled();
   });
   ```

4. **Don't write tests that can pass when they should fail**
   ```tsx
   // Bad - might pass even if element doesn't exist
   expect(screen.queryByText('Hello')).not.toBeNull();
   
   // Good
   expect(screen.getByText('Hello')).toBeInTheDocument();
   ```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run with UI
pnpm test:ui

# Run specific file
pnpm test src/shared/components/project-card.test.tsx

# Run with coverage
pnpm test --coverage
```

### E2E Tests

```bash
# Run all e2e tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific test
pnpm test:e2e tests/e2e/projects.spec.ts

# Run in headed mode (see browser)
pnpm test:e2e --headed
```

**Important**: Before running e2e tests:
1. Ensure app is running on port 3005
2. Start with single test, then expand
3. Check `tmp/test-results` for screenshots on failure

## Debugging Tests

### Unit Tests

```tsx
import { screen, debug } from '@testing-library/react';

it('test', () => {
  render(<Component />);
  
  // Print current DOM
  screen.debug();
  
  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

### E2E Tests

```tsx
test('example', async ({ page }) => {
  // Pause execution
  await page.pause();
  
  // Take screenshot
  await page.screenshot({ path: 'debug.png' });
  
  // Console logs
  page.on('console', msg => console.log(msg.text()));
});
```

## Coverage Goals

- **Shared Components**: 80%+
- **Business Logic**: 90%+
- **Server Actions**: 100%
- **Overall**: 70%+

## Questions?

If you need help with testing, refer to:
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
