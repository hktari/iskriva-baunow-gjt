// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring - normalized by environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Enable in production and preview/staging if configured
  enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_ENABLED === 'true',

  // Environment
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,

  // Baseline tags for all events
  initialScope: {
    tags: {
      service: 'baunow-gjt',
      runtime: 'server',
    },
  },
  // Enable logs to be sent to Sentry
  enableLogs: true,
  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
