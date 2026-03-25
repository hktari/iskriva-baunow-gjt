# Component Patterns

Common patterns and best practices for building React components in the EU Project Manager application.

## Table of Contents

- [Server vs Client Components](#server-vs-client-components)
- [Data Fetching Patterns](#data-fetching-patterns)
- [Form Patterns](#form-patterns)
- [Error Handling Patterns](#error-handling-patterns)
- [Loading States](#loading-states)
- [Common Component Patterns](#common-component-patterns)

## Server vs Client Components

### When to Use Server Components

Server Components are the default in Next.js App Router. Use them when:

- Fetching data from database or API
- Accessing backend resources directly
- Keeping sensitive information on server (API keys, tokens)
- Reducing client-side JavaScript bundle

```tsx
// ✅ Server Component (default)
async function ProjectList() {
  const projects = await db.project.findMany();
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### When to Use Client Components

Use `'use client'` directive when you need:

- Interactivity (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Browser APIs (localStorage, window, etc.)
- Event listeners

```tsx
'use client';

import { useState } from 'react';

function InteractiveButton() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

### Composition Pattern

Keep client components small and compose them with server components:

```tsx
// ✅ Good - Server component wraps client component
async function ProjectPage({ id }: { id: string }) {
  const project = await db.project.findUnique({ where: { id } });
  
  return (
    <div>
      <h1>{project.name}</h1>
      {/* Client component for interactivity */}
      <FavoriteButton projectId={project.id} />
    </div>
  );
}
```

## Data Fetching Patterns

### Server Component Data Fetching

```tsx
// ✅ Direct database access in Server Components
async function ProjectList() {
  const projects = await db.project.findMany({
    include: { kpis: true },
    orderBy: { createdAt: 'desc' },
  });
  
  if (projects.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Client Component Data Fetching

```tsx
'use client';

import { useState, useEffect } from 'react';

function ClientDataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <EmptyState />;
  
  return <DataDisplay data={data} />;
}
```

### Parallel Data Fetching

```tsx
async function DashboardPage() {
  // Fetch in parallel
  const [projects, analytics, users] = await Promise.all([
    getProjects(),
    getAnalytics(),
    getUsers(),
  ]);
  
  return (
    <div>
      <ProjectsSection projects={projects} />
      <AnalyticsSection data={analytics} />
      <UsersSection users={users} />
    </div>
  );
}
```

## Form Patterns

### Server Action Form Pattern

```tsx
// actions.ts
'use server';

export async function createProject(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      // ... other fields
    };
    
    // Validate
    if (!data.name || !data.country) {
      return { success: false, error: 'Missing required fields' };
    }
    
    const project = await db.project.create({ data });
    revalidatePath('/projects');
    
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to create project:', error);
    return { success: false, error: 'Failed to create project' };
  }
}
```

```tsx
// form.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { createProject } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Project'}
    </Button>
  );
}

export function ProjectForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createProject(formData);
    
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    
    toast.success('Project created successfully');
    router.push(`/project/${result.data.id}`);
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="country" required />
      <SubmitButton />
    </form>
  );
}
```

### Controlled Form Pattern

```tsx
'use client';

import { useState } from 'react';

export function ControlledForm() {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
  });
  const [errors, setErrors] = useState({});
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.country) newErrors.country = 'Country is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit
    const result = await createProject(formData);
    // Handle result...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Error Handling Patterns

### Page-Level Error Boundary

```tsx
// app/projects/page.tsx
import { ErrorBoundary } from '@/shared/components/error-boundary';

export default function ProjectsPage() {
  return (
    <ErrorBoundary>
      <ProjectsContent />
    </ErrorBoundary>
  );
}
```

### Section-Level Error Boundary

```tsx
import { SectionErrorBoundary } from '@/shared/components/section-error-boundary';

function Dashboard() {
  return (
    <div>
      <SectionErrorBoundary sectionName="Analytics">
        <AnalyticsSection />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary sectionName="Recent Projects">
        <RecentProjects />
      </SectionErrorBoundary>
    </div>
  );
}
```

### Error State Pattern

```tsx
function DataComponent() {
  const [error, setError] = useState(null);
  
  if (error) {
    return (
      <div className="error-container">
        <AlertCircle className="error-icon" />
        <p>Failed to load data</p>
        <Button onClick={() => setError(null)}>Try Again</Button>
      </div>
    );
  }
  
  return <DataDisplay />;
}
```

## Loading States

### Suspense Pattern

```tsx
import { Suspense } from 'react';

function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AsyncComponent />
    </Suspense>
  );
}
```

### Loading Component Pattern

```tsx
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-muted rounded animate-pulse" />
      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
    </div>
  );
}
```

### Inline Loading State

```tsx
'use client';

function ActionButton() {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      await performAction();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Submit'
      )}
    </Button>
  );
}
```

## Common Component Patterns

### List with Empty State

```tsx
function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects found</p>
        <Button asChild className="mt-4">
          <Link href="/projects/new">Create Project</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Conditional Rendering

```tsx
// ✅ Good - explicit null check
function UserProfile({ user }: { user: User | null }) {
  if (!user) {
    return <LoginPrompt />;
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      {user.email && <p>{user.email}</p>}
    </div>
  );
}

// ❌ Bad - truthy check can render "0"
function Count({ count }: { count: number }) {
  return (
    <div>
      {count && <span>Count: {count}</span>}
    </div>
  );
}

// ✅ Good - explicit comparison
function Count({ count }: { count: number }) {
  return (
    <div>
      {count > 0 ? <span>Count: {count}</span> : null}
    </div>
  );
}
```

### Compound Component Pattern

```tsx
// Parent component
function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}

// Sub-components
Card.Header = function CardHeader({ children }: { children: ReactNode }) {
  return <div className="card-header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>;
};

// Usage
<Card>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>
    <p>Content</p>
  </Card.Body>
</Card>
```

### Render Props Pattern

```tsx
function DataFetcher({ 
  url, 
  children 
}: { 
  url: string; 
  children: (data: any, loading: boolean, error: Error | null) => ReactNode;
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);
  
  return <>{children(data, loading, error)}</>;
}

// Usage
<DataFetcher url="/api/projects">
  {(data, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <Error error={error} />;
    return <ProjectList projects={data} />;
  }}
</DataFetcher>
```

### Custom Hook Pattern

```tsx
// hooks/use-projects.ts
function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  return { projects, loading, error };
}

// Usage
function ProjectList() {
  const { projects, loading, error } = useProjects();
  
  if (loading) return <Spinner />;
  if (error) return <Error error={error} />;
  
  return <List items={projects} />;
}
```

### Memoization Pattern

```tsx
'use client';

import { useMemo, useCallback } from 'react';

function ExpensiveComponent({ data }: { data: any[] }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);
  
  // Memoize callbacks
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);
  
  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onClick={handleClick} />
      ))}
    </div>
  );
}
```

## Performance Patterns

### Lazy Loading

```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Disable SSR if not needed
});

function Dashboard() {
  return (
    <div>
      <HeavyChart data={data} />
    </div>
  );
}
```

### Image Optimization

```tsx
import Image from 'next/image';

function ProjectImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="rounded-lg"
      placeholder="blur"
      blurDataURL="data:image/..."
    />
  );
}
```

## Accessibility Patterns

### Semantic HTML

```tsx
// ✅ Good - semantic HTML
function Navigation() {
  return (
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/projects">Projects</a></li>
      </ul>
    </nav>
  );
}

// ❌ Bad - divs everywhere
function Navigation() {
  return (
    <div>
      <div onClick={() => navigate('/')}>Home</div>
      <div onClick={() => navigate('/projects')}>Projects</div>
    </div>
  );
}
```

### ARIA Labels

```tsx
function SearchButton() {
  return (
    <button aria-label="Search projects">
      <Search className="h-4 w-4" />
    </button>
  );
}
```

### Keyboard Navigation

```tsx
function Dialog({ isOpen, onClose }: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  return isOpen ? <div role="dialog">...</div> : null;
}
```

## Summary

- Use Server Components by default, Client Components when needed
- Always handle loading, error, and empty states
- Wrap risky components in Error Boundaries
- Use proper TypeScript types for all props
- Follow accessibility best practices
- Optimize performance with lazy loading and memoization
- Keep components focused and composable

For more patterns, see:
- [React Documentation](https://react.dev/learn)
- [Next.js Documentation](https://nextjs.org/docs)
