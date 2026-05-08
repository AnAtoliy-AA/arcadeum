import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';

const logger = new Logger('JwtSecret');
let cachedDevSecret: string | null = null;

/**
 * Resolve the JWT signing secret.
 *
 * - If `AUTH_JWT_SECRET` is set, returns it.
 * - In production we throw — a missing secret must never silently fall back.
 * - In any other environment we lazily generate a per-process random
 *   secret and log a loud warning so devs know they are running with an
 *   ephemeral key (tokens become invalid on restart, which is fine for
 *   local dev and prevents reusing a checked-in default).
 */
export function resolveJwtSecret(config: ConfigService): string {
  const configured = config.get<string>('AUTH_JWT_SECRET');
  if (configured && configured.trim().length > 0) return configured;

  const env = (
    config.get<string>('NODE_ENV') ??
    process.env.NODE_ENV ??
    ''
  ).toLowerCase();
  if (env === 'production') {
    throw new Error('AUTH_JWT_SECRET is not set');
  }

  if (!cachedDevSecret) {
    cachedDevSecret = randomBytes(48).toString('hex');
    logger.warn(
      `AUTH_JWT_SECRET is not set; using an ephemeral per-process secret ` +
        `(env=${env || 'unset'}). Tokens will be invalidated on every BE ` +
        `restart. Set AUTH_JWT_SECRET in apps/be/.env to silence this.`,
    );
  }
  return cachedDevSecret;
}
