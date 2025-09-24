import 'dotenv/config';
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  sendDefaultPii: true,
  release: process.env.SENTRY_RELEASE,
  debug:
    process.env.SENTRY_DEBUG === '1' || process.env.SENTRY_DEBUG === 'true',
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});
