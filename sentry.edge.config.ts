import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring - normalized by environment
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Edge runtime has limited debugging
  debug: false,

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
      runtime: 'edge',
    },
  },

  // Ignore common errors that are not actionable
  ignoreErrors: ['NEXT_NOT_FOUND', 'NEXT_REDIRECT'],
});
