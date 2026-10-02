/**
 * Common CORS utility for resolving allowed origins from environment variables.
 */

export function getAllowedOrigins(): string[] {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',') || [])
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (process.env.NODE_ENV !== 'production' || process.env.E2E === 'true') {
    const webPort = process.env.WEB_PORT || '3000';
    const devPorts = Array.from(new Set(['3000', '3300', '3500', webPort]));
    for (const port of devPorts) {
      const localhostOrigin = `http://localhost:${port}`;
      const loopbackOrigin = `http://127.0.0.1:${port}`;
      if (!allowedOrigins.includes(localhostOrigin)) {
        allowedOrigins.push(localhostOrigin);
      }
      if (!allowedOrigins.includes(loopbackOrigin)) {
        allowedOrigins.push(loopbackOrigin);
      }
    }
  }

  return allowedOrigins;
}

export function corsOriginMatcher(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  const allowedOrigins = getAllowedOrigins();

  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  if (process.env.NODE_ENV !== 'production' || process.env.E2E === 'true') {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
      return;
    }
  }

  callback(new Error('Not allowed by CORS'));
}
