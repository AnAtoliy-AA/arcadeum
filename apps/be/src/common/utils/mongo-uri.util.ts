import { Logger } from '@nestjs/common';
import type { MongooseModuleOptions } from '@nestjs/mongoose';

const logger = new Logger('MongoUri');
const DEV_DEFAULT = 'mongodb://localhost:27017/arcadeum_dev';
const DEFAULT_MAX_POOL_SIZE = 50;
const DEV_MAX_POOL_SIZE = 10;
const MIN_MAX_POOL_SIZE = 1;

/**
 * Resolve the primary Mongo connection string (OCI-local).
 *
 * - If `MONGODB_OCI_URI` is set and looks like a valid scheme, returns it.
 * - In production we throw — a missing URI must never silently fall back.
 * - In any other environment we return the local default and log a warning
 *   so devs know they're hitting localhost. Connection failures from a
 *   missing local Mongo are normal under that path and the user's concern.
 */
export function resolveMongoUri(): string {
  const configured = process.env.MONGODB_OCI_URI?.trim();
  if (configured && /^mongodb(\+srv)?:\/\//.test(configured)) {
    return configured;
  }

  const env = (process.env.NODE_ENV ?? '').toLowerCase();
  if (env === 'production') {
    throw new Error(
      'MONGODB_OCI_URI is not set or invalid. Required in production.',
    );
  }

  logger.warn(
    `MONGODB_OCI_URI is not set or invalid; falling back to ${DEV_DEFAULT}. ` +
      `Set MONGODB_OCI_URI in apps/be/.env to silence this.`,
  );
  return DEV_DEFAULT;
}

/**
 * Resolve the Atlas Mongo connection string (archive).
 *
 * - If `MONGODB_ATLAS_URI` is set and looks like a valid scheme, returns it.
 * - If not set, returns undefined — Atlas is always optional.
 *   When absent, archive/history features are disabled gracefully.
 */
export function resolveAtlasUri(): string | undefined {
  const configured = process.env.MONGODB_ATLAS_URI?.trim();
  if (configured && /^mongodb(\+srv)?:\/\//.test(configured)) {
    return configured;
  }

  logger.warn(
    `MONGODB_ATLAS_URI is not set or invalid; Atlas archive disabled. ` +
      `Set MONGODB_ATLAS_URI in apps/be/.env to enable dual MongoDB.`,
  );
  return undefined;
}

/**
 * Resolve mongoose connection options.
 *
 * `maxPoolSize` defaults to 50 in production, 10 in dev.
 * Override via `MONGODB_MAX_POOL_SIZE` per environment.
 * `minPoolSize` is 1 — idle connections are evicted after `maxIdleTimeMS`.
 * `maxIdleTimeMS` is 30s — prevents idle connection accumulation.
 *
 * `serverSelectionTimeoutMS` — fail fast when Mongo is unreachable (10s).
 * `connectTimeoutMS` / `socketTimeoutMS` — prevent hanging on dead
 * connections, which was the root cause of the OOM crash.
 * `retryWrites` / `retryReads` — auto-retry transient network errors.
 */
export function resolveMongoOptions(): MongooseModuleOptions {
  const raw = process.env.MONGODB_MAX_POOL_SIZE?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  const isProd = process.env.NODE_ENV === 'production';
  const defaultPool = isProd ? DEFAULT_MAX_POOL_SIZE : DEV_MAX_POOL_SIZE;
  const maxPoolSize =
    Number.isFinite(parsed) && parsed >= MIN_MAX_POOL_SIZE
      ? parsed
      : defaultPool;

  if (raw && maxPoolSize !== parsed) {
    logger.warn(
      `MONGODB_MAX_POOL_SIZE=${raw} is invalid; using default ${DEFAULT_MAX_POOL_SIZE}.`,
    );
  }

  return {
    maxPoolSize,
    minPoolSize: 1,
    maxIdleTimeMS: 30_000,
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 8_000,
    socketTimeoutMS: 30_000,
    retryWrites: true,
    retryReads: true,
    autoIndex: process.env.NODE_ENV !== 'production',
    // Log slow queries in non-production environments for performance tuning.
    // In production, use APM tools instead to avoid log overhead.
    ...(process.env.NODE_ENV !== 'production'
      ? { profile: 1, slowms: 100 }
      : {}),
  };
}
