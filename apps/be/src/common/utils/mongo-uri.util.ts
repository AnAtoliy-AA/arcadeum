import { Logger } from '@nestjs/common';

const logger = new Logger('MongoUri');
const DEV_DEFAULT = 'mongodb://localhost:27017/arcadeum_dev';

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
