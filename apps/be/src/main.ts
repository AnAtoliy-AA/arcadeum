import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ArcadeumLogger } from './common/logger/arcadeum-logger.service';
import { getAllowedOrigins } from './common/utils/cors.util';
import { IpBlockGuard, IpBlockService } from './common/guards/ip-block.guard';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

async function bootstrap() {
  const logger = new ArcadeumLogger();
  logger.setLogLevels(['error', 'warn', 'log']);
  const app = await NestFactory.create(AppModule, { logger });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );

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
  app.useGlobalGuards(new IpBlockGuard(ipBlockService));

  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'x-anonymous-id',
      'x-request-id',
    ],
  });

  const port = process.env.BE_PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Backend] Listening on port ${port}`);
}

void bootstrap();
