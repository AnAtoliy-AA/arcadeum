import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { GameRoomsService } from '../rooms/game-rooms.service';

interface MatchmakingEntry {
  userId: string;
  rating: number;
  timeControlType: string;
  joinedAt: number;
}

interface MatchResult {
  roomId: string;
  white: string;
  black: string;
}

const QUEUE_PREFIX = 'chess:matchmaking:';
const RATING_RANGE_INITIAL = 100;
const RATING_RANGE_EXPAND = 50;
const RATING_RANGE_MAX = 300;
const EXPAND_INTERVAL_MS = 5000;

@Injectable()
export class ChessMatchmakingService {
  private readonly logger = new Logger(ChessMatchmakingService.name);

  constructor(
    private readonly roomsService: GameRoomsService,
    @InjectConnection() private readonly mongoConnection: Connection,
    @InjectConnection('REDIS_CONNECTION') private readonly redis: Redis | null,
  ) {}

  async joinQueue(
    userId: string,
    rating: number,
    timeControlType: string,
  ): Promise<{ queued: boolean; position: number }> {
    if (!this.redis) {
      this.logger.warn('Redis not available for matchmaking');
      return { queued: false, position: 0 };
    }

    const queueKey = `${QUEUE_PREFIX}${timeControlType}`;
    const entry: MatchmakingEntry = {
      userId,
      rating,
      timeControlType,
      joinedAt: Date.now(),
    };

    const existingScore = await this.redis.zscore(queueKey, userId);
    if (existingScore) {
      const position = await this.redis.zrank(queueKey, userId);
      return { queued: true, position: position ?? 0 };
    }

    await this.redis.zadd(queueKey, rating, userId);
    await this.redis.set(
      `${QUEUE_PREFIX}user:${userId}`,
      JSON.stringify(entry),
      'EX',
      300,
    );

    const position = await this.redis.zrank(queueKey, userId);
    this.logger.log(
      `User ${userId} joined matchmaking queue (${timeControlType}) at position ${position}`,
    );

    return { queued: true, position: position ?? 0 };
  }

  async leaveQueue(userId: string, timeControlType: string): Promise<void> {
    if (!this.redis) return;

    const queueKey = `${QUEUE_PREFIX}${timeControlType}`;
    await this.redis.zrem(queueKey, userId);
    await this.redis.del(`${QUEUE_PREFIX}user:${userId}`);
    this.logger.log(
      `User ${userId} left matchmaking queue (${timeControlType})`,
    );
  }

  async findMatch(
    userId: string,
    timeControlType: string,
  ): Promise<MatchResult | null> {
    if (!this.redis) return null;

    const queueKey = `${QUEUE_PREFIX}${timeControlType}`;
    const userData = await this.redis.get(`${QUEUE_PREFIX}user:${userId}`);
    if (!userData) return null;

    const entry = JSON.parse(userData) as MatchmakingEntry;
    const waitTime = Date.now() - entry.joinedAt;
    const rangeExpansion =
      Math.floor(waitTime / EXPAND_INTERVAL_MS) * RATING_RANGE_EXPAND;
    const maxRange = Math.min(
      RATING_RANGE_INITIAL + rangeExpansion,
      RATING_RANGE_MAX,
    );

    const minRating = entry.rating - maxRange;
    const maxRating = entry.rating + maxRange;

    const candidates = await this.redis.zrangebyscore(
      queueKey,
      minRating,
      maxRating,
    );

    const opponentId = candidates.find((id) => id !== userId);
    if (!opponentId) return null;

    const opponentData = await this.redis.get(
      `${QUEUE_PREFIX}user:${opponentId}`,
    );
    if (!opponentData) return null;

    await this.redis.zrem(queueKey, userId);
    await this.redis.zrem(queueKey, opponentId);
    await this.redis.del(`${QUEUE_PREFIX}user:${userId}`);
    await this.redis.del(`${QUEUE_PREFIX}user:${opponentId}`);

    const matchId = uuidv4();
    const roomId = `matchmaking-${matchId}`;

    const white = Math.random() < 0.5 ? userId : opponentId;
    const black = white === opponentId ? userId : opponentId;

    this.logger.log(`Match found: ${white} vs ${black} in room ${roomId}`);

    return { roomId, white, black };
  }

  async getQueueSize(timeControlType: string): Promise<number> {
    if (!this.redis) return 0;
    return this.redis.zcard(`${QUEUE_PREFIX}${timeControlType}`);
  }

  async getQueuePosition(
    userId: string,
    timeControlType: string,
  ): Promise<number> {
    if (!this.redis) return -1;
    const rank = await this.redis.zrank(
      `${QUEUE_PREFIX}${timeControlType}`,
      userId,
    );
    return rank ?? -1;
  }
}
