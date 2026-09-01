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

        const client = new Redis({
          host: config.get<string>('REDIS_HOST') || '127.0.0.1',
          port: Number(config.get<string>('REDIS_PORT') || 6379),
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          lazyConnect: true,
          retryStrategy: () => null,
          reconnectOnError: () => false,
        });
        client.on('error', (err: Error) => {
          logger.debug(`BullMQ local fallback offline: ${err.message}`);
        });

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
