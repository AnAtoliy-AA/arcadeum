import type { Logger } from './types';

/** Structured JSON-lines logger. One object per line on stdout. */

const SECRET_KEYS = /key|token|password|secret|rtmp|authorization/i;

export function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 3 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = SECRET_KEYS.test(k) ? '[redacted]' : sanitize(v, depth + 1);
  }
  return out;
}

export interface LoggerOptions {
  write?: (line: string) => void;
  now?: () => Date;
}

export function createLogger({
  write = (line) => process.stdout.write(line + '\n'),
  now = () => new Date(),
}: LoggerOptions = {}): Logger {
  const emit = (
    level: string,
    msg: string,
    data?: Record<string, unknown>,
  ): void => {
    write(
      JSON.stringify({
        ts: now().toISOString(),
        level,
        msg,
        ...(data ? { data: sanitize(data) } : {}),
      }),
    );
  };
  return {
    info: (m, d) => emit('info', m, d),
    warn: (m, d) => emit('warn', m, d),
    error: (m, d) => emit('error', m, d),
  };
}
