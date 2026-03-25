# EU Project Manager

European Project Analytics and Management Platform for tracking KPIs, investment costs, and environmental indicators across multi-country portfolios.

## Features

- 🎯 **KPI Tracking**: Target/achieved monitoring with progress visualization
- 🌍 **Multi-Country Portfolio**: Advanced filtering and search
- 📊 **Analytics Dashboards**: General and organization-level insights
- 🔐 **Role-Based Access**: Viewer, Editor, and Super User roles
- ⚙️ **Configurable Fields**: Admin-managed enums for project types, organizations, etc.
- 🌱 **Environmental Impact**: CO2 reduction, energy savings, renewable energy tracking

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Prisma ORM + PostgreSQL
- **Auth**: Auth.js (NextAuth v5)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Charts**: Recharts
- **Testing**: Vitest + Playwright
- **Observability**: Pino + Sentry

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

4. Set up the database:

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with demo data
pnpm db:seed
```

5. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

After seeding, you can log in with:

- **Viewer**: `viewer@example.com` / `demo123` (Read-only)
- **Editor**: `editor@example.com` / `demo123` (Can edit projects)
- **Super User**: `admin@example.com` / `demo123` (Full access)

## Project Structure

```
├── prisma/              # Database schema and migrations
├── src/
│   ├── app/            # Next.js App Router pages and API routes
│   ├── features/       # Feature-specific components and logic
│   ├── shared/         # Shared utilities, components, and types
│   ├── server/         # Server-side logic (auth, actions)
│   └── types/          # TypeScript type definitions
├── tests/              # Test files (unit, integration, e2e)
└── docs/               # Documentation
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript compiler check
- `pnpm test` - Run unit tests with Vitest
- `pnpm test:e2e` - Run end-to-end tests with Playwright
- `pnpm db:studio` - Open Prisma Studio

## Deployment

The application uses a preview deployment workflow with Vercel and Neon:

### Quick Start

```bash
# 1. Deploy to preview
pnpm deploy:preview

# 2. Run E2E tests against preview
pnpm test:e2e:preview

# 3. Deploy to production (if tests pass)
pnpm deploy:prod
```

### Available Deployment Scripts

- `pnpm deploy:preview` - Deploy to Vercel preview environment
- `pnpm test:e2e:preview [url]` - Run E2E tests against preview deployment
- `pnpm deploy:prod` - Deploy to Vercel production (requires confirmation)
- `pnpm db:reset-preview` - Reset preview database to production state

### Setup

See [DEPLOYMENT-WORKFLOW.md](./docs/DEPLOYMENT-WORKFLOW.md) for detailed setup instructions including:

- Installing Vercel and Neon CLI tools
- Configuring environment variables
- Setting up preview and production branches

### Environment Variables

Ensure environment variables are set in Vercel dashboard for each environment:

- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `AUTH_SECRET` - Auth.js secret key
- `NEXTAUTH_URL` - Application URL

## License

Proprietary - All rights reserved
