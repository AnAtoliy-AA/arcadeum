import { Logger } from '@nestjs/common';
import type Redis from 'ioredis';

export const ONLINE_USERS_KEY = 'arcadeum:online:users';
export const ONLINE_TTL_MS = 90_000;

const MEMBER_SEP = '|';

export function presenceMember(userId: string, socketId: string): string {
  return `${userId}${MEMBER_SEP}${socketId}`;
}

export function presenceUserOf(member: string): string {
  const idx = member.indexOf(MEMBER_SEP);
  return idx === -1 ? member : member.slice(0, idx);
}

export class OnlinePresence {
  private readonly logger = new Logger(OnlinePresence.name);
  private readonly socketsByUser = new Map<string, Set<string>>();
  private lastKnownCount = 0;

  constructor(private readonly resolveRedis: () => Redis | null) {}

  getSockets(userId: string): ReadonlySet<string> | undefined {
    return this.socketsByUser.get(userId);
  }

  async track(userId: string, socketId: string): Promise<void> {
    let sockets = this.socketsByUser.get(userId);
    if (!sockets) {
      sockets = new Set();
      this.socketsByUser.set(userId, sockets);
    }
    sockets.add(socketId);

    const redis = this.resolveRedis();
    if (!redis) return;
    try {
      await redis.zadd(
        ONLINE_USERS_KEY,
        Date.now(),
        presenceMember(userId, socketId),
      );
    } catch (err) {
      this.logger.warn(`Redis presence track failed: ${err}`);
    }
  }

  async refresh(socketId: string, userId: string): Promise<void> {
    if (!userId) return;
    const redis = this.resolveRedis();
    if (!redis) return;
    try {
      await redis.zadd(
        ONLINE_USERS_KEY,
        Date.now(),
        presenceMember(userId, socketId),
      );
    } catch (err) {
      this.logger.warn(`Redis presence refresh failed: ${err}`);
    }
  }

  async untrack(userId: string, socketId: string): Promise<void> {
    const sockets = this.socketsByUser.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.socketsByUser.delete(userId);
      }
    }

    const redis = this.resolveRedis();
    if (!redis) return;
    try {
      await redis.zrem(ONLINE_USERS_KEY, presenceMember(userId, socketId));
    } catch (err) {
      this.logger.warn(`Redis presence untrack failed: ${err}`);
    }
  }

  async count(): Promise<number> {
    const redis = this.resolveRedis();
    if (redis) {
      try {
        const staleThreshold = Date.now() - ONLINE_TTL_MS;
        await redis.zremrangebyscore(
          ONLINE_USERS_KEY,
          '-inf',
          String(staleThreshold),
        );
        const members = await redis.zrangebyscore(
          ONLINE_USERS_KEY,
          String(staleThreshold),
          '+inf',
        );
        const users = new Set<string>();
        for (const member of members) {
          users.add(presenceUserOf(member));
        }
        this.lastKnownCount = users.size;
        return users.size;
      } catch (err) {
        this.logger.warn(`Redis presence count failed: ${err}`);
      }
    }
    if (this.socketsByUser.size > 0) {
      return this.socketsByUser.size;
    }
    return this.lastKnownCount;
  }
}
