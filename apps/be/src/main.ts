import 'dotenv/config';
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
    ? (process.env.ALLOWED_ORIGINS?.split(',') ?? [])
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

  const port = process.env.BE_PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Backend] Listening on port ${port}`);
}

void bootstrap();
