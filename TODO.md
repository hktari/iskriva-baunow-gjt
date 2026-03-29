# TODO

[] Fix build warning
Building: ⚠ The Next.js plugin was not detected in your ESLint configuration. See https://nextjs.org/docs/app/api-reference/config/eslint#migrating-existing-config

[] fix deployment workflow: preview deployment, e2e test, promote to production

[x] test phase 4 implementation

[x] review logging and error handling. Should utilize production patterns to ensure proper error tracking and monitoring.

[ ] configure Sentry and logging

## Operations

dangerous commands once in production:

- pnpm prisma db push --force-reset --accept-data-loss && pnpm prisma db seed

### takeaways

- should not keep production config locally
- should configure MCPs and neonctl, vercel CLI accordingly to prevent agent from making production changes

- prevent agent from reading or editing .env files
