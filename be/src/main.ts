import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Quick visibility into Sentry env at boot
  // Do not log full DSN; only whether it exists
  const hasDSN = Boolean(process.env.SENTRY_DSN);
  console.info(
    `Sentry DSN configured: ${hasDSN}; env: ${process.env.NODE_ENV || 'development'}`,
  );
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  // SentryGlobalFilter is registered in AppModule providers

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}

void bootstrap();
