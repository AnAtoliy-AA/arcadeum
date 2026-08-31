import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ArcadeumLogger } from './common/logger/arcadeum-logger.service';
import { getAllowedOrigins } from './common/utils/cors.util';
import { IpBlockGuard, IpBlockService } from './common/guards/ip-block.guard';
import { CsrfGuard } from './common/guards/csrf.guard';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';
import { CompressedIoAdapter } from './common/adapters/compressed-io.adapter';

async function bootstrap() {
  if (
    process.env.E2E === 'true' &&
    process.env.NODE_ENV === 'production' &&
    !process.env.CI
  ) {
    throw new Error(
      'E2E mode must not be enabled in production. Set E2E=false or remove it.',
    );
  }

  const logger = new ArcadeumLogger();
  logger.setLogLevels(['error', 'warn', 'log']);
  const app = await NestFactory.create(AppModule, { logger });
  app.useWebSocketAdapter(new CompressedIoAdapter(app));

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(compression());
  app.use(cookieParser());

  // Trust proxy: required for correct client IP resolution behind reverse proxies (nginx, Cloudflare).
  // Without this, req.ip always returns 127.0.0.1, breaking per-IP rate limiting.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalInterceptors(new RequestIdInterceptor());

  const ipBlockService = app.get(IpBlockService);
  app.useGlobalGuards(new IpBlockGuard(ipBlockService), new CsrfGuard());

  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'x-anonymous-id',
      'x-anonymous-signature',
      'x-requested-with',
      'x-request-id',
    ],
  });

  const port = process.env.PORT ?? process.env.BE_PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Backend] Listening on port ${port}`);

  if (process.send) {
    process.send('ready');
  }

  const shutdown = async (signal: string) => {
    console.log(`\n[Backend] ${signal} received — shutting down gracefully`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void bootstrap();
