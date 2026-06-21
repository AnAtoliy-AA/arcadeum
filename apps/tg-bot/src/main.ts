import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('TgBot');
  const app = await NestFactory.create(AppModule);

  const port = process.env.TG_BOT_PORT ?? 4001;
  await app.listen(port);
  logger.log(`[TG Bot] Listening on port ${port}`);
}

void bootstrap();
