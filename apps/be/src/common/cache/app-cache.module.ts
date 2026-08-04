import { CacheModule } from '@nestjs/cache-manager';
import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisInsStore } from 'cache-manager-ioredis-yet';
import Redis from 'ioredis';

const DEFAULT_TTL_MS = 60_000;

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const logger = new Logger('AppCacheModule');
        const redisUrl = config.get<string>('REDIS_URL');
        const rawTtl = config.get<string>('APP_CACHE_TTL_SECONDS');
        const ttlMs =
          rawTtl !== undefined && rawTtl !== ''
            ? Number(rawTtl) * 1000
            : DEFAULT_TTL_MS;

        if (redisUrl) {
          try {
            const client = new Redis(redisUrl, {
              maxRetriesPerRequest: 3,
              enableOfflineQueue: false,
              lazyConnect: true,
            });
            client.on('error', (err: Error) => {
              logger.error(`AppCache Redis error: ${err.message}`);
            });
            // Await connect to make useFactory async properly
            await client.connect().catch((err: Error) => {
              logger.warn(`Redis connection failed on startup: ${err.message}`);
            });
            logger.log('AppCacheModule using Redis store');
            return {
              store: redisInsStore(client),
              ttl: ttlMs,
            };
          } catch (err) {
            logger.warn(
              `AppCacheModule Redis init failed, falling back to in-memory: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }

        logger.warn('AppCacheModule using in-memory store (no REDIS_URL set)');
        return { ttl: DEFAULT_TTL_MS };
      },
    }),
  ],
})
export class AppCacheModule {}
