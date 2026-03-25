# EU Project Manager - Product Specification

**Version:** 1.0
**Date:** 2026-03-23
**Status:** Baseline for production implementation

---

## 1. Product Overview

**EU Project Manager** is a web-based project management and analytics platform designed for European project managers. It enables centralized tracking, analysis, and reporting of project KPIs, investment costs, and environmental indicators (e.g., CO2 reduction) across a multi-country portfolio.

### 1.1 Target Users

- European project managers and programme officers
- Organization-level administrators tracking portfolio performance
- Super users responsible for platform configuration and user management

### 1.2 Key Value Propositions

- Centralized KPI tracking with target/achieved monitoring and progress visualization
- Multi-country portfolio management with advanced filtering
- Environmental impact indicators (CO2 reduction, energy savings, renewable energy)
- Organization-level analytics and benchmarking
- Role-based access control (Viewer, Editor, Super User)
- Configurable field enums managed by super users

---

## 2. User Roles & Permissions

### 2.1 Role Definitions

| Role           | Code         | Permissions                                                                                                                   |
| -------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| **Viewer**     | `viewer`     | Read-only access to all projects, analytics, and data. Cannot create, edit, or delete anything.                               |
| **Editor**     | `editor`     | All Viewer permissions + create/edit/delete projects and KPIs. Cannot manage users or system configuration.                   |
| **Super User** | `super_user` | All Editor permissions + user management, invitations, field configuration (enum editing), and all administrative operations. |

### 2.2 Role-Specific UI Behavior

- **Unauthenticated users:** Can browse the project list (read-only), view project details, view General Analytics, News, and Methodology. No favorites, no Organization Analytics, no editing.
- **Authenticated (any role):** Favorites toggle, Organization Analytics tab (populated from user's organization), internal notes visibility.
- **Editor + Super User:** "Add New Project" button, "Edit Project" button, "Add KPI" button, inline KPI editing, KPI deletion.
- **Super User only:** "Admin Panel" navigation item visible, user management, field configuration.

### 2.3 User Properties

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'viewer' | 'editor' | 'super_user';
  organization?: string;
}
```

---

## 3. Data Model

### 3.1 Project

```typescript
interface Project {
  id: string;
  name: string; // Required
  country: string; // Required, from PROJECT_COUNTRIES enum
  projectType: string; // Required, from configurable PROJECT_TYPES enum
  investmentType?: string; // Optional, from configurable INVESTMENT_TYPES enum
  projectValue: number; // Required, in EUR
  investmentCosts?: number; // Optional, in EUR
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  startDate: string; // Required, ISO date
  endDate?: string; // Optional, ISO date
  description: string; // Required
  lastEdited?: string; // Auto-updated timestamp
  kpis: KPI[]; // Array of KPI objects
  organization?: string; // Optional, from configurable ORGANIZATIONS enum

  // Extended optional fields
  note?: string; // Internal note, visible only to authenticated users
  projectManager?: string; // Project Manager name
  contact?: string; // Contact email
  projectWebsite?: string; // Project website URL
  program?: string; // From PROGRAMS enum
  targetGroup?: string[]; // Multi-select from TARGET_GROUPS enum
  impact?: string[]; // Multi-select from IMPACT_AREAS enum
}
```

### 3.2 KPI

```typescript
interface KPI {
  id: string;
  indicatorName: string; // From KPI_INDICATORS list or custom entry
  targetValue: number;
  valueAchieved: number;
  unit: string; // From configurable KPI_UNITS enum
  updated?: string; // Free-text date (e.g., "Q1/2025", "02/2025")
  decimals: boolean; // Whether to display decimal places
  thousandSeparators: boolean;
  isPrimary?: boolean; // At most one KPI per project can be primary
}
```

### 3.3 KPI Indicator Metadata

Certain predefined KPI indicators carry metadata displayed as a contextual info panel in the "Add KPI" dialog:

```typescript
interface KPIIndicatorMeta {
  formula?: string; // Calculation formula
  target?: string; // Recommended target value/range
  description?: string; // What the indicator measures
}
```

**Indicators with metadata:**

- Fulfilment of contractual obligations
- Timeliness of project implementation
- Sustainability of project results
- Financial implementation rate

### 3.4 Configurable Enums

These lists are editable by super users via the Admin Panel > Field Configuration:

| Enum                 | Default Values                                                                                                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project Types**    | Energy Efficiency, Renewable Energy, Buildings, Energy systems / Smart energy, Sustainable Transport, Environmental Protection, Water Management, Waste Management, Circular economy, Climate adaptation, Education, Emission reduction (CO2) |
| **Investment Types** | Public Grant, Private Investment, Public-Private Partnership, EU Structural Funds, ERDF, Cohesion Fund, LIFE Programme                                                                                                                        |
| **Organizations**    | Nordic Green Alliance, Central EU Energy Partners, Mediterranean Climate Action, EcoUrban Consortium                                                                                                                                          |
| **KPI Units**        | EUR, MWh/year, %, tonnes/year, tonnes CO2/year, % CO2/year, persons, km2, km, m3/year, kW, MW                                                                                                                                                 |

### 3.5 Static Enums (not user-configurable)

| Enum               | Values                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Countries**      | Albania, Andorra, Armenia, Austria, Azerbaijan, Belarus, Belgium, Bosnia and Herzegovina, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Georgia, Germany, Greece, Hungary, Iceland, Ireland, Italy, Kazakhstan, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Moldova, Monaco, Montenegro, Netherlands, North Macedonia, Norway, Poland, Portugal, Romania, Russia, San Marino, Serbia, Slovakia, Slovenia, Spain, Sweden, Switzerland, Turkey, Ukraine, United Kingdom, Vatican City                                                                                                                                              |
| **Statuses**       | planning, in_progress, completed, on_hold                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Programs**       | Interreg, Horizon, LIFE, Nacionalni, Regionalni                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Target Groups**  | Municipalities, SMEs, Citizens, Public authorities, Industry                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Impact Areas**   | Decarbonisation, Energy transition, Smart Energy (Energy systems), Climate adaptation, Just transition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **KPI Indicators** | Amount of subsidies, Financial savings per year, Renewable energy produced per year, Energy saved per year, Percentage energy saved per year, CO2eq reduction per year, Percentage CO2eq reduction per year, Number of educated persons, Number of beneficiaries, Number of jobs created, Restored or Protected natural area, Reduction in energy consumption, Infrastructure length (km), Water saved per year, Waste reduction per year, Fulfilment of contractual obligations, Timeliness of project implementation, Sustainability of project results, Financial implementation rate, Number of organizations included, Population reach, Number of adopted solutions |

---

## 4. Pages & Functional Requirements

### 4.1 Global Layout

**Route:** All pages wrapped in `<Layout />`

#### FR-LAYOUT-01: Sticky Header

- App logo (blue icon + "EU Project Manager" + "European Project Analytics" subtitle)
- Horizontal navigation: Projects, Analytics, News, Methodology
- Admin Panel nav item visible only to super users
- User info area: name, role badge, avatar initial, Logout button (when authenticated)
- Login button (when unauthenticated)

#### FR-LAYOUT-02: Mobile Navigation

- Horizontal scrollable nav bar below header on screens < md breakpoint

#### FR-LAYOUT-03: Footer

- Copyright notice
- "Mock Authentication Active" label
- "Edit Mode" badge when user has edit permissions

---

### 4.2 Project List (Home)

**Route:** `/`

#### FR-PL-01: Landing Banner

- Gradient banner describing the platform purpose
- Feature pills: "KPI tracking & target monitoring", "Multi-country portfolio management", "Environmental impact indicators", "Organisation-level analytics"

#### FR-PL-02: Search

- Text search input with search icon, filters projects by name (case-insensitive substring match)

#### FR-PL-03: Advanced Filters (Collapsible Accordion)

- Toggle button labeled "Advanced Filters" with active indicator badge
- Filter fields (all default to "All"):
  - Country (select)
  - Project Type (select, uses configurable enum)
  - Investment Type (select, uses configurable enum)
  - Status (select)
  - Organization (select, uses configurable enum)
  - Project Value Range (min/max number inputs, EUR)
- "Clear all filters" button when any filter is active

#### FR-PL-04: Favorites Filter

- Button in header area (authenticated users only)
- Toggles filter to show only favorited projects
- "Favorites only" badge shown in results area when active

#### FR-PL-05: Results Count

- Shows "Showing X of Y projects"

#### FR-PL-06: Project Cards (Grid)

- 2-column grid on large screens, 1-column on small
- Each card displays:
  - Project name (truncated)
  - Subtitle: Country, Organization (with Building2 icon), Project Type
  - Heart icon for favorites (authenticated users only, click to toggle)
  - Status badge (color-coded: planning=outline, in_progress=default, completed=secondary, on_hold=destructive)
  - Description (2-line clamp)
  - **Primary KPI highlight** (blue background): indicator name, achieved/target value with unit, percentage
  - If no primary KPI: dashed placeholder "No primary KPI selected"
  - Project Value and Investment Costs
  - Investment Type
  - Date range
  - "View Details" button linking to project detail

#### FR-PL-07: Empty State

- "No projects found matching your filters" message with clear filters button

#### FR-PL-08: Add New Project

- Button visible to editors and super users
- Navigates to `/project/new`

---

### 4.3 Project Detail

**Route:** `/project/:id` (existing project) or `/project/new` (new project)

#### FR-PD-01: Header

- Back button (returns to project list)
- Project name (or "New Project")
- Favorites heart toggle (authenticated, existing projects only)
- Subtitle: Country, Organization, Project Type
- Edit Project / Save / Cancel buttons (editors and super users)

#### FR-PD-02: Tabbed Layout

Two tabs: **Overview** and **KPIs (count)**

#### FR-PD-03: Overview Tab - Project Details Card

Editable fields (in edit mode, form controls; in view mode, text display):

- Project Name (text input, full width)
- Country (select from PROJECT_COUNTRIES)
- Organization (select from configurable enum, optional, with tooltip explaining analytics grouping)
- Project Type (select from configurable enum)
- Investment Type (select from configurable enum, optional)
- Status (select from statuses)
- Project Value EUR (number input, with tooltip showing value formula)
- Investment Costs EUR (number input, optional)
- Start Date (date input)
- End Date (date input, optional; displays "Ongoing" if empty)
- Description (textarea, full width)
- Last Edited timestamp (read-only, existing projects only)

#### FR-PD-04: Overview Tab - Additional Information Card

Optional fields in a separate card titled "Additional Information":

- Programme (select from PROGRAMS)
- Project Manager / Vodja projekta (text input)
- Contact e-mail (email input; in view mode renders as mailto link)
- Project Website (URL input; in view mode renders as external link)
- Target Group (multi-select toggle chips from TARGET_GROUPS)
- Impact Areas (multi-select toggle chips from IMPACT_AREAS)
- Internal Note (textarea, **visible only to authenticated users**, with lock badge)

#### FR-PD-05: KPIs Tab - KPI List

- Header with "Add KPI" button (editors/super users)
- Hint text: "Click the star to set a KPI as primary" (authenticated users)
- 2-column card grid of KPI cards
- Each KPI card shows:
  - Star icon (filled blue if primary) with set/unset primary action
  - Indicator name
  - Updated date
  - Target value with unit
  - Achieved value with unit
  - Progress bar with percentage
  - Color coding: green (>100%), blue (80-100%), red (<80%)
  - Trend icons (TrendingUp for >100%, TrendingDown for <80%)
  - Edit button (pencil icon, editors/super users) - inline editing of target/achieved values
  - Delete button (trash icon, editors/super users)
- Primary KPI card has blue ring highlight

#### FR-PD-06: Add KPI Dialog

Modal dialog with fields:

- **Indicator Name:** Select dropdown with two modes:
  - **Predefined:** Choose from KPI_INDICATORS list
  - **Custom:** Select "Custom KPI (enter manually)" option, then type custom name in text input
- **KPI Indicator Metadata Panel:** When a predefined indicator has metadata, display blue info panel with description, formula, and target
- Target Value (number)
- Value Achieved (number)
- Unit (select from configurable KPI_UNITS)
- Updated Date (free text, e.g., "Q2/2025")
- Checkboxes: "Use decimals", "Use thousand separators"

#### FR-PD-07: Inline KPI Editing

- Click pencil icon to enter edit mode on individual KPI card
- Edit target value and achieved value inline
- Save/Cancel buttons

#### FR-PD-08: Primary KPI

- Click star icon on any KPI to set it as primary (toggles; only one per project)
- Primary KPI is displayed on the project card in the project list
- Toast notification on set/unset

#### FR-PD-09: New Project Creation

- Route `/project/new` pre-fills empty form in edit mode
- Create Project button at bottom
- Cancel returns to project list

---

### 4.4 Analytics Dashboard

**Route:** `/analytics`

#### FR-AN-01: Two-Tab Layout

- **General Analytics:** Available to all users
- **Organization Analytics:** Requires authentication (shows login prompt for unauthenticated users)

#### FR-AN-02: General Analytics - Filters

- Country select
- Project Type select
- Favorites only toggle (authenticated users)
- Clear button
- Project count display

#### FR-AN-03: General Analytics - Key Metrics

Three summary cards:

- Total Projects (count + number of countries)
- Total Project Value (EUR, formatted)
- Total Investment Cost (EUR, formatted)

#### FR-AN-04: General Analytics - Charts

All built with Recharts:

1. **Projects by Country** (Bar chart, full width) - count per country
2. **Project Status** (Pie chart) - status breakdown with labels
3. **Investment by Project Type** (Dual-axis bar chart) - value in M EUR + count
4. **KPI Performance Overview** (Horizontal bar chart) - average achievement % per indicator, with custom tooltip showing total achieved value and project count
5. **Environmental Impact** (Horizontal bar chart) - total achieved for CO2 reduction, renewable energy, energy saved
6. **Value vs. Performance** (Scatter chart) - investment (M EUR) vs avg KPI %, color-coded by status with legend
7. **Top Performing Projects** (Ranked list) - top 5 by average KPI achievement, showing rank, name, country, KPI count, percentage

#### FR-AN-05: Organization Analytics - Organization Selector

- Dropdown to select organization (pre-filled from user's organization)
- Chart customization: toggle which charts to show (persisted to localStorage)

#### FR-AN-06: Organization Analytics - Charts

Same chart types as general analytics but filtered to selected organization:

1. Project Status Distribution (Pie)
2. Investment by Project Type (Dual-axis bar)
3. KPI Performance (Horizontal bar with custom tooltip)
4. Value vs. Performance (Scatter)
5. Top Performing Projects (Ranked list)

#### FR-AN-07: Organization Analytics - Persistence

- Selected organization persisted to `localStorage` key `analytics_org`
- Enabled chart toggles persisted to `localStorage` key `analytics_org_charts`

---

### 4.5 News

**Route:** `/news`

#### FR-NEWS-01: News Feed

- Header with title and description
- Info card explaining this is an aggregated feed (mock data in prototype)
- Category filter badges (All, Funding, Energy, Environment, Innovation, Policy, Urban, Social, Case Study) - visual only in prototype
- List of news cards with: category badge, date, title, source, summary, "Visit Source" button (opens external URL)

#### FR-NEWS-02: Key Sources

- Card listing major European funding programs and regional/social sources

---

### 4.6 Methodology

**Route:** `/methodology`

#### FR-METH-01: Methodology Framework

- Overview card with key stats (5 Phases, KPI-Driven, EU Compliant)
- Five phase cards with color-coded left border:
  1. Planning & Initiation (blue)
  2. Design & Development (purple)
  3. Implementation (green)
  4. Monitoring & Control (orange)
  5. Closure & Evaluation (red)
- Each phase shows: key activities (checklist) and deliverables

#### FR-METH-02: KPI Integration Section

- Four-card grid: Baseline Measurement, Continuous Monitoring, Interim Evaluation, Final Assessment

#### FR-METH-03: Best Practices Section

- Grid of best practices: Stakeholder Engagement, Risk Management, Documentation, Sustainability Planning

---

### 4.7 Login

**Route:** `/login`

#### FR-LOGIN-01: Login Form

- Email and password fields
- Sign In button
- Error display for invalid credentials
- Redirect to home if already authenticated

#### FR-LOGIN-02: Demo Accounts

- Three quick-login buttons:
  - Viewer (viewer@example.com) - Read-only
  - Editor (editor@example.com) - Can edit
  - Super User (admin@example.com) - Full access
- Any password accepted in prototype

---

### 4.8 Admin Panel (User Management)

**Route:** `/users`

#### FR-ADMIN-01: Access Control

- Page restricted to super users only
- Non-super users see "Access Restricted" message

#### FR-ADMIN-02: User Stats

- Four summary cards: Total Users, Active Users, Pending Invitations, Super Users

#### FR-ADMIN-03: Two-Tab Layout

- **Users** tab
- **Field Configuration** tab

#### FR-ADMIN-04: Users Tab - User Table

- Columns: Name, Email, Role (badge), Status (badge), Invited By, Invited At, Actions
- Actions: Edit (placeholder), Delete

#### FR-ADMIN-05: Users Tab - Invite User Dialog

- Fields: Email, Full Name, Role (select)
- Creates user with "pending" status

#### FR-ADMIN-06: Users Tab - Role Descriptions

- Card explaining Viewer, Editor, and Super User permissions

#### FR-ADMIN-07: Field Configuration Tab

- Info banner explaining the feature
- Four **EnumEditor** components, each with:
  - Title and description
  - Add new value (text input + Add button, Enter key support)
  - Current values displayed as removable chips (X button)
  - Count of configured values
  - Duplicate prevention with error toast

Configurable enums:

1. **Project Types** - Categories for project classification
2. **Investment Types** - Funding source classifications
3. **Organizations** - Organizations for project assignment and analytics grouping
4. **KPI Units** - Measurement units for KPI values

---

### 4.9 Not Found

**Route:** `*` (catch-all)

- Standard 404 page

---

## 5. Cross-Cutting Concerns

### 5.1 Number Formatting

- European convention: space for thousands separator, comma for decimals
- Currency formatted as EUR using `de-DE` locale with `Intl.NumberFormat`
- KPI values respect per-KPI `decimals` and `thousandSeparators` flags

### 5.2 Favorites System

- Per-session toggle (not persisted to backend in prototype)
- Heart icon with fill state
- Filterable in project list and analytics
- Available only to authenticated users

### 5.3 Primary KPI System

- At most one KPI per project designated as primary
- Star icon toggle on KPI cards
- Primary KPI highlighted on project list cards with blue background
- Primary KPI card has blue ring in detail view

### 5.4 Toast Notifications

- Uses `sonner` library
- Success toasts for: login, project create/update, KPI add/update/delete, primary KPI set/unset, enum add/remove, user invite/delete
- Error toasts for: login failure, duplicate enum values, missing KPI name

### 5.5 Responsive Design

- Desktop: full navigation bar, 2-column grids, side-by-side layouts
- Mobile: horizontal scrollable nav, single-column layouts, stacked cards

### 5.6 State Management

- `AuthContext`: user session, role-derived permissions (`canEdit`, `isSuperUser`)
- `ProjectContext`: project CRUD, KPI CRUD, favorites, primary KPI, configurable enums

---

## 6. Technical Architecture

### 6.1 Stack

| Layer         | Technology                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Framework     | React 18+ with TypeScript                                                                                         |
| Routing       | React Router (Data mode, `createBrowserRouter`)                                                                   |
| Styling       | Tailwind CSS v4                                                                                                   |
| UI Components | shadcn/ui (Card, Button, Input, Select, Dialog, Tabs, Badge, Table, Collapsible, Tooltip, Label, Textarea, Alert) |
| Charts        | Recharts (Bar, Pie, Scatter)                                                                                      |
| Icons         | lucide-react                                                                                                      |
| Toasts        | sonner                                                                                                            |
| State         | React Context API                                                                                                 |

### 6.2 File Structure

```
src/
  app/
    App.tsx                    # Root component with RouterProvider
    routes.tsx                 # Route definitions
    components/
      Layout.tsx               # Global layout with header/nav/footer
      EuropeMap.tsx             # (Placeholder/future use)
      ui/                      # shadcn/ui components
    contexts/
      AuthContext.tsx           # Authentication state & role helpers
      ProjectContext.tsx        # Project/KPI CRUD & configurable enums
    data/
      mockData.ts              # Type definitions, enums, mock project data
    pages/
      ProjectList.tsx           # Home page with project cards
      ProjectDetail.tsx         # Single project view/edit with KPIs
      Analytics.tsx             # Analytics dashboard (General + Organization)
      News.tsx                  # News feed
      Methodology.tsx           # Project methodology framework
      UserManagement.tsx        # Admin panel (users + field config)
      Login.tsx                 # Authentication page
      NotFound.tsx              # 404 page
    utils/
      formatters.ts             # Number, currency, date formatting utilities
  styles/
    theme.css                  # Tailwind theme tokens
    fonts.css                  # Font imports
```

### 6.3 Route Map

| Path           | Component      | Auth Required                   | Min Role          |
| -------------- | -------------- | ------------------------------- | ----------------- |
| `/`            | ProjectList    | No                              | -                 |
| `/project/:id` | ProjectDetail  | No (read); Yes (edit)           | editor (for edit) |
| `/project/new` | ProjectDetail  | Yes                             | editor            |
| `/analytics`   | Analytics      | No (General tab); Yes (Org tab) | -                 |
| `/news`        | News           | No                              | -                 |
| `/methodology` | Methodology    | No                              | -                 |
| `/users`       | UserManagement | Yes                             | super_user        |
| `/login`       | Login          | No                              | -                 |

---

## 7. User Stories

### Authentication & Authorization

- **US-AUTH-01:** As a visitor, I can browse all projects and view their details without logging in.
- **US-AUTH-02:** As a visitor, I can view the General Analytics tab without logging in.
- **US-AUTH-03:** As a user, I can log in with my email and password to access role-specific features.
- **US-AUTH-04:** As a logged-in user, I can see my name, role badge, and avatar in the header.
- **US-AUTH-05:** As a logged-in user, I can log out and return to visitor mode.

### Project Management

- **US-PROJ-01:** As an editor, I can create a new project by filling in the required fields (name, country, type, value, status, start date, description).
- **US-PROJ-02:** As an editor, I can edit all fields of an existing project.
- **US-PROJ-03:** As a viewer, I can view all project details but cannot edit them.
- **US-PROJ-04:** As a user, I can see optional extended fields (programme, project manager, contact, website, target groups, impact areas) on the project detail page.
- **US-PROJ-05:** As an authenticated user, I can see and edit internal notes on a project (not visible to unauthenticated visitors).
- **US-PROJ-06:** As a user, I can view the project value breakdown tooltip explaining the formula.

### KPI Management

- **US-KPI-01:** As an editor, I can add a KPI to a project by selecting a predefined indicator or entering a custom name.
- **US-KPI-02:** As an editor, I can edit the target and achieved values of a KPI inline.
- **US-KPI-03:** As an editor, I can delete a KPI from a project.
- **US-KPI-04:** As a user, I can see KPI progress as a percentage with a progress bar and trend indicator.
- **US-KPI-05:** As an authenticated user, I can set one KPI as the primary KPI for a project, which appears highlighted on the project card.
- **US-KPI-06:** As a user, when adding a KPI with a predefined indicator that has metadata, I can see its description, formula, and target in an info panel.
- **US-KPI-07:** As an editor, I can enter a fully custom KPI name when the predefined list does not cover my needs.

### Favorites

- **US-FAV-01:** As an authenticated user, I can mark a project as a favorite by clicking the heart icon.
- **US-FAV-02:** As an authenticated user, I can filter the project list to show only my favorites.
- **US-FAV-03:** As an authenticated user, I can filter analytics to show only favorited projects.

### Filtering & Search

- **US-FILT-01:** As a user, I can search projects by name using the search bar.
- **US-FILT-02:** As a user, I can filter projects by country, project type, investment type, status, and organization using the collapsible Advanced Filters panel.
- **US-FILT-03:** As a user, I can filter projects by minimum and maximum project value.
- **US-FILT-04:** As a user, I can clear all active filters with one click.
- **US-FILT-05:** As a user, I can see how many projects match my current filters.

### Analytics

- **US-AN-01:** As a user, I can view aggregate statistics (total projects, total value, total investment) on the General Analytics tab.
- **US-AN-02:** As a user, I can view projects by country, status distribution, investment by type, KPI performance, environmental impact, value-vs-performance scatter, and top performers.
- **US-AN-03:** As a user, I can filter General Analytics by country, project type, and favorites.
- **US-AN-04:** As an authenticated user, I can access the Organization Analytics tab and select an organization to view its dedicated dashboard.
- **US-AN-05:** As an authenticated user, my organization is pre-selected in the Organization Analytics tab based on my profile.
- **US-AN-06:** As an authenticated user, I can customize which charts appear in Organization Analytics, and my preferences persist across sessions.

### Admin Panel

- **US-ADM-01:** As a super user, I can view all platform users in a table with their name, email, role, status, and invitation details.
- **US-ADM-02:** As a super user, I can invite a new user by entering their email, name, and role.
- **US-ADM-03:** As a super user, I can delete a user from the platform.
- **US-ADM-04:** As a super user, I can add new values to configurable enums (Project Types, Investment Types, Organizations, KPI Units).
- **US-ADM-05:** As a super user, I can remove values from configurable enums.
- **US-ADM-06:** As a super user, I am prevented from adding duplicate enum values.
- **US-ADM-07:** As a non-super-user, I see an "Access Restricted" message when navigating to the Admin Panel.

### News & Methodology

- **US-NEWS-01:** As a user, I can browse a feed of European project news with categories, dates, and source links.
- **US-METH-01:** As a user, I can view the 5-phase project methodology framework with activities and deliverables.
- **US-METH-02:** As a user, I can understand how KPIs integrate across the project lifecycle.

---

## 8. Non-Functional Requirements

### 8.1 Performance

- All pages should render within 1 second on standard broadband connections.
- Analytics charts should render smoothly with up to 100 projects.

### 8.2 Responsiveness

- Full functionality on desktop (1024px+), tablet (768px+), and mobile (320px+).
- Navigation collapses to horizontal scroll on mobile.

### 8.3 Accessibility

- Semantic HTML structure.
- Color-coded elements should also have text/icon differentiation.
- Interactive elements should be keyboard-accessible.

### 8.4 Localization Considerations

- Number formatting follows European conventions (de-DE locale).
- Currency formatted as EUR.
- Some field labels are bilingual (English + Slovenian, e.g., "Vodja projekta").
- Some KPI indicator names are in Slovenian.

### 8.5 Browser Support

- Modern browsers: Chrome, Firefox, Safari, Edge (latest 2 versions).

---

## 9. Future Considerations (Out of Scope for v1)

- Backend persistence (Supabase or similar) - currently all data is in-memory/mock
- Real authentication (currently mock, any password accepted)
- File attachments on projects
- Export functionality (PDF reports, CSV export)
- Real-time collaboration / multi-user editing
- Email notifications for user invitations
- Audit logging for changes
- RSS feed integration for News page
- Europe map visualization (component exists but unused)
- Configurable Programs, Target Groups, Impact Areas, and KPI Indicators via Admin Panel (currently only Project Types, Investment Types, Organizations, and KPI Units are configurable)
- Project deletion from the UI
- Pagination for large project lists
- Advanced KPI analytics (time-series tracking, historical snapshots)
