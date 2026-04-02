/**
 * Common CORS utility for resolving allowed origins from environment variables.
 */

export function getAllowedOrigins(): string[] {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  // Add localhost only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    const webPort = process.env.WEB_PORT || '3000';
    allowedOrigins.push(
      `http://localhost:${webPort}`,
      `http://127.0.0.1:${webPort}`,
    );
  }

  return allowedOrigins;
}

/**
 * Common CORS origin matcher for both main app and WebSocket gateways.
 */
export function corsOriginMatcher(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  const allowedOrigins = getAllowedOrigins();

  // Allow requests with no origin (like mobile apps or curl)
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
