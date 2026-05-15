import { Logger } from '@nestjs/common';
import type { MongooseModuleOptions } from '@nestjs/mongoose';

const logger = new Logger('MongoUri');
const DEV_DEFAULT = 'mongodb://localhost:27017/arcadeum_dev';
const DEFAULT_MAX_POOL_SIZE = 200;
const MIN_MAX_POOL_SIZE = 1;

/**
 * Resolve the Mongo connection string.
 *
 * - If `MONGODB_URI` is set and looks like a valid scheme, returns it.
 * - In production we throw — a missing URI must never silently fall back.
 * - In any other environment we return the local default and log a warning
 *   so devs know they're hitting localhost. Connection failures from a
 *   missing local Mongo are normal under that path and the user's concern.
 */
export function resolveMongoUri(): string {
  const configured = process.env.MONGODB_URI?.trim();
  if (configured && /^mongodb(\+srv)?:\/\//.test(configured)) {
    return configured;
  }

  const env = (process.env.NODE_ENV ?? '').toLowerCase();
  if (env === 'production') {
    throw new Error(
      'MONGODB_URI is not set or invalid. Required in production.',
    );
  }

  logger.warn(
    `MONGODB_URI is not set or invalid; falling back to ${DEV_DEFAULT}. ` +
      `Set MONGODB_URI in apps/be/.env to silence this.`,
  );
  return DEV_DEFAULT;
}

/**
 * Resolve mongoose connection options.
 *
 * `maxPoolSize` defaults to 200 to handle bursty traffic from concurrent
 * game sessions (each play_action / draw / attack hits the DB). The
 * mongoose default of 100 queues at ~100 concurrent active players.
 * Override via `MONGODB_MAX_POOL_SIZE` per environment — keep within
 * the connection cap of the mongo deployment.
 */
export function resolveMongoOptions(): MongooseModuleOptions {
  const raw = process.env.MONGODB_MAX_POOL_SIZE?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  const maxPoolSize =
    Number.isFinite(parsed) && parsed >= MIN_MAX_POOL_SIZE
      ? parsed
      : DEFAULT_MAX_POOL_SIZE;

  if (raw && maxPoolSize !== parsed) {
    logger.warn(
      `MONGODB_MAX_POOL_SIZE=${raw} is invalid; using default ${DEFAULT_MAX_POOL_SIZE}.`,
    );
  }

  return { maxPoolSize };
}
