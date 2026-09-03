import type Redis from 'ioredis';

const REDIS_LOCK_PREFIX = 'bot:turn:';

/**
 * Single-flight lock for bot turns.
 *
 * Bot `checkAndPlay` calls can race: every session action re-triggers the
 * current bot, and the watchdog revives stale sessions on its own cadence.
 * Without a lock each trigger spawns its own "sleep then act" chain and the
 * duplicates interleave with real turns, producing irregular pacing in
 * AI-vs-AI matches.
 *
 * Entries carry a timestamp so a crashed/hung chain cannot deadlock a room
 * forever: once an entry outlives `ttlMs`, `tryAcquire` overrides it (the
 * caller is expected to log the override like Sea Battle does).
 *
 * When a Redis client is provided, the lock is distributed across all BE
 * instances so only one worker processes a bot turn at a time.
 */
export class BotTurnLock {
  private readonly entries = new Map<string, number>();

  constructor(
    private readonly ttlMs = 60_000,
    private readonly redis?: Redis | null,
  ) {}

  /**
   * Acquire the lock for `key`. Returns false when another chain currently
   * holds a fresh (non-expired) lock; true otherwise (including when an
   * expired entry was overridden).
   */
  async tryAcquire(key: string, now = Date.now()): Promise<boolean> {
    if (this.redis) {
      return this.tryAcquireRedis(key, now);
    }
    return this.tryAcquireMemory(key, now);
  }

  /** Age of the existing lock in ms, or null when not locked. */
  async ageOf(key: string, now = Date.now()): Promise<number | null> {
    if (this.redis) {
      return this.ageOfRedis(key, now);
    }
    return this.ageOfMemory(key, now);
  }

  async release(key: string): Promise<void> {
    if (this.redis) {
      await this.releaseRedis(key);
    } else {
      this.releaseMemory(key);
    }
  }

  private tryAcquireMemory(key: string, now: number): boolean {
    this.sweep(now);
    const heldSince = this.entries.get(key);
    if (heldSince !== undefined && now - heldSince < this.ttlMs) {
      return false;
    }
    this.entries.set(key, now);
    return true;
  }

  private async tryAcquireRedis(key: string, now: number): Promise<boolean> {
    if (!this.redis) return false;
    const lockKey = `${REDIS_LOCK_PREFIX}${key}`;
    const result = await this.redis.set(
      lockKey,
      `${process.pid}:${now}`,
      'PX',
      this.ttlMs,
      'NX',
    );
    return result !== null;
  }

  private ageOfMemory(key: string, now: number): number | null {
    const heldSince = this.entries.get(key);
    if (heldSince === undefined) return null;
    return now - heldSince;
  }

  private async ageOfRedis(key: string, _now: number): Promise<number | null> {
    if (!this.redis) return null;
    const lockKey = `${REDIS_LOCK_PREFIX}${key}`;
    const ttl = await this.redis.pttl(lockKey);
    if (ttl <= 0) return null;
    return this.ttlMs - ttl;
  }

  private releaseMemory(key: string): void {
    this.entries.delete(key);
  }

  private async releaseRedis(key: string): Promise<void> {
    if (!this.redis) return;
    const lockKey = `${REDIS_LOCK_PREFIX}${key}`;
    await this.redis.del(lockKey).catch(() => {});
  }

  private sweep(now: number): void {
    for (const [key, heldSince] of this.entries) {
      if (now - heldSince >= this.ttlMs) this.entries.delete(key);
    }
  }
}
