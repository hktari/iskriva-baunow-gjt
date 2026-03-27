# Observability & Error Monitoring

This document describes the logging and error monitoring setup for the Baunow GJT application.

## Overview

The application uses a production-grade observability stack:

- **Structured Logging**: Pino for JSON-formatted, redacted, context-rich logs
- **Error Tracking**: Sentry for end-to-end error capture and trace correlation
- **Request Correlation**: Request IDs for linking logs and errors across the stack

## Architecture

### Request Flow

1. **Middleware** generates/extracts `x-request-id` header
2. **Server Actions** create observability context with request ID, user ID, and action metadata
3. **Logger** outputs structured logs with correlation data
4. **Sentry** captures exceptions with the same correlation context
5. **Audit Logs** include request ID for cross-referencing

### Components

```
┌─────────────┐
│  Middleware │ → Generates request ID
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Server Actions  │ → Creates observability context
└──────┬──────────┘
       │
       ├─────────────────┐
       ▼                 ▼
┌──────────┐      ┌──────────┐
│  Logger  │      │  Sentry  │
│  (Pino)  │      │          │
└──────────┘      └──────────┘
```

## Configuration

### Environment Variables

#### Required for Production

```bash
# Sentry DSN for error tracking
SENTRY_DSN="https://your-key@sentry.io/project-id"
```

#### Optional Configuration

```bash
# Logging
LOG_LEVEL="info"  # trace, debug, info, warn, error, fatal

# Sentry Server
SENTRY_ENVIRONMENT="production"  # Override environment name
SENTRY_ENABLED="true"            # Enable in non-production
SENTRY_RELEASE="v1.2.3"          # Release version

# Sentry Client (browser)
NEXT_PUBLIC_SENTRY_DSN="https://your-key@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_ENVIRONMENT="production"
NEXT_PUBLIC_SENTRY_ENABLED="true"
NEXT_PUBLIC_SENTRY_RELEASE="v1.2.3"
```

### Log Levels

- **trace**: Very detailed debugging information
- **debug**: Detailed debugging (default in development)
- **info**: General informational messages (default in production)
- **warn**: Warning messages for potentially harmful situations
- **error**: Error events that might still allow the app to continue
- **fatal**: Severe errors that cause the application to abort

## Usage

### Server Actions

All server actions automatically include observability context:

```typescript
import { createChildLogger } from '@/shared/lib/logger';
import { captureError } from '@/shared/lib/capture-error';
import { createObservabilityContext, extractUserId } from '@/shared/lib/observability-context';

export async function myServerAction(data: FormData) {
  const session = await auth();

  const context = await createObservabilityContext({
    scope: 'my-feature',
    action: 'myServerAction',
    userId: extractUserId(session),
    entityId: data.id,
    entityType: 'MyEntity',
  });
  const logger = createChildLogger(context);

  try {
    // Your logic here
    logger.info({ entityId: result.id }, 'Action completed successfully');
    return { success: true };
  } catch (error) {
    captureError(error, {
      ...context,
      errorType: 'my-action-failed',
      severity: 'error',
      extra: { additionalData: 'value' },
    });
    return { error: 'Failed to complete action' };
  }
}
```

### Client Components

Error boundaries automatically capture React errors:

```typescript
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { SectionErrorBoundary } from '@/shared/components/section-error-boundary';

// Full page error boundary
<ErrorBoundary>
  <MyPage />
</ErrorBoundary>

// Section-level error boundary
<SectionErrorBoundary sectionName="User Dashboard">
  <UserDashboard />
</SectionErrorBoundary>
```

### Manual Error Capture

For custom error handling:

```typescript
import { captureError, captureMessage } from '@/shared/lib/capture-error';

try {
  // risky operation
} catch (error) {
  captureError(error, {
    scope: 'custom-handler',
    errorType: 'custom-error',
    severity: 'warning',
    tags: { feature: 'payments' },
    extra: { orderId: '123' },
  });
}

// Capture informational messages
captureMessage(
  'User completed onboarding',
  {
    scope: 'onboarding',
    tags: { cohort: 'Q1-2024' },
  },
  'info'
);
```

## Correlation & Debugging

### Finding Related Events

Every request generates a unique `requestId` that appears in:

1. **HTTP Response Headers**: `x-request-id`
2. **Structured Logs**: `requestId` field
3. **Sentry Events**: `requestId` tag
4. **Audit Logs**: `metadata.requestId` field

### Example: Debugging a Failed Action

1. **User reports error**: "Project creation failed"
2. **Check Sentry**: Search for `action:createProject` tag
3. **Find request ID**: Look at event tags or context
4. **Query logs**: Search logs for `requestId: "abc-123"`
5. **Check audit trail**: Query database for `metadata.requestId = 'abc-123'`

### Querying Logs

If using a log aggregation service (e.g., Datadog, CloudWatch):

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user_123",
  "scope": "projects",
  "action": "createProject",
  "level": "error"
}
```

Query examples:

- All errors for a user: `userId:"user_123" level:"error"`
- All actions in a request: `requestId:"550e8400-e29b-41d4-a716-446655440000"`
- All project operations: `scope:"projects"`

## Security & Privacy

### Automatic Redaction

The following fields are automatically redacted from logs:

- `password`, `newPassword`, `currentPassword`, `confirmPassword`
- `authorization`, `Authorization`
- `cookie`, `Cookie`
- `token`, `accessToken`, `refreshToken`
- `apiKey`, `secret`, `privateKey`
- Any nested field matching these patterns (e.g., `user.password`)

### Best Practices

1. **Never log sensitive data**: PII, credentials, tokens
2. **Use structured logging**: Include context, not raw objects
3. **Set appropriate severity**: Don't spam error logs with warnings
4. **Include correlation IDs**: Always use observability context
5. **Sanitize user input**: Before logging user-provided data

## Monitoring & Alerts

### Recommended Sentry Alerts

1. **High Error Rate**: >10 errors/minute
2. **New Error Types**: First occurrence of new error
3. **Critical Errors**: Any error with `severity: fatal`
4. **User Impact**: Errors affecting >5% of users

### Key Metrics to Track

- **Error Rate**: Errors per request
- **Response Time**: P50, P95, P99 latencies
- **Success Rate**: Successful vs failed operations
- **User Sessions**: Active users and session duration

## Local Development

### Viewing Logs

Logs are formatted with `pino-pretty` in development:

```bash
pnpm dev
# Logs appear in console with colors and timestamps
```

### Testing Sentry

Set `SENTRY_ENABLED=true` in `.env.local` to test Sentry in development:

```bash
SENTRY_ENABLED=true
SENTRY_DSN="your-test-dsn"
```

### Debugging

Enable trace-level logging:

```bash
LOG_LEVEL=trace pnpm dev
```

## Production Deployment

### Checklist

- [ ] `SENTRY_DSN` configured
- [ ] `SENTRY_ENVIRONMENT` set to production
- [ ] `SENTRY_RELEASE` includes git SHA or version
- [ ] `LOG_LEVEL` set to `info` or `warn`
- [ ] Log aggregation service configured (optional)
- [ ] Sentry alerts configured
- [ ] Error notification channels set up

### Performance Considerations

- **Sampling**: Sentry traces are sampled at 10% in production
- **Log Volume**: Info-level logging is production-safe
- **Async Capture**: Sentry capture is non-blocking
- **Redaction**: Minimal performance impact

## Troubleshooting

### Logs Not Appearing

1. Check `LOG_LEVEL` environment variable
2. Verify logger is imported correctly
3. Ensure `NODE_ENV` is set

### Sentry Not Capturing Errors

1. Verify `SENTRY_DSN` is set
2. Check `SENTRY_ENABLED` flag
3. Confirm error is not in `ignoreErrors` list
4. Check Sentry dashboard for quota limits

### Missing Request IDs

1. Ensure middleware is running
2. Check that `x-request-id` header is propagated
3. Verify observability context is created in actions

## References

- [Pino Documentation](https://getpino.io/)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
