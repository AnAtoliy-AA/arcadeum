import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('TaskBot');
  const app = await NestFactory.create(AppModule);

  const port = process.env.TASK_BOT_PORT ?? 4005;
  await app.listen(port);
  logger.log(`[Task Bot] Listening on port ${port}`);
}

void bootstrap();
