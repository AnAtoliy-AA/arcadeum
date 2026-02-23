import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ArcadeumLogger } from './common/logger/arcadeum-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ArcadeumLogger(),
  });

  app.enableCors();

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}

void bootstrap();
