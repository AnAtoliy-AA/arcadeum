/**
 * Minimal logger used by shared engines. On the backend real NestJS loggers
 * are injected/wrapped by app code; inside the package we only need a safe,
 * dependency-free sink that works in browser and node.
 */
export interface GamesCoreLogger {
  log(message: unknown): void;
  warn(message: unknown): void;
  error(message: unknown): void;
  debug(message: unknown): void;
}

const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

function sink(level: 'log' | 'warn' | 'error' | 'debug', scope: string) {
  return (message: unknown) => {
    if (isBrowser && level === 'debug') return;
    // eslint-disable-next-line no-console -- deliberate console sink in shared lib
    console[level](`[${scope}] ${String(message)}`);
  };
}

export function createLogger(scope: string): GamesCoreLogger {
  return {
    log: sink('log', scope),
    warn: sink('warn', scope),
    error: sink('error', scope),
    debug: sink('debug', scope),
  };
}
