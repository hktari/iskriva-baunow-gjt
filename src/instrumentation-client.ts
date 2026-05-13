// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development';

Sentry.init({
  dsn: 'https://d620fdfc7ccc3ec4a079dd37987bf4bd@o4511117015515136.ingest.de.sentry.io/4511117017677904',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Environment
  environment: environment,

  // Release tracking
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,

  // Only enable in production (or when explicitly opted in)
  enabled: environment === 'production' || process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  integrations: [
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: 'system',
      isEmailRequired: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
