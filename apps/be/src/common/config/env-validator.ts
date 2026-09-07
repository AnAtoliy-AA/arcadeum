/**
 * Environment variable validation for the backend.
 * Validates required environment variables at startup and provides
 * type-safe access to configuration values.
 */

export interface EnvConfig {
  // Database
  MONGODB_OCI_URI: string;

  // Authentication
  AUTH_JWT_SECRET: string;
  OAUTH_WEB_CLIENT_ID: string;
  OAUTH_WEB_CLIENT_SECRET: string;

  // Apple OAuth (optional)
  APPLE_CLIENT_ID?: string;

  // Discord OAuth (optional)
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;

  // Payments (optional)
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_RETURN_URL?: string;
  PAYPAL_CANCEL_URL?: string;

  // Solana (optional)
  SOLANA_PRIVATE_KEY?: string;
  SOLANA_RPC_URL?: string;

  // Redis (optional)
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;

  // App
  NODE_ENV?: string;
  PORT?: string;
}

const REQUIRED_VARS: (keyof EnvConfig)[] = [
  'MONGODB_OCI_URI',
  'AUTH_JWT_SECRET',
  'OAUTH_WEB_CLIENT_ID',
  'OAUTH_WEB_CLIENT_SECRET',
];

const warnings: string[] = [];
const errors: string[] = [];

/**
 * Validate environment variables and return the config object.
 * Throws an error if required variables are missing.
 */
export function validateEnv(): EnvConfig {
  warnings.length = 0;
  errors.length = 0;

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Check optional but recommended variables
  const optionalRecommended: Array<{ key: keyof EnvConfig; feature: string }> =
    [
      { key: 'APPLE_CLIENT_ID', feature: 'Apple OAuth' },
      { key: 'DISCORD_CLIENT_ID', feature: 'Discord OAuth' },
      { key: 'PAYPAL_CLIENT_ID', feature: 'PayPal payments' },
      { key: 'SOLANA_PRIVATE_KEY', feature: 'Solana payments' },
      { key: 'REDIS_HOST', feature: 'Redis caching' },
    ];

  for (const { key, feature } of optionalRecommended) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      warnings.push(
        `Optional variable ${key} not set - ${feature} will be disabled`,
      );
    }
  }

  // Validate PORT if provided
  const port = process.env.PORT;
  if (port) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      errors.push(
        `Invalid PORT value: ${port}. Must be a number between 1 and 65535`,
      );
    }
  }

  // Validate MONGODB_OCI_URI format
  const mongoUri = process.env.MONGODB_OCI_URI;
  if (
    mongoUri &&
    !mongoUri.startsWith('mongodb://') &&
    !mongoUri.startsWith('mongodb+srv://')
  ) {
    errors.push(
      `Invalid MONGODB_OCI_URI format. Must start with mongodb:// or mongodb+srv://`,
    );
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('\n[EnvValidator] Warnings:');
    for (const warning of warnings) {
      console.warn(`  - ${warning}`);
    }
    console.warn('');
  }

  // Throw if there are errors
  if (errors.length > 0) {
    const errorMessage = `\n[EnvValidator] Missing required environment variables:\n${errors.map((e) => `  - ${e}`).join('\n')}\n\nPlease set these variables in your .env file or environment.\n`;
    throw new Error(errorMessage);
  }

  return {
    MONGODB_OCI_URI: process.env.MONGODB_OCI_URI!,
    AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET!,
    OAUTH_WEB_CLIENT_ID: process.env.OAUTH_WEB_CLIENT_ID!,
    OAUTH_WEB_CLIENT_SECRET: process.env.OAUTH_WEB_CLIENT_SECRET!,
    APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_RETURN_URL: process.env.PAYPAL_RETURN_URL,
    PAYPAL_CANCEL_URL: process.env.PAYPAL_CANCEL_URL,
    SOLANA_PRIVATE_KEY: process.env.SOLANA_PRIVATE_KEY,
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  };
}

/**
 * Check if a feature is enabled based on environment variables.
 */
export function isFeatureEnabled(
  feature: 'apple_oauth' | 'discord_oauth' | 'paypal' | 'solana' | 'redis',
): boolean {
  switch (feature) {
    case 'apple_oauth':
      return !!process.env.APPLE_CLIENT_ID;
    case 'discord_oauth':
      return (
        !!process.env.DISCORD_CLIENT_ID && !!process.env.DISCORD_CLIENT_SECRET
      );
    case 'paypal':
      return (
        !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET
      );
    case 'solana':
      return !!process.env.SOLANA_PRIVATE_KEY;
    case 'redis':
      return !!process.env.REDIS_HOST;
    default:
      return false;
  }
}
