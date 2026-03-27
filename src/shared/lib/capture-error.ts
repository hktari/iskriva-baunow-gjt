import * as Sentry from '@sentry/nextjs';
import logger, { type LoggerBindings } from './logger';

/**
 * Standard error context for Sentry and logging
 */
export interface ErrorContext extends LoggerBindings {
  errorType?: string;
  component?: string;
  severity?: 'fatal' | 'error' | 'warning' | 'info';
  fingerprint?: string[];
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

/**
 * Safely capture an error to both Sentry and structured logs
 *
 * @param error - The error to capture
 * @param context - Additional context for correlation and debugging
 * @param message - Optional custom message (defaults to error.message)
 */
export function captureError(error: unknown, context: ErrorContext = {}, message?: string): void {
  const {
    errorType,
    component,
    severity = 'error',
    fingerprint,
    tags = {},
    extra = {},
    ...loggerContext
  } = context;

  // Normalize error to Error object
  const normalizedError = error instanceof Error ? error : new Error(String(error));

  // Enrich Sentry context
  Sentry.withScope(scope => {
    // Set tags for filtering
    if (errorType) scope.setTag('error_type', errorType);
    if (component) scope.setTag('component', component);
    if (context.scope) scope.setTag('scope', context.scope);
    if (context.action) scope.setTag('action', context.action);
    if (context.entityType) scope.setTag('entity_type', context.entityType);

    // Add custom tags
    Object.entries(tags).forEach(([key, value]) => {
      scope.setTag(key, value);
    });

    // Set context data
    scope.setContext('error_context', {
      requestId: context.requestId,
      userId: context.userId,
      entityId: context.entityId,
      ...extra,
    });

    // Set fingerprint for grouping
    if (fingerprint) {
      scope.setFingerprint(fingerprint);
    }

    // Set severity level
    scope.setLevel(severity);

    // Capture to Sentry
    Sentry.captureException(normalizedError);
  });

  // Log structured error
  const logMessage = message || normalizedError.message;
  const logPayload = {
    ...loggerContext,
    error: {
      name: normalizedError.name,
      message: normalizedError.message,
      stack: normalizedError.stack,
      type: errorType,
    },
    component,
    severity,
    ...extra,
  };

  // Log at appropriate level
  switch (severity) {
    case 'fatal':
      logger.fatal(logPayload, logMessage);
      break;
    case 'warning':
      logger.warn(logPayload, logMessage);
      break;
    case 'info':
      logger.info(logPayload, logMessage);
      break;
    case 'error':
    default:
      logger.error(logPayload, logMessage);
  }
}

/**
 * Capture a message (non-error event) to Sentry and logs
 */
export function captureMessage(
  message: string,
  context: ErrorContext = {},
  level: Sentry.SeverityLevel = 'info'
): void {
  const { tags = {}, extra = {}, ...loggerContext } = context;

  // Capture to Sentry
  Sentry.withScope(scope => {
    if (context.scope) scope.setTag('scope', context.scope);
    if (context.action) scope.setTag('action', context.action);

    Object.entries(tags).forEach(([key, value]) => {
      scope.setTag(key, value);
    });

    scope.setContext('message_context', {
      requestId: context.requestId,
      userId: context.userId,
      ...extra,
    });

    scope.setLevel(level);
    Sentry.captureMessage(message, level);
  });

  // Log structured message
  const logPayload = {
    ...loggerContext,
    ...extra,
  };

  switch (level) {
    case 'fatal':
      logger.fatal(logPayload, message);
      break;
    case 'error':
      logger.error(logPayload, message);
      break;
    case 'warning':
      logger.warn(logPayload, message);
      break;
    case 'debug':
      logger.debug(logPayload, message);
      break;
    case 'info':
    default:
      logger.info(logPayload, message);
  }
}
