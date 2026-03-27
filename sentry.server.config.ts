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

  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Server Error:', hint.originalException || hint.syntheticException);
      return null;
    }

    // Add custom tags
    event.tags = {
      ...event.tags,
      component_type: 'server',
    };

    // Add server context
    if (event.request) {
      event.contexts = {
        ...event.contexts,
        server: {
          node_version: process.version,
          platform: process.platform,
        },
      };
    }

    return event;
  },

  // Ignore common errors that are not actionable
  ignoreErrors: [
    // Database connection errors (handle separately)
    'ECONNREFUSED',
    'ETIMEDOUT',
    // Auth errors (expected user behavior)
    'CredentialsSignin',
    // Next.js expected errors
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],
});
