import type Redis from 'ioredis';

const LOCK_PREFIX = 'room:lock:';
const LOCK_TTL_MS = 10_000;

/**
 * Distributed room action mutex backed by Redis.
 *
 * Replaces the in-memory `roomLocks` Map in BaseGameService so that
 * concurrent HTTP/WebSocket requests hitting different BE instances for
 * the same room are serialized correctly.
 *
 * Falls back to in-memory when no Redis client is provided (dev mode).
 */
export class DistributedRoomLock {
  private readonly memoryLocks = new Map<string, Promise<void>>();

  constructor(private readonly redis?: Redis | null) {}

  /**
   * Acquire the lock for `roomId`, execute `fn`, then release.
   * Uses a promise chain per room to serialize within a single process,
   * and Redis SET NX PX for cross-process serialization.
   */
  async runLocked<T>(roomId: string, fn: () => Promise<T>): Promise<T> {
    if (this.redis) {
      return this.runLockedRedis(roomId, fn);
    }
    return this.runLockedMemory(roomId, fn);
  }

  private async runLockedRedis<T>(
    roomId: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const lockKey = `${LOCK_PREFIX}${roomId}`;
    const lockValue = `${process.pid}:${Date.now()}`;

    // Spin-wait for the lock with exponential backoff
    const maxAttempts = 50;
    const baseDelay = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const acquired = await this.redis!.set(
        lockKey,
        lockValue,
        'PX',
        LOCK_TTL_MS,
        'NX',
      );

      if (acquired) {
        try {
          return await fn();
        } finally {
          // Only delete if we still own the lock (value matches)
          const current = await this.redis!.get(lockKey);
          if (current === lockValue) {
            await this.redis!.del(lockKey).catch(() => {});
          }
        }
      }

      // Exponential backoff with jitter
      const delay = baseDelay * 2 ** Math.min(attempt, 5);
      const jitter = Math.random() * baseDelay;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }

    // Last resort: force-acquire by overwriting (stale lock)
    await this.redis!.set(lockKey, lockValue, 'PX', LOCK_TTL_MS);
    try {
      return await fn();
    } finally {
      const current = await this.redis!.get(lockKey);
      if (current === lockValue) {
        await this.redis!.del(lockKey).catch(() => {});
      }
    }
  }

  private async runLockedMemory<T>(
    roomId: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const prev = this.memoryLocks.get(roomId) ?? Promise.resolve();
    let release: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.memoryLocks.set(roomId, next);
    await prev;

    try {
      return await fn();
    } finally {
      release!();
      if (this.memoryLocks.get(roomId) === next) {
        this.memoryLocks.delete(roomId);
      }
    }
  }
}
