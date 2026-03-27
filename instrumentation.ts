/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js when the app starts.
 * It's used to register server-side instrumentation and error handlers.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and initialize Sentry server config
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Import and initialize Sentry edge config
    await import('./sentry.edge.config');
  }
}

/**
 * Global error handler for unhandled errors in Next.js
 * This is called for errors that occur during request handling
 */
export async function onRequestError(
  err: Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
  }
) {
  // Import Sentry and capture utilities
  const { captureError } = await import('./src/shared/lib/capture-error');

  // Capture the error with request context
  captureError(err, {
    scope: 'request-handler',
    errorType: 'unhandled-request-error',
    tags: {
      router_kind: context.routerKind,
      route_type: context.routeType,
      http_method: request.method,
    },
    extra: {
      path: request.path,
      routePath: context.routePath,
      headers: {
        'user-agent': request.headers['user-agent'],
        'x-request-id': request.headers['x-request-id'],
      },
    },
  });
}
