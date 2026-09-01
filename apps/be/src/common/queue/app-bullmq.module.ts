import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

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
            const parsed = new URL(redisUrl);
            logger.log(
              `BullMQ configured with Redis at ${parsed.hostname}:${parsed.port || '6379'}`,
            );
            return {
              connection: {
                host: parsed.hostname,
                port: Number(parsed.port || 6379),
                password: parsed.password
                  ? decodeURIComponent(parsed.password)
                  : undefined,
                username: parsed.username
                  ? decodeURIComponent(parsed.username)
                  : undefined,
                maxRetriesPerRequest: null,
              },
            };
          } catch (err) {
            logger.warn(
              `BullMQ invalid REDIS_URL (${redisUrl}): ${String(err)}`,
            );
          }
        }

        logger.log('BullMQ configured with default local Redis connection');
        return {
          connection: {
            host: 'localhost',
            port: 6379,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: 'app-jobs',
    }),
  ],
  exports: [BullModule],
})
export class AppBullMqModule {}
