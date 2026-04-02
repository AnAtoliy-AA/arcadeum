import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ArcadeumLogger } from './common/logger/arcadeum-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ArcadeumLogger(),
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const webPort = process.env.WEB_PORT || '3000';
  const allowedOrigins = isProduction
    ? (process.env.CORS_ORIGINS?.split(',') ?? [])
    : [`http://localhost:${webPort}`, `http://127.0.0.1:${webPort}`];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'x-anonymous-id',
    ],
  });

  await app.listen(process.env.BE_PORT ?? 4000, '0.0.0.0');
}

void bootstrap();
