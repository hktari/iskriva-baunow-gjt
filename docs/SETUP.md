# EU Project Manager - Setup Guide

This guide will help you set up the development environment for the EU Project Manager application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **pnpm** 9.x or higher
- **PostgreSQL** 14.x or higher
- **Git**

## Quick Start

### 1. Clone and Install

```bash
cd /home/bostjan/source/projects/clients/iskriva-baunow-gjt
pnpm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb eu_project_manager
```

Or using psql:

```sql
CREATE DATABASE eu_project_manager;
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/eu_project_manager?schema=public"

# Auth.js - Generate a secret key
AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# Optional: Sentry for error tracking (production)
SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT=""

# Environment
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Migration and Seeding

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with demo data
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

After seeding, you can log in with these accounts:

| Role       | Email                  | Password | Permissions                    |
|------------|------------------------|----------|--------------------------------|
| Viewer     | viewer@example.com     | demo123  | Read-only access               |
| Editor     | editor@example.com     | demo123  | Create/edit projects and KPIs  |
| Super User | admin@example.com      | demo123  | Full access + user management  |

## Project Structure

```
iskriva-baunow-gjt/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── features/             # Feature modules (to be built)
│   ├── server/               # Server-side code
│   │   └── auth/            # Authentication config
│   ├── shared/               # Shared utilities
│   │   ├── components/ui/   # shadcn/ui components
│   │   └── lib/             # Utilities (db, logger, utils)
│   └── types/                # TypeScript type definitions
├── tests/                     # Test files
│   ├── setup.ts              # Vitest setup
│   └── e2e/                  # Playwright E2E tests
├── docs/                      # Documentation
│   ├── PLAN.md               # Development plan
│   ├── SPEC.md               # Product specification
│   └── SETUP.md              # This file
└── scripts/                   # Utility scripts
    └── setup.sh              # Automated setup script
```

## Available Scripts

| Command              | Description                                    |
|----------------------|------------------------------------------------|
| `pnpm dev`           | Start development server on port 3000          |
| `pnpm build`         | Build for production                           |
| `pnpm start`         | Start production server                        |
| `pnpm lint`          | Run ESLint                                     |
| `pnpm typecheck`     | Run TypeScript compiler check                  |
| `pnpm test`          | Run unit tests with Vitest                     |
| `pnpm test:ui`       | Run Vitest with UI                             |
| `pnpm test:e2e`      | Run end-to-end tests with Playwright           |
| `pnpm test:e2e:ui`   | Run Playwright with UI                         |
| `pnpm db:generate`   | Generate Prisma Client                         |
| `pnpm db:push`       | Push schema changes to database                |
| `pnpm db:migrate`    | Create and run migrations                      |
| `pnpm db:seed`       | Seed database with demo data                   |
| `pnpm db:studio`     | Open Prisma Studio (database GUI)              |

## Development Workflow

### 1. Database Changes

When modifying the database schema:

```bash
# Edit prisma/schema.prisma
# Then push changes
pnpm db:push

# Or create a migration (recommended for production)
pnpm db:migrate
```

### 2. Adding New Features

Follow the feature-first architecture:

```bash
src/features/
  └── project-management/
      ├── components/       # Feature-specific components
      ├── actions/          # Server actions
      ├── hooks/            # Custom React hooks
      └── types.ts          # Feature types
```

### 3. Testing

```bash
# Run unit tests in watch mode
pnpm test

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test src/features/project-management/__tests__/project.test.ts
```

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Verify PostgreSQL is running: `pg_isready`
2. Check your `DATABASE_URL` in `.env`
3. Ensure the database exists: `psql -l | grep eu_project_manager`

### Prisma Client Issues

If Prisma Client is out of sync:

```bash
pnpm db:generate
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### TypeScript Errors

The `@apply` warnings in CSS files are expected with Tailwind CSS v4 and can be ignored.

For NextAuth type issues, these are due to the beta version and are suppressed with `any` types where necessary.

## Next Steps

1. **Review the Specification**: Read `docs/SPEC.md` for complete product requirements
2. **Check the Plan**: See `docs/PLAN.md` for the development roadmap
3. **Build Features**: Start implementing features according to the plan
4. **Run Tests**: Ensure all tests pass before committing

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth.js Documentation](https://authjs.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions, refer to the project documentation or contact the development team.
