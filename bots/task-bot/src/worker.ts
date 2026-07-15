import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  const logger = new Logger('TaskBotWorker');
  const concurrency = parseInt(process.env.WORKER_CONCURRENCY ?? '3', 10);

  const app = await NestFactory.createApplicationContext(WorkerModule);

  logger.log(`Worker started with concurrency: ${concurrency}`);
  logger.log('Listening for implementation jobs on Redis queue...');

  process.on('SIGTERM', async () => {
    logger.log('Worker shutting down...');
    await app.close();
    process.exit(0);
  });
}

void bootstrap();
