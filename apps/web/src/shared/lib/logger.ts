/**
 * Structured logger for the web application.
 * Replaces console.log/warn/error/debug with a consistent, configurable logger.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  context?: string;
  level?: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LOG_LEVEL: LogLevel =
  (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatMessage(
  level: LogLevel,
  message: string,
  context?: string,
  data?: unknown,
): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  const base = `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}`;

  if (data !== undefined) {
    const dataStr =
      typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    return `${base}\n${dataStr}`;
  }

  return base;
}

export function createLogger(options: LoggerOptions = {}) {
  const { context } = options;

  return {
    debug(message: string, data?: unknown) {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', message, context, data));
      }
    },

    info(message: string, data?: unknown) {
      if (shouldLog('info')) {
        console.info(formatMessage('info', message, context, data));
      }
    },

    warn(message: string, data?: unknown) {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', message, context, data));
      }
    },

    error(message: string, error?: unknown) {
      if (shouldLog('error')) {
        const errorData =
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error;
        console.error(formatMessage('error', message, context, errorData));
      }
    },
  };
}

// Default logger instance
export const logger = createLogger();
