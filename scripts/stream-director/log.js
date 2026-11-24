'use strict';

/** Structured JSON-lines logger. One object per line on stdout. */

const SECRET_KEYS = /key|token|password|secret|rtmp|authorization/i;

function sanitize(value, depth = 0) {
  if (depth > 3 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = SECRET_KEYS.test(k) ? '[redacted]' : sanitize(v, depth + 1);
  }
  return out;
}

function createLogger({
  write = (line) => process.stdout.write(line + '\n'),
  now = () => new Date(),
} = {}) {
  const emit = (level, msg, data) => {
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

module.exports = { createLogger, sanitize };
