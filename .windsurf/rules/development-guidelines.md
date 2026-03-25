---
trigger: always_on
description: 'Development patterns and principles for the Baunow GJT project. Hooks, composition, performance, Error handling, testing, and TypeScript best practices.'
---

# Development Guidelines

This document outlines best practices and standards for developing the Baunow GJT application to prevent runtime errors and maintain code quality.

## Table of Contents

- [Component Development](#component-development)
- [Type Safety](#type-safety)
- [Error Handling](#error-handling)
- [Testing Requirements](#testing-requirements)
- [Code Review Checklist](#code-review-checklist)

## Component Development

### Component Structure

All React components should follow this structure:

```tsx
'use client'; // Only if needed (client components)

import {} from /* dependencies */ 'library';

// 1. Type definitions
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
}

// 2. Component implementation
export function Component({ requiredProp, optionalProp }: ComponentProps) {
  // 3. Hooks (always at the top, never conditional)
  const [state, setState] = useState();

  // 4. Event handlers
  const handleClick = () => {
    // ...
  };

  // 5. Render logic
  return <div>{/* JSX */}</div>;
}
```

### Props Validation

1. **Always define TypeScript interfaces for props**

   ```tsx
   // ✅ Good
   interface ButtonProps {
     label: string;
     onClick: () => void;
     disabled?: boolean;
   }

   // ❌ Bad
   function Button(props: any) {}
   ```

2. **Use optional chaining for nullable props**

   ```tsx
   // ✅ Good
   <div>{user?.name ?? 'Guest'}</div>

   // ❌ Bad
   <div>{user && user.name || 'Guest'}</div>
   ```

3. **Validate external data at boundaries**
   ```tsx
   // ✅ Good - validate server data
   const project = await getProject(id);
   if (!project) {
     return <NotFound />;
   }
   ```

### Error Boundaries

Wrap components that might fail with Error Boundaries:

```tsx
// For full pages
<ErrorBoundary>
  <ProjectPage />
</ErrorBoundary>

// For sections
<SectionErrorBoundary sectionName="Analytics Dashboard">
  <AnalyticsDashboard />
</SectionErrorBoundary>
```

### Async Operations

1. **Always handle loading and error states**

   ```tsx
   // ✅ Good
   function DataComponent() {
     const [data, setData] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     useEffect(() => {
       fetchData()
         .then(setData)
         .catch(setError)
         .finally(() => setLoading(false));
     }, []);

     if (loading) return <Spinner />;
     if (error) return <ErrorMessage error={error} />;
     if (!data) return <EmptyState />;

     return <DataDisplay data={data} />;
   }
   ```

2. **Use Server Components for data fetching when possible**
   ```tsx
   // ✅ Good - Server Component
   async function ProjectList() {
     const projects = await getProjects();
     return <List items={projects} />;
   }
   ```

## Type Safety

### TypeScript Best Practices

1. **Avoid `any` type**

   ```tsx
   // ✅ Good
   function processData(data: Project[]): ProcessedData {
     // ...
   }

   // ❌ Bad
   function processData(data: any): any {
     // ...
   }
   ```

2. **Use strict null checks**

   ```tsx
   // ✅ Good
   function getName(user: User | null): string {
     return user?.name ?? 'Unknown';
   }

   // ❌ Bad
   function getName(user: User): string {
     return user.name; // Might be null
   }
   ```

3. **Define return types explicitly for complex functions**
   ```tsx
   // ✅ Good
   async function fetchProjects(): Promise<Project[]> {
     // ...
   }
   ```

### Handling Nullable Data

1. **Use nullish coalescing (`??`) over logical OR (`||`)**

   ```tsx
   // ✅ Good - preserves 0, false, ''
   const count = data.count ?? 0;

   // ❌ Bad - 0 would become 0
   const count = data.count || 0;
   ```

2. **Use optional chaining for nested properties**

   ```tsx
   // ✅ Good
   const city = user?.address?.city;

   // ❌ Bad
   const city = user && user.address && user.address.city;
   ```

## Error Handling

### Server Actions

Always return structured responses from Server Actions:

```tsx
// ✅ Good
export async function createProject(data: ProjectFormData) {
  try {
    const project = await db.project.create({ data });
    revalidatePath('/projects');
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to create project:', error);
    return {
      success: false,
      error: 'Failed to create project. Please try again.',
    };
  }
}
```

### Client-Side Error Handling

```tsx
// ✅ Good
async function handleSubmit(data: FormData) {
  try {
    const result = await createProject(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('Project created successfully');
  } catch (error) {
    toast.error('An unexpected error occurred');
    console.error(error);
  }
}
```

### API Routes

```tsx
// ✅ Good
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return Response.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Testing Requirements

### Unit Tests

Every shared component should have unit tests covering:

1. **Happy path rendering**
2. **Error states**
3. **Edge cases (null/undefined props)**
4. **User interactions**

```tsx
// Example test structure
describe('ProjectCard', () => {
  it('renders project information', () => {
    const project = createMockProject();
    render(<ProjectCard project={project} />);
    expect(screen.getByText(project.name)).toBeInTheDocument();
  });

  it('handles missing optional data', () => {
    const project = createMockProject({ organization: null });
    render(<ProjectCard project={project} />);
    // Should not crash
  });

  it('displays error state when data is invalid', () => {
    // Test error handling
  });
});
```

### Test Coverage Goals

- **Shared components**: 80%+ coverage
- **Business logic**: 90%+ coverage
- **Server Actions**: 100% coverage

### Using Test Utilities

```tsx
import { render } from '@/tests/utils/custom-render';
import { createMockProject } from '@/tests/utils/test-factories';

// Use factories for consistent test data
const project = createMockProject({ name: 'Custom Name' });
```

## Code Review Checklist

Before submitting a PR, ensure:

### Type Safety

- [ ] No `any` types (unless absolutely necessary with comment)
- [ ] All function parameters and return types defined
- [ ] Nullable types handled with optional chaining or null checks
- [ ] No TypeScript errors or warnings

### Error Handling

- [ ] All async operations have error handling
- [ ] Loading states implemented for async operations
- [ ] Error boundaries used where appropriate
- [ ] User-friendly error messages (no technical jargon)

### React Best Practices

- [ ] Hooks follow rules (top level, not conditional)
- [ ] No array index as key (unless static list)
- [ ] Props destructured in function signature
- [ ] Components are properly memoized if needed

### Testing

- [ ] Unit tests added for new components
- [ ] Tests cover error cases
- [ ] Tests use test factories for mock data
- [ ] All tests pass locally

### Code Quality

- [ ] ESLint passes with no warnings
- [ ] TypeScript compilation succeeds
- [ ] Code formatted with Prettier
- [ ] No console.log statements (use console.error/warn if needed)

### Performance

- [ ] No unnecessary re-renders
- [ ] Large lists virtualized if needed
- [ ] Images optimized (use Next.js Image component)
- [ ] Server Components used for data fetching when possible

## Common Pitfalls to Avoid

### 1. Conditional Hook Calls

```tsx
// ❌ Bad
if (condition) {
  const [state, setState] = useState();
}

// ✅ Good
const [state, setState] = useState();
if (condition) {
  // use state
}
```

### 2. Missing Dependency Arrays

```tsx
// ❌ Bad
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId dependency

// ✅ Good
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 3. Not Handling Null/Undefined

```tsx
// ❌ Bad
<div>{user.name}</div> // Crashes if user is null

// ✅ Good
<div>{user?.name ?? 'Guest'}</div>
```

### 4. Truthy/Falsy Rendering Issues

```tsx
// ❌ Bad - renders "0" if count is 0
{
  count && <div>Count: {count}</div>;
}

// ✅ Good
{
  count > 0 && <div>Count: {count}</div>;
}
// or
{
  count !== 0 ? <div>Count: {count}</div> : null;
}
```

### 5. Unhandled Promise Rejections

```tsx
// ❌ Bad
async function onClick() {
  await dangerousOperation(); // Unhandled if it throws
}

// ✅ Good
async function onClick() {
  try {
    await dangerousOperation();
  } catch (error) {
    console.error('Operation failed:', error);
    toast.error('Operation failed');
  }
}
```
