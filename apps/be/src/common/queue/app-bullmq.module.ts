import { Module, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import Redis, { type RedisOptions } from 'ioredis';
import { AppJobsProcessor } from './app-jobs.processor';

class DevRedis extends Redis {
  override duplicate(overrideOptions?: RedisOptions): Redis {
    const dup = super.duplicate(overrideOptions);
    dup.on('error', () => {});
    return dup;
  }
}

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
            const client = new DevRedis(redisUrl, {
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

        const client = new DevRedis({
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
    BullModule.registerQueue(
      {
        name: 'app-jobs',
      },
      {
        name: 'clan-wars',
      },
    ),
  ],
  providers: [AppJobsProcessor],
  exports: [BullModule, AppJobsProcessor],
})
export class AppBullMqModule implements OnModuleInit {
  private readonly logger = new Logger(AppBullMqModule.name);

  constructor(
    @Optional()
    @InjectQueue('app-jobs')
    private readonly appJobsQueue?: Queue,
    @Optional()
    @InjectQueue('clan-wars')
    private readonly clanWarsQueue?: Queue,
  ) {}

  onModuleInit(): void {
    this.appJobsQueue?.on('error', (err: Error) => {
      this.logger.debug(`BullMQ app-jobs queue error: ${err.message}`);
    });
    this.clanWarsQueue?.on('error', (err: Error) => {
      this.logger.debug(`BullMQ clan-wars queue error: ${err.message}`);
    });
  }
}
