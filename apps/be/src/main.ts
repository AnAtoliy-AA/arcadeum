import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ArcadeumLogger } from './common/logger/arcadeum-logger.service';
import { corsOriginMatcher } from './common/utils/cors.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ArcadeumLogger(),
  });

  app.enableCors({
    origin: corsOriginMatcher,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'x-anonymous-id',
    ],
  });

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}

void bootstrap();
