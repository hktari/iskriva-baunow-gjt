import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Environment
  environment: process.env.NODE_ENV,

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

  // Ignore common errors
  ignoreErrors: [
    // Database connection errors (handle separately)
    'ECONNREFUSED',
    'ETIMEDOUT',
    // Auth errors (expected)
    'CredentialsSignin',
  ],
});
