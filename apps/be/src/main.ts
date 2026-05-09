import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ArcadeumLogger } from './common/logger/arcadeum-logger.service';
import { getAllowedOrigins } from './common/utils/cors.util';

async function bootstrap() {
  const logger = new ArcadeumLogger();
  logger.setLogLevels(['error', 'warn', 'log']);
  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableCors({
    origin: getAllowedOrigins(),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'x-anonymous-id',
    ],
  });

  const port = process.env.BE_PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Backend] Listening on port ${port}`);
}

void bootstrap();
