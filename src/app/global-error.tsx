'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { AlertCircle } from 'lucide-react';

/**
 * Global error handler for Next.js App Router
 * This component catches errors in the root layout
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capture error to Sentry
    Sentry.withScope(scope => {
      scope.setTag('error_boundary', 'global');
      scope.setTag('component', 'GlobalError');
      if (error.digest) {
        scope.setTag('error_digest', error.digest);
      }
      scope.setLevel('fatal');
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
              <p className="text-muted-foreground">
                A critical error occurred. Our team has been notified and is working on a fix.
              </p>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-md bg-muted p-4 text-left">
                <p className="text-sm font-mono text-destructive break-all">{error.message}</p>
                {error.digest ? (
                  <p className="text-xs text-muted-foreground mt-2">Error ID: {error.digest}</p>
                ) : null}
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={reset}>Try Again</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/')}>
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
