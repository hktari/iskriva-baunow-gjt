import { randomUUID } from 'crypto';
import { headers } from 'next/headers';

/**
 * Standard observability metadata for correlation and context
 */
export interface ObservabilityContext {
  requestId: string;
  userId?: string;
  scope?: string;
  action?: string;
  entityId?: string;
  entityType?: string;
  [key: string]: unknown;
}

/**
 * Generate a new correlation ID (UUID v4)
 */
export function generateCorrelationId(): string {
  return randomUUID();
}

/**
 * Extract request ID from Next.js headers (server context)
 * Falls back to generating a new ID if not present
 */
export async function getRequestId(): Promise<string> {
  try {
    const headersList = await headers();
    const requestId = headersList.get('x-request-id');
    return requestId || generateCorrelationId();
  } catch {
    return generateCorrelationId();
  }
}

/**
 * Create standardized observability context for logging and error tracking
 */
export async function createObservabilityContext(
  overrides: Partial<ObservabilityContext> = {}
): Promise<ObservabilityContext> {
  const requestId = await getRequestId();

  return {
    requestId,
    ...overrides,
  };
}

/**
 * Extract user ID from session or context
 * This is a placeholder - implement based on your auth setup
 */
export function extractUserId(session?: { user?: { id?: string } }): string | undefined {
  return session?.user?.id;
}
