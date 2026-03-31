import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ArcadeumLogger } from './common/logger/arcadeum-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ArcadeumLogger(),
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProduction
    ? (process.env.CORS_ORIGINS?.split(',') ?? [])
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'x-anonymous-id'],
  });

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}

void bootstrap();
