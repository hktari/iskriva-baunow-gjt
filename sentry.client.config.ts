import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay for debugging
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error:', hint.originalException || hint.syntheticException);
      return null;
    }
    
    // Add custom tags
    event.tags = {
      ...event.tags,
      component_type: 'client',
    };
    
    return event;
  },
  
  // Breadcrumbs for better debugging
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level !== 'error') {
      return null;
    }
    return breadcrumb;
  },
  
  // Ignore common errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Network errors
    'NetworkError',
    'Network request failed',
    // React hydration warnings (handle separately)
    'Hydration failed',
  ],
});
