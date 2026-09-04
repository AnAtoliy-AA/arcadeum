import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RATE_STATE_STORE, MemoryRateStateStore } from './rate-state.store';
import { RedisRateStateStore } from './redis-rate-state.store';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RATE_STATE_STORE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const backend = config.get<string>('RATE_STATE_BACKEND');
        const redisUrl = config.get<string>('REDIS_URL');
        const logger = new Logger('RateStateModule');

        if (backend === 'redis' && redisUrl) {
          try {
            const redis = new Redis(redisUrl, {
              maxRetriesPerRequest: 3,
              enableOfflineQueue: true,
              lazyConnect: true,
            });
            redis.on('error', (err: Error) => {
              logger.error(`Redis connection error: ${err.message}`);
            });
            void redis.connect();
            logger.log('Using Redis-backed rate state store');
            return new RedisRateStateStore(redis);
          } catch (err) {
            logger.warn(
              `Failed to connect to Redis, falling back to in-memory store: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }

        if (backend === 'redis' && !redisUrl) {
          logger.warn(
            'RATE_STATE_BACKEND=redis set but REDIS_URL missing — falling back to in-memory store',
          );
        }

        logger.warn(
          'Using in-memory rate state store (resets on restart, not shared across instances)',
        );
        return new MemoryRateStateStore();
      },
    },
  ],
  exports: [RATE_STATE_STORE],
})
export class RateStateModule {}
