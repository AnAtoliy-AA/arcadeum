/**
 * Standalone BullMQ worker process.
 *
 * Runs in a dedicated container to prevent CPU-heavy background jobs
 * from starving the API/WebSocket server. Connects to the same Redis
 * and MongoDB as the main BE app.
 *
 * Start with: node dist/src/worker.js
 */

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ArcadeumLogger } from './common/logger/arcadeum-logger.service';
import { initTracing, shutdownTracing } from './common/tracing/opentelemetry';

async function bootstrap() {
  initTracing();

  const logger = new ArcadeumLogger('Worker');
  logger.setLogLevels(['error', 'warn', 'log']);
  logger.log('[Worker] Starting dedicated BullMQ worker process');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger,
  });

  logger.log('[Worker] BullMQ worker ready — processing jobs');

  const shutdown = async (signal: string) => {
    logger.log(`\n[Worker] ${signal} received — shutting down gracefully`);
    await app.close();
    await shutdownTracing();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void bootstrap();
