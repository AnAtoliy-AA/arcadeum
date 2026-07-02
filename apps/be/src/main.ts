import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ArcadeumLogger } from './common/logger/arcadeum-logger.service';
import { getAllowedOrigins } from './common/utils/cors.util';
import { IpBlockGuard, IpBlockService } from './common/guards/ip-block.guard';
import { CsrfGuard } from './common/guards/csrf.guard';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

async function bootstrap() {
  const logger = new ArcadeumLogger();
  logger.setLogLevels(['error', 'warn', 'log']);
  const app = await NestFactory.create(AppModule, { logger });

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

  app.use(cookieParser());

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

  const port = process.env.BE_PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Backend] Listening on port ${port}`);
}

void bootstrap();
