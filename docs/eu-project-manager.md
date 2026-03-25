# EU Project Manager — Production Full-Stack Build

## Context

- **Project**: EU Project Manager — web-based project management + analytics for European project managers
- **Type**: BUILD FROM SCRATCH (greenfield — only SPEC.md, PLAN.md, and a figma-prototype reference app exist)
- **Workspace**: Monorepo at `iskriva-baunow-gjt/apps/baunow-gjt` with sibling `figma-prototype` app as UI reference
- **Existing Prototype**: React SPA (Vite + React Router) with mock data, shadcn/ui, Recharts — fully functional UI reference
- **Goal**: Convert prototype into production-ready full-stack Next.js app with real auth, database, and observability

## Requirements (from SPEC.md + PLAN.md)

### Core Stack (confirmed in PLAN.md)

- **Framework**: Next.js App Router + TypeScript
- **Database**: Prisma ORM + PostgreSQL (EU-hosted)
- **Auth**: Auth.js (NextAuth v5)
- **UI**: shadcn/ui + Tailwind CSS + Recharts
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm
- **Toasts**: sonner
- **Icons**: lucide-react
- **Deployment**: Vercel (EU region)
- **Observability**: Pino (structured logging), Sentry (error tracking)
- **Testing**: Vitest + React Testing Library + Playwright

### Roles & Permissions

- `viewer`: Read-only access to all projects, analytics, data
- `editor`: All viewer + create/edit/delete projects and KPIs
- `super_user`: All editor + user management, field configuration, admin panel

### Key Functional Areas (from SPEC.md sections)

1. **Project List** (home `/`): Search, advanced filters, favorites, project cards with primary KPI highlights
2. **Project Detail** (`/project/:id` + `/project/new`): View/edit mode, tabbed layout (Overview + KPIs), inline KPI editing
3. **Analytics** (`/analytics`): General + Organization tabs, 7 chart types with Recharts, localStorage persistence
4. **News** (`/news`): Static/mock content feed
5. **Methodology** (`/methodology`): Static methodology framework
6. **Login** (`/login`): Auth.js credentials + demo accounts
7. **Admin Panel** (`/users`): User management table, field configuration with EnumEditor

### Data Model Entities

- Users (with roles, org membership)
- Organizations
- Projects (with rich metadata)
- KPIs (linked to projects, primary KPI system)
- Favorites (per-user)
- Configurable Enums (project types, investment types, organizations, KPI units)
- Audit Events
- Sessions (Auth.js)

### Cross-Cutting Concerns

- European number formatting (de-DE locale, space thousands, comma decimals)
- Favorites system (per-user, persistent in DB)
- Primary KPI system (one per project, displayed on cards)
- Toast notifications (sonner)
- Responsive design (desktop + tablet + mobile)
- Unauthenticated users can browse projects + general analytics

## Technical Decisions

### Architecture Pattern

- Next.js App Router with route groups: `(public)`, `(auth)`, `(app)`
- Feature-first folder structure under `src/features/`
- Server Actions for mutations
- Server Components for data fetching
- Thin route pages delegating to feature components

### Auth Strategy

- Auth.js v5 with Credentials provider (demo login)
- JWT session strategy (simpler for v1)
- Middleware-based route protection
- Server-side role checks in server actions

### Database

- Prisma with PostgreSQL
- Organization = single per user in v1 (per PLAN.md question)
- Configurable enums stored in DB table (not hardcoded)
- Audit events table for sensitive mutations

### From Existing Prototype (reference patterns)

- 13 mock projects with realistic KPI data
- 3 demo users: viewer@example.com, editor@example.com, admin@example.com
- shadcn/ui components already defined (can reuse patterns)
- European number formatting utilities (formatters.ts)
- Complete route map and nav structure

## Resolved Decisions (User Confirmed)

1. **Auth**: Email Magic Link via Auth.js Email provider (passwordless). NO demo buttons in prod — accounts created by super users via admin panel. Email service: Resend.
2. **Org Membership**: Single org per user (simple FK). Matches prototype.
3. **EU Data Residency**: EU region DB + deployment. No strict GDPR compliance scope.
4. **Test Strategy**: Tests after implementation. Vitest + RTL + Playwright setup early, then tests alongside features.
5. **Favorites**: DB-backed favorites with Favorite table (userId + projectId). Persists across sessions.
6. **Slovenian Text**: English only. Replace all Slovenian field labels and KPI indicator names with English equivalents.
7. **News**: Static mock content. No editable news. RSS/real feeds explicitly out of scope.

## Resolved from Metis Review

8. **Email Service**: Resend (free tier 100/day, great Next.js integration)
9. **Demo Buttons**: NO demo buttons in production. All accounts created by super users via admin panel invite flow.
10. **Enum Deletion**: Prevent deletion if value is in use (show "Cannot remove: used by N projects"). Super user must reassign first.
11. **DB Provider**: Neon PostgreSQL (EU region). Connection string via env var — plan stays DB-agnostic at config level.
12. **Standalone App**: No shared monorepo packages. Copy shadcn/ui components directly into production app.
13. **MUNICIPALITIES_BY_COUNTRY**: Drop from production (unused in prototype pages).
14. **MUI/motion deps**: Do NOT carry to production. Dead dependencies in prototype.
15. **Form Validation**: Simple server-action validation with Prisma constraints. No react-hook-form/zod complexity for v1.
16. **KPI Division by Zero**: Handle targetValue=0 → show "N/A" instead of percentage.
17. **Number Formatting**: Standardize on custom formatNumber function (matching prototype's formatters.ts pattern), not Intl.NumberFormat for KPIs.
18. **User Invitation Flow**: Super user enters email+name+role → system creates user record with "pending" status → sends magic link email via Resend → user clicks link → status becomes "active".

## Scope Boundaries

### INCLUDE (from PLAN.md)

- Production baseline architecture, app structure
- Authentication and authorization (Auth.js + RBAC)
- Project and KPI management (full CRUD)
- Analytics dashboards (General + Organization)
- Admin configuration (users + field enums)
- Deployment + observability setup
- Project deletion UI
- Automated testing

### EXCLUDE (from PLAN.md)

- File attachments
- Exports (PDF/CSV)
- Real-time collaboration
- RSS/news ingestion
- Audit log UI
- Advanced historical KPI analytics
- Pagination
- External integrations beyond core auth + DB

## Research Findings

- Figma prototype has 66 source files, complete shadcn/ui component library
- Prototype uses React Router (not Next.js) — routing architecture must be reimagined for App Router
- Prototype uses React Context (AuthContext + ProjectContext) — will migrate to server-side data + server actions
- Mock data provides excellent seed data baseline (13 projects, 21 KPIs, 4 orgs, 3 users)
- European number formatting already implemented in `formatters.ts` — can adapt for server-side use
