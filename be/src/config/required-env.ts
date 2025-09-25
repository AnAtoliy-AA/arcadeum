// Lightweight runtime validation for critical OAuth environment variables.
// In production we throw if required variables are missing; in development we only warn.

const REQUIRED = [
  'OAUTH_WEB_CLIENT_ID',
  'OAUTH_WEB_CLIENT_SECRET',
  'OAUTH_ISSUER',
  'OAUTH_WEB_REDIRECT_URI',
];

/**
 * Validates presence of critical OAuth env vars.
 * - In production: throws if any are missing.
 * - In non-production: logs a warning listing missing keys.
 * Pass { logOk: true } to also log a success message when all are present.
 */
function validate(opts: { logOk?: boolean } = {}) {
  const { logOk = false } = opts;
  const missing = REQUIRED.filter((k) => !process.env[k]);

  if (missing.length === 0) {
    if (logOk) console.info('[config] Required OAuth env variables present');
    return;
  }

  const msg = `[config] Missing env vars: ${missing.join(', ')}`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  }
  console.warn(msg);
}

// Call with default (no success noise) to keep startup logs lean.
validate();
