import pino from 'pino';

/**
 * Sensitive field paths to redact from logs
 */
const REDACT_PATHS = [
  'password',
  'newPassword',
  'currentPassword',
  'confirmPassword',
  'authorization',
  'Authorization',
  'cookie',
  'Cookie',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'privateKey',
  '*.password',
  '*.token',
  '*.secret',
  'req.headers.authorization',
  'req.headers.cookie',
];

/**
 * Get log level from environment with fallback
 */
function getLogLevel(): pino.Level {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  const validLevels: pino.Level[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

  if (envLevel && validLevels.includes(envLevel as pino.Level)) {
    return envLevel as pino.Level;
  }

  // Fallback based on NODE_ENV
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

const logger = pino({
  level: getLogLevel(),
  redact: {
    paths: REDACT_PATHS,
    censor: '[REDACTED]',
  },
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: label => {
      return { level: label };
    },
  },
});

/**
 * Standard bindings for child logger creation
 */
export interface LoggerBindings {
  scope?: string;
  requestId?: string;
  userId?: string;
  action?: string;
  entityId?: string;
  entityType?: string;
  [key: string]: unknown;
}

/**
 * Create a child logger with standardized bindings
 */
export function createChildLogger(bindings: LoggerBindings): pino.Logger {
  return logger.child(bindings);
}

export default logger;
