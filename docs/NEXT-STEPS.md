# Next Steps - EU Project Manager

## Current Status

✅ **Project Setup Complete**

- Next.js 15 with App Router configured
- TypeScript with strict mode enabled
- Tailwind CSS v4 configured
- Prisma ORM with PostgreSQL schema defined
- Auth.js (NextAuth v5) configured with role-based access
- shadcn/ui base components installed
- Testing infrastructure (Vitest + Playwright) configured
- Sentry error tracking configured
- Database seeded with demo data

## Immediate Next Steps

### 1. Database Initialization (Required First)

Before starting development, initialize the database:

```bash
# Create .env file with your database credentials
cp .env.example .env
# Edit .env and add your DATABASE_URL and AUTH_SECRET

# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with demo data
pnpm db:seed
```

### 2. Verify Setup

```bash
# Start development server
pnpm dev

# In another terminal, run typecheck
pnpm typecheck

# Open Prisma Studio to view data
pnpm db:studio
```

Visit http://localhost:3000 - you should see a placeholder page.

## Development Roadmap

According to `docs/PLAN.md`, implement features in this order:

### Phase 1: Core Infrastructure (Week 1)

- [x] Project scaffolding
- [x] Database schema
- [x] Authentication setup
- [x] **Global layout with navigation**
- [x] **Route groups (public, auth, app)**
- [x] **Login page with demo account shortcuts**

### Phase 2: Project Management (Week 2)

- [ ] Project list page with search and filters
- [ ] Project detail page (view/edit modes)
- [ ] KPI management (add, edit, delete, set primary)
- [ ] Favorites system
- [ ] Form validation with Zod

### Phase 3: Analytics (Week 3)

- [x] General Analytics dashboard with Recharts
- [x] Organization Analytics dashboard
- [x] Chart customization and localStorage persistence
- [x] Aggregation services for KPI calculations

### Phase 4: Admin & Configuration (Week 4)

- [x] User management (super user only)
- [x] Field configuration (enum editing)
- [x] Audit logging
- [x] User invitation system

### Phase 5: Polish & Testing (Week 5)

- [ ] News page (static content)
- [ ] Methodology page (static content)
- [ ] Error handling and loading states
- [ ] Responsive design refinements
- [ ] E2E test coverage
- [ ] Performance optimization

## Recommended First Tasks

### Task 1: Create Global Layout

**File**: `src/app/(app)/layout.tsx`

Create the authenticated app layout with:

- Header with logo and navigation
- User info area (name, role badge, logout)
- Responsive mobile navigation
- Footer

### Task 2: Build Login Page

**File**: `src/app/(auth)/login/page.tsx`

Implement:

- Email/password form
- Demo account quick-login buttons
- Server action for authentication
- Error handling
- Redirect after login

### Task 3: Create Project List Page

**File**: `src/app/(app)/page.tsx`

Build the home page with:

- Landing banner
- Search functionality
- Advanced filters (collapsible)
- Project cards grid
- Favorites filter (authenticated users)
- "Add New Project" button (editors only)

## Code Patterns to Follow

### Server Actions

```typescript
// src/features/projects/actions/create-project.ts
'use server';

import { auth } from '@/server/auth';
import { db } from '@/shared/lib/db';
import { revalidatePath } from 'next/cache';

export async function createProject(data: ProjectFormData) {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    throw new Error('Unauthorized');
  }

  const project = await db.project.create({
    data: {
      ...data,
      createdById: session.user.id,
    },
  });

  revalidatePath('/');
  return project;
}
```

### Client Components with Server Actions

```typescript
// src/features/projects/components/project-form.tsx
'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { createProject } from '../actions/create-project';

export function ProjectForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await createProject(formData);
        toast.success('Project created successfully');
      } catch (error) {
        toast.error('Failed to create project');
      }
    });
  };

  return <form action={handleSubmit}>...</form>;
}
```

### Data Fetching

```typescript
// src/features/projects/queries/get-projects.ts
import { db } from '@/shared/lib/db';
import { cache } from 'react';

export const getProjects = cache(async (filters?: ProjectFilters) => {
  return db.project.findMany({
    where: {
      name: filters?.search
        ? {
            contains: filters.search,
            mode: 'insensitive',
          }
        : undefined,
      country: filters?.country,
      projectType: filters?.projectType,
    },
    include: {
      kpis: {
        where: { isPrimary: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
});
```

## Important Considerations

### Authentication

- All protected routes should check `await auth()` in Server Components
- Use middleware for route-level protection
- Role checks: `session.user.role === 'SUPER_USER'`

### Database Queries

- Use Prisma's `include` for relations
- Add indexes for frequently queried fields (already done in schema)
- Use `cache()` from React for request memoization

### Error Handling

- Use try/catch in server actions
- Return `{ error: string }` for form validation errors
- Log errors with Pino logger
- Send critical errors to Sentry in production

### Performance

- Use Server Components by default
- Only add 'use client' when needed (interactivity, hooks)
- Implement loading.tsx for route segments
- Use Suspense boundaries for data fetching

## Testing Strategy

### Unit Tests (Vitest)

- Test server actions
- Test utility functions
- Test data transformations

### Integration Tests

- Test API routes
- Test database operations
- Test authentication flows

### E2E Tests (Playwright)

- Test critical user journeys
- Test role-based access
- Test form submissions
- Test navigation flows

## Deployment Checklist

Before deploying to production:

- [ ] Set up PostgreSQL database (EU region)
- [ ] Configure environment variables in Vercel
- [ ] Set up Sentry project
- [ ] Run production build locally: `pnpm build`
- [ ] Run all tests: `pnpm test && pnpm test:e2e`
- [ ] Review security settings in `next.config.ts`
- [ ] Enable preview deployments for testing
- [ ] Set up database backups
- [ ] Configure monitoring and alerts

## Resources

- **Specification**: `docs/SPEC.md` - Complete product requirements
- **Plan**: `docs/PLAN.md` - Detailed implementation plan
- **Setup**: `docs/SETUP.md` - Development environment setup
- **README**: `README.md` - Project overview

## Questions?

Refer to the documentation or check the inline comments in the codebase for guidance.
