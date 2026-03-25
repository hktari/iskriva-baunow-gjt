# Deployment Workflow

This document describes the preview deployment workflow for the Baunow GJT application using Vercel and Neon.

## Architecture

```
Production (production branch)          Preview (feature branch)
┌─────────────────────┐          ┌─────────────────────┐
│ Vercel Production   │          │ Vercel Preview      │
│ neondb (production)       │          │ neondb (preview)    │
└─────────────────────┘          └─────────────────────┘
```

## Prerequisites

### 1. Install Required Tools

```bash
# Install Vercel CLI globally
npm install -g vercel

# Install Neon CLI globally
npm install -g neonctl
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Neon project ID:

```bash
NEON_PROJECT_ID=your-neon-project-id
```

To find your Neon project ID:

```bash
neonctl projects list
```

### 3. Configure Vercel Environment Variables

Set up environment variables in Vercel for each environment:

#### Preview Environment

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `DATABASE_URL` for **Preview** environment
4. Use the connection string from your Neon `preview` branch

#### Production Environment

1. Add `DATABASE_URL` for **Production** environment
2. Use the connection string from your Neon `production` branch

To get connection strings:

```bash
# Preview branch
neonctl connection-string preview --project-id $NEON_PROJECT_ID

# production branch
neonctl connection-string production --project-id $NEON_PROJECT_ID
```

## Workflow

### Step 1: Create Preview Branch (First Time Only)

Create a fixed `preview` branch in Neon that will be used for all preview deployments:

```bash
pnpm db:reset-preview
```

This will:

- Delete existing preview branch (if any)
- Create new preview branch from production (production)
- Give you a fresh copy of production data

### Step 2: Deploy to Preview

Deploy your application to Vercel preview environment:

```bash
pnpm deploy:preview
```

This will:

- Build and deploy to Vercel preview
- Output the preview URL
- Save the URL for testing

### Step 3: Run E2E Tests Against Preview

Run Playwright tests against the preview deployment:

```bash
pnpm test:e2e:preview
```

Or specify a custom URL:

```bash
pnpm test:e2e:preview https://your-preview-url.vercel.app
```

To reset the database before testing:

```bash
RESET_DB=true pnpm test:e2e:preview
```

### Step 4: Promote to Production

If all tests pass, deploy to production:

```bash
pnpm deploy:prod
```

This will:

- Ask for confirmation
- Deploy to Vercel production
- Clean up preview URL file

## Available Scripts

| Script                        | Description                                         |
| ----------------------------- | --------------------------------------------------- |
| `pnpm deploy:preview`         | Deploy to Vercel preview environment                |
| `pnpm test:e2e:preview [url]` | Run E2E tests against preview deployment            |
| `pnpm deploy:prod`            | Deploy to Vercel production (requires confirmation) |
| `pnpm db:reset-preview`       | Reset preview database to production state          |

## Complete Workflow Example

```bash
# 1. Create/reset preview branch (first time or when you need fresh data)
pnpm db:reset-preview

# 2. Deploy to preview
pnpm deploy:preview

# 3. Run tests against preview
pnpm test:e2e:preview

# 4. If tests pass, deploy to production
pnpm deploy:prod
```

## Troubleshooting

### Preview deployment fails

Check that:

- Vercel CLI is installed and authenticated: `vercel whoami`
- You're in the correct project directory
- Your code builds successfully: `pnpm build`

### Tests fail on preview

Check that:

- Preview URL is accessible
- Database connection is configured in Vercel
- Preview database has the correct schema: run migrations if needed

### Database reset fails

Check that:

- `NEON_PROJECT_ID` and `NEON_API_KEY` are set
- Neon CLI is installed: `neonctl --version`
- You have permissions to manage branches in Neon

### Can't get connection string

```bash
# List all branches
neonctl branches list --project-id $NEON_PROJECT_ID

# Get connection string for a specific branch
neonctl connection-string <branch-name> --project-id $NEON_PROJECT_ID
```

## Best Practices

1. **Always test on preview before production**
   - Run full E2E test suite
   - Verify critical user flows
   - Check for console errors

2. **Keep preview database in sync**
   - Reset preview database regularly
   - Use production data for realistic testing
   - Seed with test users if needed

3. **Monitor deployments**
   - Check Vercel deployment logs
   - Monitor Sentry for errors
   - Verify database connections

4. **Clean up**
   - Preview URL file is automatically cleaned after production deployment
   - Consider cleaning up old preview deployments in Vercel

## CI/CD Integration (Future)

This workflow can be automated with GitHub Actions:

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    branches: [production]

jobs:
  deploy-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Preview
        run: pnpm deploy:preview
      - name: Run E2E Tests
        run: pnpm test:e2e:preview
```

## Security Notes

- Never commit API keys or connection strings
- Use environment variables for all secrets
- Rotate API keys regularly
- Limit preview branch access to team members
- Monitor preview deployments for suspicious activity
