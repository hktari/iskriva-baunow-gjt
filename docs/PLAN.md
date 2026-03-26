# PLAN

Build the EU Project Manager as a production-ready full-stack web app using a modular Next.js architecture. Start by establishing the platform foundations first (app shell, database, auth, RBAC, observability), then implement the core CRUD and analytics flows in the same order the product depends on them.

## Scope

- In: production baseline architecture, app structure, authentication and authorization, project and KPI management, analytics dashboards, admin configuration, deployment and observability setup, automated testing
- Out: file attachments, exports, real-time collaboration, RSS/news ingestion, audit log UI, advanced historical KPI analytics, project deletion UI, pagination, integrations beyond core auth and database

## Action Items (status updated after codebase review)

- [x] Scaffold a `Next.js` App Router project with `TypeScript`, `Tailwind CSS`, `shadcn/ui`, `pnpm`, and strict lint/typecheck configuration. (Implemented — see `package.json`, `next.config.ts`, `tsconfig.json`, `components.json`)
- [~] Establish the base folder structure under `src/app`, `src/features`, `src/shared`, `src/server`, `prisma`, and `tests` to keep routes thin and domain logic feature-first. (Mostly implemented — `src/app`, `src/shared`, `src/server`, `prisma`, and `tests` exist; `src/features` folder not present)
- [x] Define the Prisma schema for users, sessions, organizations, projects, KPIs, favorites, configurable lookup tables, and audit events. (Implemented — `prisma/schema.prisma`)
- [x] Add seed data for demo accounts, configurable field values, and representative project/KPI records aligned with `SPEC.md`. (Implemented — `prisma/seed.ts`)
- [x] Implement authentication with `Auth.js`, demo login shortcuts, session handling, and role-based authorization for `viewer`, `editor`, and `super_user`. (Implemented using `next-auth` with Prisma adapter and credentials provider — see `src/server/auth/*`)
- [x] Build the global layout, public navigation, responsive shell, and route groups for public pages, auth pages, and authenticated app pages. (Implemented — see `src/app/layout.tsx` and route groups `(auth)` / `(app)`)
- [x] Implement the project list page with search, advanced filters, favorites, results count, empty states, and project cards with primary KPI highlights. (Implemented — see `src/shared/components/projects/*` and `src/app/(app)/page.tsx`)
- [~] Implement the project detail flow for read mode, create/edit mode, additional metadata fields, KPI management, inline KPI editing, and primary KPI selection. (Mostly implemented — detail, new/edit pages and `kpi` actions exist; verify inline editing UX as needed)
- [x] Build the analytics area with general and organization dashboards, chart toggles persisted to `localStorage`, and reusable aggregation services. (Implemented — see `src/app/(app)/analytics/*`, `src/shared/lib/analytics-storage.ts`, and `src/server/actions/analytics.ts`)
- [x] Implement the super-user admin panel for user management and configurable field values with duplicate prevention and audit logging. (Implemented — see `src/app/(app)/users/*`, `src/app/(app)/fields/*`, and audit log usage in server actions)
- [~] Add structured logging with `Pino`, request IDs, error tracking with `Sentry`, and production-safe audit/event capture for sensitive mutations. (Partially implemented — `pino` logger and Sentry configs present; request-id middleware is not obvious and should be added if required)
- [~] Configure deployment on `Vercel` with EU-hosted Postgres, environment variable templates, preview deployments, and production rollout settings. (Partially implemented — `vercel.json` + deploy scripts exist; environment/template and explicit EU-hosting are documented but require infra setup)
- [x] Add automated tests with `Vitest`, `React Testing Library`, integration coverage for server actions and route handlers, and `Playwright` end-to-end coverage for key user journeys. (Implemented — see `tests/` and `package.json` test scripts)
- [~] Validate the implementation with linting, typechecking, test runs, and deployment smoke checks before release. (Tooling present — `npm`/`pnpm` scripts for `lint`, `typecheck`, `test` exist; recommend running these in CI and resolving any remaining warnings)

Notes:

- Files referenced as evidence: `package.json`, `prisma/schema.prisma`, `prisma/seed.ts`, `src/server/auth/config.ts`, `src/app/layout.tsx`, `src/shared/components/projects/project-list-client.tsx`, `src/shared/lib/logger.ts`, `sentry.server.config.ts`, `vercel.json`, `tests/e2e/*`.
- Items marked `~` are partially implemented or need a small follow-up (paths and specifics noted above).

## Outstanding Issues (actionable issues & subtasks)

1. Issue: Inline KPI editing — tests & validation (priority: high)
   - Goal: Add robust server-side validation and automated tests for inline KPI edits on project detail pages.
   - Files to update: `src/server/actions/kpis.ts`, `src/app/(app)/project/[id]/page.tsx`, `src/shared/components/projects/*` (inline editors).
   - Subtasks:
     - Add Zod schemas for KPI payloads and validate inputs in every KPI-related server action. (example: `kpiCreateSchema`, `kpiUpdateSchema`)
     - Return structured validation errors from server actions and show friendly client UI messages.
     - Add unit tests for server action validation (Vitest): `tests/server/actions/kpis.test.ts`.
     - Add Playwright e2e test for inline KPI edit flows (save, cancel, validation error): update `tests/e2e/project-crud.spec.ts` or add `tests/e2e/kpi-inline-edit.spec.ts`.
     - Ensure `revalidatePath()` calls revalidate project and analytics views after edits.

2. Issue: Request-id propagation & observability (priority: high)
   - Goal: Generate and propagate per-request IDs, attach to logs/audit entries and Sentry events.
   - Files to update: `src/middleware.ts`, `src/shared/lib/logger.ts`, `src/server/actions/*` (where `auditLog.create` is called), `sentry.server.config.ts`.
   - Subtasks:
     - Add or extend `src/middleware.ts` to generate `x-request-id` and set response header.
     - Use `logger.child({ requestId })` in request handlers and server actions; include `requestId` in audit log records.
     - Attach request id as a Sentry tag/context before capturing exceptions.
     - Add an integration e2e smoke test to assert `x-request-id` header and presence in logs (or mock logger in tests).

3. Issue: Feature-first folder scaffold (priority: medium)
   - Goal: Introduce `src/features/*` and migrate domain code to keep `src/app` as routing layer only.
   - Files to create/move: new `src/features/projects/{client,server,components}/`, `src/features/analytics/`, `src/features/users/` and `index.ts` per feature.
   - Subtasks:
     - Scaffold `src/features/projects` and move project components and server actions, leaving `page.tsx` in `src/app` and updating imports.
     - Add `src/features/<feature>/index.ts` public API to avoid deep imports.
     - Run `pnpm run typecheck` and `pnpm run lint` and fix import issues; add tests to confirm behavior.

4. Issue: Prevent accidental server imports in client components (priority: medium)
   - Goal: Add checks to prevent importing server-only modules (Prisma, `next/cache`, `revalidatePath`, `@auth/prisma-adapter`) into files marked `use client`.
   - Options / Subtasks:
     - Add ESLint `no-restricted-imports` rules to ban server-only modules from client paths; or
     - Add a lightweight check script run in CI that greps for server-only imports inside files containing `'use client'` and fails the build.
     - Add documentation in `CONTRIBUTING.md` about client/server boundaries and examples.

5. Issue: Deployment checklist & environment templates (priority: medium)
   - Goal: Make preview and production deploys repeatable and safe with EU-hosted DB and migration strategy.
   - Files to add/update: `.env.example`, `scripts/deploy-preview.sh`, `scripts/deploy-prod.sh`, CI workflow (e.g., `.github/workflows/ci.yml`).
   - Subtasks:
     - Create `.env.example` listing required env vars and notes about secrets (DATABASE_URL, NEXTAUTH_SECRET, SENTRY_DSN, etc.).
     - Ensure production deployment uses `prisma migrate deploy` (not `migrate dev`) and preview runs a safe seed strategy or uses disposable DB.
     - Add a deployment smoke test step to CI (build, run migrations, run basic e2e smoke tests against preview).

6. Issue: Audit log enrichment & privacy (priority: low)
   - Goal: Ensure audit logs consistently include `requestId`, `userId` (when available), and do not leak sensitive data.
   - Subtasks:
     - Update server actions to populate `userId`, `userEmail`, and `requestId` when calling `db.auditLog.create`.
     - Review auditLog `metadata` writes and redact or avoid storing plain-text secrets.
     - Add tests for audit log entries where relevant.

7. Issue: CI — validate lint/typecheck/tests/e2e on PRs (priority: high)
   - Goal: Enforce quality gates on each PR to avoid regressions.
   - Subtasks:
     - Add GitHub Actions workflow to run `pnpm install`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run test` (unit), and Playwright e2e for key flows (can be staged behind flags).
     - Fail PRs on lint/type errors and surface results as checks.

Implementation note: I can create the issue branches and open PR-style branches locally with the changes; tell me which issue to start with and I will implement it, run typecheck and tests locally, and push the branch (or prepare patches here).
