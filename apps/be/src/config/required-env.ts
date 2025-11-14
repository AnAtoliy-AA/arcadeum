// Lightweight runtime validation for critical OAuth environment variables.
// In production we throw if required variables are missing; in development we only warn.

const CORE_REQUIRED = ['OAUTH_ISSUER'];

const WEB_CLIENT_OPTIONS: Array<{
  idKey: string;
  secretKeys: string[];
  redirectKey: string;
}> = [
  {
    idKey: 'OAUTH_WEB_CLIENT_ID_NEXT',
    secretKeys: ['OAUTH_WEB_CLIENT_SECRET_NEXT', 'OAUTH_WEB_CLIENT_SECRET'],
    redirectKey: 'OAUTH_WEB_REDIRECT_URI_NEXT',
  },
  {
    idKey: 'OAUTH_WEB_CLIENT_ID_EXPO',
    secretKeys: ['OAUTH_WEB_CLIENT_SECRET_EXPO', 'OAUTH_WEB_CLIENT_SECRET'],
    redirectKey: 'OAUTH_WEB_REDIRECT_URI_EXPO',
  },
  {
    idKey: 'OAUTH_WEB_CLIENT_ID',
    secretKeys: ['OAUTH_WEB_CLIENT_SECRET'],
    redirectKey: 'OAUTH_WEB_REDIRECT_URI',
  },
];

/**
 * Validates presence of critical OAuth env vars.
 * - In production: throws if any are missing.
 * - In non-production: logs a warning listing missing keys.
 * Pass { logOk: true } to also log a success message when all are present.
 */
function validate(opts: { logOk?: boolean } = {}) {
  const { logOk = false } = opts;
  const missingCore = CORE_REQUIRED.filter((k) => !process.env[k]);

  const webClientConfigured = WEB_CLIENT_OPTIONS.some(
    ({ idKey, secretKeys, redirectKey }) => {
      if (!process.env[idKey]) return false;
      const hasSecret = secretKeys.some((key) => Boolean(process.env[key]));
      if (!hasSecret) return false;
      if (!process.env[redirectKey]) return false;
      return true;
    },
  );

  const partialWebClients = WEB_CLIENT_OPTIONS.filter(({ idKey, secretKeys, redirectKey }) => {
    const providedKeys = [idKey, redirectKey, ...secretKeys];
    const provided = providedKeys.filter((key) => Boolean(process.env[key]));
    const requiredCount = new Set(providedKeys).size;
    return provided.length > 0 && provided.length < requiredCount;
  }).map(({ idKey }) => idKey);

  const issues: string[] = [];
  if (missingCore.length > 0) {
    issues.push(`Missing env vars: ${missingCore.join(', ')}`);
  }
  if (!webClientConfigured) {
    issues.push(
      'Missing OAuth web client configuration (set ID, secret, and redirect for at least one web client)',
    );
  }
  if (partialWebClients.length > 0) {
    issues.push(
      `Incomplete OAuth web client entries: ${partialWebClients.join(', ')}`,
    );
  }

  if (issues.length === 0) {
    if (logOk) console.info('[config] Required OAuth env variables present');
    return;
  }

  const msg = `[config] ${issues.join('; ')}`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  }
  console.warn(msg);
}

// Call with default (no success noise) to keep startup logs lean.
validate();
