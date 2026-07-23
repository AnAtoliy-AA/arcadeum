import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  const logger = new Logger('TaskBotWorker');
  const concurrency = parseInt(process.env.WORKER_CONCURRENCY ?? '3', 10);

  const app = await NestFactory.createApplicationContext(WorkerModule);

  logger.log(`Worker started with concurrency: ${concurrency}`);
  logger.log(`Redis: ${process.env.REDIS_HOST ?? '127.0.0.1'}:${process.env.REDIS_PORT ?? '6379'}`);
  logger.log(`Repo path: ${process.env.REPO_PATH ?? process.cwd()}`);
  logger.log('Listening for implementation jobs on Redis queue...');

  const shutdown = async () => {
    logger.log('Worker shutting down...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled rejection: ${err}`);
  });
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err}`);
    shutdown();
  });
}

void bootstrap();
