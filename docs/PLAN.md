# PLAN

Build the EU Project Manager as a production-ready full-stack web app using a modular Next.js architecture. Start by establishing the platform foundations first (app shell, database, auth, RBAC, observability), then implement the core CRUD and analytics flows in the same order the product depends on them.

## Scope

- In: production baseline architecture, app structure, authentication and authorization, project and KPI management, analytics dashboards, admin configuration, deployment and observability setup, automated testing
- Out: file attachments, exports, real-time collaboration, RSS/news ingestion, audit log UI, advanced historical KPI analytics, project deletion UI, pagination, integrations beyond core auth and database

## Action Items

- [ ] Scaffold a `Next.js` App Router project with `TypeScript`, `Tailwind CSS`, `shadcn/ui`, `pnpm`, and strict lint/typecheck configuration.
- [ ] Establish the base folder structure under `src/app`, `src/features`, `src/shared`, `src/server`, `prisma`, and `tests` to keep routes thin and domain logic feature-first.
- [ ] Define the Prisma schema for users, sessions, organizations, projects, KPIs, favorites, configurable lookup tables, and audit events.
- [ ] Add seed data for demo accounts, configurable field values, and representative project/KPI records aligned with `SPEC.md`.
- [ ] Implement authentication with `Auth.js`, demo login shortcuts, session handling, and role-based authorization for `viewer`, `editor`, and `super_user`.
- [ ] Build the global layout, public navigation, responsive shell, and route groups for public pages, auth pages, and authenticated app pages.
- [ ] Implement the project list page with search, advanced filters, favorites, results count, empty states, and project cards with primary KPI highlights.
- [ ] Implement the project detail flow for read mode, create/edit mode, additional metadata fields, KPI management, inline KPI editing, and primary KPI selection.
- [ ] Build the analytics area with general and organization dashboards, chart toggles persisted to `localStorage`, and reusable aggregation services.
- [ ] Implement the super-user admin panel for user management and configurable field values with duplicate prevention and audit logging.
- [ ] Add structured logging with `Pino`, request IDs, error tracking with `Sentry`, and production-safe audit/event capture for sensitive mutations.
- [ ] Configure deployment on `Vercel` with EU-hosted Postgres, environment variable templates, preview deployments, and production rollout settings.
- [ ] Add automated tests with `Vitest`, `React Testing Library`, integration coverage for server actions and route handlers, and `Playwright` end-to-end coverage for key user journeys.
- [ ] Validate the implementation with linting, typechecking, test runs, and deployment smoke checks before release.
