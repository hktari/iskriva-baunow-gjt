// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring - normalized by environment
  tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

  // Edge runtime has limited debugging
  debug: false,

  // Enable in production and preview/staging if configured
  enabled: environment === 'production' || process.env.SENTRY_ENABLED === 'true',

  // Environment
  environment: environment,

  // Release tracking
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,

  // Baseline tags for all events
  initialScope: {
    tags: {
      service: 'baunow-gjt',
      runtime: 'edge',
    },
  },

  // Ignore common errors that are not actionable
  ignoreErrors: ['NEXT_NOT_FOUND', 'NEXT_REDIRECT'],

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
