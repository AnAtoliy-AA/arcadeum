import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const logger = new Logger('AppBullMqModule');
        const redisUrl = config.get<string>('REDIS_URL');

        if (redisUrl) {
          try {
            const client = new Redis(redisUrl, {
              maxRetriesPerRequest: null,
              enableOfflineQueue: false,
              lazyConnect: true,
            });
            client.on('error', (err: Error) => {
              logger.warn(`BullMQ Redis error: ${err.message}`);
            });
            return { connection: client };
          } catch (err) {
            logger.warn(
              `BullMQ invalid REDIS_URL (${redisUrl}): ${String(err)}`,
            );
          }
        }

        const host = config.get<string>('REDIS_HOST') || '127.0.0.1';
        const port = Number(config.get<string>('REDIS_PORT') || 6379);

        // In E2E mode without an explicit Redis configuration, skip the real
        // connection to avoid noisy ECONNREFUSED errors in CI logs.  BullMQ
        // still gets a mock client so module resolution doesn't blow up.
        const e2e = config.get<string>('E2E') === 'true';
        if (e2e && !redisUrl && !config.get<string>('REDIS_HOST')) {
          logger.warn(
            'E2E mode without Redis — BullMQ job queues are disabled',
          );
          const mockClient = new Redis({
            lazyConnect: true,
            enableOfflineQueue: false,
            maxRetriesPerRequest: null,
          });
          mockClient.connect = () => Promise.resolve() as never;
          return { connection: mockClient };
        }

        const client = new Redis({
          host,
          port,
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          lazyConnect: true,
          connectTimeout: 2000,
          retryStrategy: () => undefined,
          reconnectOnError: () => false,
        });
        client.on('error', () => {});

        return { connection: client };
      },
    }),
    BullModule.registerQueue({
      name: 'app-jobs',
    }),
  ],
  exports: [BullModule],
})
export class AppBullMqModule {}
