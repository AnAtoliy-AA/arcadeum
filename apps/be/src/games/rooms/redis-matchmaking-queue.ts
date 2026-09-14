import type Redis from 'ioredis';
import type { QueueEntry } from './game-rooms.matchmaking.service';

export interface RedisQueueEntry {
  userId: string;
  socketId: string;
  gameId: string;
  variant?: string;
  ranked?: boolean;
  rating?: number;
  ip?: string;
  timestamp: number;
}

const QUEUE_PREFIX = 'mm:queue:';
const QUEUE_INDEX_PREFIX = 'mm:queue:index';
const ENTRY_TTL_SECONDS = 60;
const RATING_RANGE_INITIAL = 100;
const RATING_RANGE_EXPAND = 50;
const RATING_RANGE_MAX = 300;

/**
 * Redis-backed matchmaking queue for horizontal scaling.
 * Stores queue entries in Redis sorted sets with timestamp as score.
 */
export class RedisMatchmakingQueue {
  private queueKey(gameId: string, variant?: string, ranked?: boolean): string {
    const base = variant ? `${gameId}::${variant}` : gameId;
    const suffix = ranked ? 'ranked' : 'casual';
    return `${QUEUE_PREFIX}${base}::${suffix}`;
  }

  async enqueue(redis: Redis, entry: QueueEntry): Promise<void> {
    const key = this.queueKey(entry.gameId, entry.variant, entry.ranked);
    const redisEntry: RedisQueueEntry = {
      userId: entry.userId,
      socketId: entry.socketId,
      gameId: entry.gameId,
      variant: entry.variant,
      ranked: entry.ranked,
      rating: entry.rating,
      ip: entry.ip,
      timestamp: entry.timestamp,
    };
    await redis.zadd(key, entry.timestamp, JSON.stringify(redisEntry));
    await redis.expire(key, ENTRY_TTL_SECONDS);
    await redis.set(
      `${QUEUE_INDEX_PREFIX}:${entry.userId}`,
      key,
      'EX',
      ENTRY_TTL_SECONDS,
    );
  }

  async dequeue(redis: Redis, userId: string): Promise<void> {
    const queueKey = await redis.get(`${QUEUE_INDEX_PREFIX}:${userId}`);
    if (!queueKey) return;

    const members = await redis.zrange(queueKey, 0, -1);
    for (const member of members) {
      const entry = JSON.parse(member) as RedisQueueEntry;
      if (entry.userId === userId) {
        await redis.zrem(queueKey, member);
        break;
      }
    }
    await redis.del(`${QUEUE_INDEX_PREFIX}:${userId}`);

    const size = await redis.zcard(queueKey);
    if (size === 0) {
      await redis.del(queueKey);
    }
  }

  async findMatch(
    redis: Redis,
    gameId: string,
    variant: string | undefined,
    ranked: boolean | undefined,
    excludeUserId: string,
    ip?: string,
    isProd = false,
    myRating?: number,
  ): Promise<QueueEntry | null> {
    const key = this.queueKey(gameId, variant, ranked);

    // Rating-based matching: use ZRANGEBYSCORE for efficient range query (O(log N))
    if (myRating !== undefined) {
      for (
        let range = RATING_RANGE_INITIAL;
        range <= RATING_RANGE_MAX;
        range += RATING_RANGE_EXPAND
      ) {
        const candidates = await redis.zrangebyscore(
          key,
          myRating - range,
          myRating + range,
        );
        for (const member of candidates) {
          const entry = JSON.parse(member) as RedisQueueEntry;
          if (entry.userId === excludeUserId) continue;
          if (isProd && ip && entry.ip && ip === entry.ip) continue;
          return { ...entry, timeoutId: undefined };
        }
      }
    }

    // Fallback: first-come-first-served — just get the first member (O(1))
    const members = await redis.zrange(key, 0, 0);
    if (members.length === 0) return null;
    const entry = JSON.parse(members[0]) as RedisQueueEntry;
    if (entry.userId === excludeUserId) return null;
    if (isProd && ip && entry.ip && ip === entry.ip) return null;
    return { ...entry, timeoutId: undefined };
  }

  async findEntry(redis: Redis, userId: string): Promise<QueueEntry | null> {
    const queueKey = await redis.get(`${QUEUE_INDEX_PREFIX}:${userId}`);
    if (!queueKey) return null;

    const members = await redis.zrange(queueKey, 0, -1);
    for (const member of members) {
      const entry = JSON.parse(member) as RedisQueueEntry;
      if (entry.userId === userId) {
        return { ...entry, timeoutId: undefined };
      }
    }
    return null;
  }

  async getSize(
    redis: Redis,
    gameId: string,
    variant?: string,
    ranked?: boolean,
  ): Promise<number> {
    const key = this.queueKey(gameId, variant, ranked);
    return redis.zcard(key);
  }

  async getPosition(
    redis: Redis,
    userId: string,
    gameId: string,
    variant?: string,
    ranked?: boolean,
  ): Promise<number> {
    const key = this.queueKey(gameId, variant, ranked);
    const members = await redis.zrange(key, 0, -1);
    for (let i = 0; i < members.length; i++) {
      const entry = JSON.parse(members[i]) as RedisQueueEntry;
      if (entry.userId === userId) return i + 1;
    }
    return 0;
  }

  async getQueueOverview(redis: Redis): Promise<Record<string, number>> {
    const overview: Record<string, number> = {};
    const pattern = `${QUEUE_PREFIX}*`;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      for (const key of keys) {
        const size = await redis.zcard(key);
        const parts = key.replace(QUEUE_PREFIX, '').split('::');
        const gameId = parts[0];
        if (gameId) {
          overview[gameId] = (overview[gameId] ?? 0) + size;
        }
      }
    } while (cursor !== '0');
    return overview;
  }

  async getUserIdsInQueue(
    redis: Redis,
    gameId: string,
    variant?: string,
    ranked?: boolean,
  ): Promise<string[]> {
    const key = this.queueKey(gameId, variant, ranked);
    const members = await redis.zrange(key, 0, -1);
    return members.map((m) => (JSON.parse(m) as RedisQueueEntry).userId);
  }

  async getQueuedFriends(
    redis: Redis,
    friendIds: string[],
    gameId?: string,
    variant?: string,
    ranked?: boolean,
  ): Promise<Array<{ userId: string; gameId: string; rating?: number }>> {
    if (friendIds.length === 0) return [];
    const friendSet = new Set(friendIds);
    const results: Array<{ userId: string; gameId: string; rating?: number }> =
      [];

    // Fast path: only scan the specific game queue (O(queue size))
    if (gameId) {
      const key = this.queueKey(gameId, variant, ranked);
      const members = await redis.zrange(key, 0, -1);
      for (const m of members) {
        const entry = JSON.parse(m) as RedisQueueEntry;
        if (friendSet.has(entry.userId)) {
          results.push({
            userId: entry.userId,
            gameId: entry.gameId,
            rating: entry.rating,
          });
        }
      }
      return results;
    }

    // Slow path: scan all queues with SCAN (non-blocking, iterable)
    const pattern = `${QUEUE_PREFIX}*`;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      for (const key of keys) {
        const members = await redis.zrange(key, 0, -1);
        for (const m of members) {
          const entry = JSON.parse(m) as RedisQueueEntry;
          if (friendSet.has(entry.userId)) {
            results.push({
              userId: entry.userId,
              gameId: entry.gameId,
              rating: entry.rating,
            });
          }
        }
      }
    } while (cursor !== '0');
    return results;
  }
}
