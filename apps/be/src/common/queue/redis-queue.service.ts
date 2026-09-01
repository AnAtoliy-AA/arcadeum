import { Injectable, Logger, Optional, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface QueueJob<T = Record<string, unknown>> {
  id: string;
  name: string;
  data: T;
  attempts: number;
  maxAttempts: number;
  timestamp: number;
  delayUntil?: number;
}

export type JobHandler<T = Record<string, unknown>> = (
  job: QueueJob<T>,
) => Promise<void>;

@Injectable()
export class RedisQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisQueueService.name);
  private redisClient: Redis | null = null;
  private readonly handlers = new Map<string, JobHandler<never>>();
  private readonly localQueue: QueueJob<unknown>[] = [];
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(@Optional() private readonly configService?: ConfigService) {
    const redisUrl = this.configService?.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
          lazyConnect: true,
        });
        this.redisClient.on('error', (err: Error) => {
          this.logger.warn(`Queue Redis error: ${err.message}`);
        });
        this.redisClient.connect().catch((err: Error) => {
          this.logger.warn(`Queue Redis connect failed: ${err.message}`);
        });
      } catch (err) {
        this.logger.warn(
          `Queue Redis init failed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  onModuleDestroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  registerWorker<T = Record<string, unknown>>(
    jobName: string,
    handler: JobHandler<T>,
  ): void {
    this.handlers.set(jobName, handler);
  }

  async addJob<T = Record<string, unknown>>(
    name: string,
    data: T,
    options?: { delayMs?: number; maxAttempts?: number },
  ): Promise<string> {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job: QueueJob<T> = {
      id,
      name,
      data,
      attempts: 0,
      maxAttempts: options?.maxAttempts ?? 3,
      timestamp: Date.now(),
      delayUntil: options?.delayMs ? Date.now() + options.delayMs : undefined,
    };

    if (this.redisClient && this.redisClient.status === 'ready') {
      try {
        await this.redisClient.lpush(`queue:${name}`, JSON.stringify(job));
        return id;
      } catch (err) {
        this.logger.warn(`Redis queue addJob failed: ${String(err)}`);
      }
    }

    this.localQueue.push(job);
    void this.processLocalJob(job);
    return id;
  }

  private async processLocalJob(job: QueueJob<unknown>): Promise<void> {
    const handler = this.handlers.get(job.name);
    if (!handler) return;

    if (job.delayUntil && job.delayUntil > Date.now()) {
      const wait = job.delayUntil - Date.now();
      setTimeout(() => {
        void this.processLocalJob(job);
      }, wait);
      return;
    }

    try {
      job.attempts += 1;
      await handler(job as never);
    } catch (err) {
      this.logger.warn(`Job ${job.id} failed: ${String(err)}`);
      if (job.attempts < job.maxAttempts) {
        void this.processLocalJob(job);
      }
    }
  }
}
