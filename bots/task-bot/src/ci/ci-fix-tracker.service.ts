import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const PREFIX = 'task-bot:ci-fix:';
const DEFAULT_MAX_ATTEMPTS = 3;
const TTL_SECONDS = 3600;

@Injectable()
export class CIFixTrackerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CIFixTrackerService.name);
  private redis!: Redis;
  private readonly maxAttempts: number;

  constructor(private readonly config: ConfigService) {
    this.maxAttempts = parseInt(
      this.config.get<string>('CI_FIX_MAX_ATTEMPTS') ?? String(DEFAULT_MAX_ATTEMPTS),
      10,
    );
  }

  async onModuleInit() {
    const host = this.config.get<string>('REDIS_HOST') ?? '127.0.0.1';
    const port = parseInt(this.config.get<string>('REDIS_PORT') ?? '6379', 10);
    const password = this.config.get<string>('REDIS_PASSWORD');
    this.redis = new Redis({ host, port, password });
    this.logger.log(`CIFixTracker initialized (maxAttempts=${this.maxAttempts})`);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async incrementAttempts(prNumber: string): Promise<number> {
    const key = `${PREFIX}${prNumber}`;
    const count = await this.redis.incr(key);
    await this.redis.expire(key, TTL_SECONDS);
    this.logger.log(`CI fix attempt ${count}/${this.maxAttempts} for PR #${prNumber}`);
    return count;
  }

  async getAttempts(prNumber: string): Promise<number> {
    const key = `${PREFIX}${prNumber}`;
    const val = await this.redis.get(key);
    return val ? parseInt(val, 10) : 0;
  }

  async canRetry(prNumber: string): Promise<boolean> {
    const attempts = await this.getAttempts(prNumber);
    return attempts < this.maxAttempts;
  }

  async resetAttempts(prNumber: string): Promise<void> {
    const key = `${PREFIX}${prNumber}`;
    await this.redis.del(key);
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}
