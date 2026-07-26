import Redis from 'ioredis';
import { RateStateStore } from './rate-state.store';

export class RedisRateStateStore implements RateStateStore {
  constructor(private readonly redis: Redis) {}

  async increment(key: string, windowMs: number): Promise<number> {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.pexpire(key, windowMs);
    }
    return count;
  }

  async set(key: string, value: number, ttlMs: number): Promise<void> {
    await this.redis.set(key, String(value), 'PX', ttlMs);
  }

  async get(key: string): Promise<number | null> {
    const raw = await this.redis.get(key);
    if (raw === null) return null;
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
  }

  async setString(key: string, value: string, ttlMs: number): Promise<void> {
    await this.redis.set(key, value, 'PX', ttlMs);
  }

  async getString(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
