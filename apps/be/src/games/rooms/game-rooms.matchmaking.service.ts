import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';
import { GameRoomsService } from './game-rooms.service';
import { GameRoomsQuickplayService } from './game-rooms.quickplay.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { RedisMatchmakingQueue } from './redis-matchmaking-queue';

export interface QueueEntry {
  userId: string;
  socketId: string;
  gameId: string;
  variant?: string;
  ranked?: boolean;
  ip?: string;
  timestamp: number;
  timeoutId?: NodeJS.Timeout;
}

export interface MatchmakingStatus {
  gameId: string;
  variant?: string;
  ranked?: boolean;
  queueSize: number;
  position: number;
  playersAhead: number;
  estimatedWaitSeconds: number;
  activeQueues?: Record<string, number>;
  openRoomsCount?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const ESTIMATED_WAIT_WITH_PLAYERS_MS = 12_000;

/**
 * Matchmaking queue service with Redis backing for horizontal scaling.
 *
 * When Redis is available, the queue is stored in Redis sorted sets so all
 * BE instances share a single queue. When Redis is unavailable (dev mode),
 * falls back to the original in-memory implementation.
 */
@Injectable()
export class GameRoomsMatchmakingService {
  private readonly logger = new Logger(GameRoomsMatchmakingService.name);
  private readonly memoryQueue = new Map<string, Map<string, QueueEntry>>();
  private readonly memoryTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly redisQueue = new RedisMatchmakingQueue();

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly quickplayService: GameRoomsQuickplayService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly config: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis | null,
  ) {}

  private get timeoutMs(): number {
    const raw = this.config.get<string>('MATCHMAKING_TIMEOUT_MS');
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
  }

  private queueKey(gameId: string, variant?: string, ranked?: boolean): string {
    const base = variant ? `${gameId}::${variant}` : gameId;
    return ranked ? `${base}::ranked` : `${base}::casual`;
  }

  getQueueOverview(): Record<string, number> {
    if (this.redis) return {};
    const overview: Record<string, number> = {};
    for (const bucket of this.memoryQueue.values()) {
      for (const entry of bucket.values()) {
        overview[entry.gameId] = (overview[entry.gameId] ?? 0) + 1;
      }
    }
    return overview;
  }

  async getQueueOverviewAsync(): Promise<Record<string, number>> {
    if (!this.redis) return this.getQueueOverview();
    return this.redisQueue.getQueueOverview(this.redis);
  }

  async joinQueue(
    userId: string,
    socketId: string,
    gameId: string,
    variant?: string,
    ranked?: boolean,
    onSuccess?: (roomId: string) => void,
    ip?: string,
  ): Promise<void> {
    this.logger.log(
      `User ${userId} (socket ${socketId}) joining ${ranked ? 'ranked' : 'casual'} matchmaking queue for game ${gameId}${variant ? ` (${variant})` : ''}`,
    );

    await this.leaveQueue(userId);

    const match = await this.findMatch(gameId, variant, ranked, userId, ip);
    if (match) {
      this.logger.log(
        `Match found between ${userId} and ${match.userId} for game ${gameId}`,
      );
      await this.leaveQueue(match.userId);
      void this.createMatchedRoom(
        userId,
        match.userId,
        gameId,
        variant,
        ranked,
        onSuccess,
      );
      return;
    }

    const timestamp = Date.now();
    const entry: QueueEntry = {
      userId,
      socketId,
      gameId,
      variant,
      ranked,
      ip,
      timestamp,
    };

    if (this.redis) {
      await this.redisQueue.enqueue(this.redis, entry);
      const timeoutKey = `${userId}:${gameId}:${variant ?? ''}:${ranked ?? ''}`;
      const timeoutId = setTimeout(() => {
        void this.handleMatchmakingTimeout(
          userId,
          gameId,
          variant,
          ranked,
          onSuccess,
        );
      }, this.timeoutMs);
      this.memoryTimeouts.set(timeoutKey, timeoutId);
    } else {
      const timeoutId = setTimeout(() => {
        void this.handleMatchmakingTimeout(
          userId,
          gameId,
          variant,
          ranked,
          onSuccess,
        );
      }, this.timeoutMs);
      entry.timeoutId = timeoutId;

      const key = this.queueKey(gameId, variant, ranked);
      let bucket = this.memoryQueue.get(key);
      if (!bucket) {
        bucket = new Map();
        this.memoryQueue.set(key, bucket);
      }
      bucket.set(userId, entry);
    }

    await this.emitStatusesFor(gameId, variant, ranked);
  }

  async leaveQueue(userId: string): Promise<void> {
    if (this.redis) {
      await this.redisQueue.dequeue(this.redis, userId);
    } else {
      const entry = this.findEntryMemory(userId);
      if (!entry) return;
      if (entry.timeoutId) clearTimeout(entry.timeoutId);
      const key = this.queueKey(entry.gameId, entry.variant, entry.ranked);
      const bucket = this.memoryQueue.get(key);
      if (bucket) {
        bucket.delete(userId);
        if (bucket.size === 0) this.memoryQueue.delete(key);
      }
    }
  }

  private async findMatch(
    gameId: string,
    variant: string | undefined,
    ranked: boolean | undefined,
    excludeUserId: string,
    ip?: string,
  ): Promise<QueueEntry | null> {
    if (this.redis) {
      const isProd = this.config.get<string>('NODE_ENV') === 'production';
      return this.redisQueue.findMatch(
        this.redis,
        gameId,
        variant,
        ranked,
        excludeUserId,
        ip,
        isProd,
      );
    }
    return this.findMatchMemory(gameId, variant, ranked, excludeUserId, ip);
  }

  private findMatchMemory(
    gameId: string,
    variant: string | undefined,
    ranked: boolean | undefined,
    excludeUserId: string,
    ip?: string,
  ): QueueEntry | null {
    const bucket = this.memoryQueue.get(this.queueKey(gameId, variant, ranked));
    if (!bucket) return null;
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    for (const entry of bucket.values()) {
      if (entry.userId === excludeUserId) continue;
      if (isProd && ip && entry.ip && ip === entry.ip) continue;
      return entry;
    }
    return null;
  }

  private findEntryMemory(userId: string): QueueEntry | null {
    for (const bucket of this.memoryQueue.values()) {
      const entry = bucket.get(userId);
      if (entry) return entry;
    }
    return null;
  }

  private async createMatchedRoom(
    user1: string,
    user2: string,
    gameId: string,
    variant?: string,
    ranked?: boolean,
    onSuccess?: (roomId: string) => void,
  ): Promise<void> {
    try {
      const gameOptions: Record<string, unknown> = { ranked: ranked === true };
      if (variant) gameOptions.variant = variant;

      const room = await this.roomsService.createRoom(user1, {
        gameId,
        name: 'Open Match',
        visibility: 'public',
        maxPlayers: 2,
        gameOptions,
      });

      const joined = await this.roomsService.joinRoom(
        { roomId: room.id },
        user2,
      );

      this.realtimeService.emitRoomCreated(joined.room);
      this.realtimeService.emitPlayerJoined(joined.room, user2);

      if (onSuccess) {
        onSuccess(room.id);
      }
      this.realtimeService.emitMatchmakingSuccess(user1, room.id);
      this.realtimeService.emitMatchmakingSuccess(user2, room.id);
    } catch (err) {
      this.logger.error(`Failed to create matched room: ${String(err)}`);
    }
  }

  private async handleMatchmakingTimeout(
    userId: string,
    gameId: string,
    variant?: string,
    ranked?: boolean,
    onSuccess?: (roomId: string) => void,
  ): Promise<void> {
    const entry = this.redis
      ? await this.redisQueue.findEntry(this.redis, userId)
      : this.findEntryMemory(userId);
    if (!entry) return;

    await this.leaveQueue(userId);

    const queuedOpponent = await this.findMatch(
      gameId,
      variant,
      ranked,
      userId,
      entry.ip,
    );
    if (queuedOpponent) {
      this.logger.log(
        `Matchmaking timeout for user ${userId}; pairing with queued ${queuedOpponent.userId}`,
      );
      await this.leaveQueue(queuedOpponent.userId);
      void this.createMatchedRoom(
        userId,
        queuedOpponent.userId,
        gameId,
        variant,
        ranked,
        onSuccess,
      );
      return;
    }

    this.logger.log(
      `Matchmaking timeout for user ${userId}. Falling back to bot.`,
    );

    try {
      const botRoom = await this.quickplayService.createQuickplayRoom(
        userId,
        gameId,
        variant,
      );
      if (onSuccess) {
        onSuccess(botRoom.id);
      }
      this.realtimeService.emitMatchmakingSuccess(userId, botRoom.id);
    } catch (err) {
      this.logger.error(`Failed to create fallback bot room: ${String(err)}`);
    }
  }

  private async emitStatus(
    userId: string,
    gameId: string,
    variant?: string,
    ranked?: boolean,
  ): Promise<void> {
    const queueSize = this.redis
      ? await this.redisQueue.getSize(this.redis, gameId, variant, ranked)
      : this.getQueueSizeMemory(gameId, variant, ranked);
    const position = this.redis
      ? await this.redisQueue.getPosition(
          this.redis,
          userId,
          gameId,
          variant,
          ranked,
        )
      : this.getPositionMemory(userId, gameId, variant, ranked);
    const playersAhead = Math.max(0, position - 1);
    this.realtimeService.emitToUser(userId, 'games.matchmaking.status', {
      gameId,
      variant,
      ranked,
      queueSize,
      position,
      playersAhead,
      estimatedWaitSeconds: this.estimateWaitSeconds(queueSize, position),
      activeQueues: await this.getQueueOverviewAsync(),
      openRoomsCount: 0,
    } satisfies MatchmakingStatus);
  }

  private async emitStatusesFor(
    gameId: string,
    variant?: string,
    ranked?: boolean,
  ): Promise<void> {
    if (this.redis) {
      const userIds = await this.redisQueue.getUserIdsInQueue(
        this.redis,
        gameId,
        variant,
        ranked,
      );
      for (const userId of userIds) {
        void this.emitStatus(userId, gameId, variant, ranked);
      }
    } else {
      const key = this.queueKey(gameId, variant, ranked);
      const bucket = this.memoryQueue.get(key);
      if (!bucket) return;
      for (const entry of bucket.values()) {
        void this.emitStatus(entry.userId, gameId, variant, entry.ranked);
      }
    }
  }

  private getQueueSizeMemory(
    gameId: string,
    variant?: string,
    ranked?: boolean,
  ): number {
    const key = this.queueKey(gameId, variant, ranked);
    return this.memoryQueue.get(key)?.size ?? 0;
  }

  private getPositionMemory(
    userId: string,
    gameId: string,
    variant?: string,
    ranked?: boolean,
  ): number {
    const key = this.queueKey(gameId, variant, ranked);
    const bucket = this.memoryQueue.get(key);
    if (!bucket) return 0;
    let index = 0;
    for (const queuedUserId of bucket.keys()) {
      index += 1;
      if (queuedUserId === userId) return index;
    }
    return 0;
  }

  private estimateWaitSeconds(queueSize: number, position: number): number {
    const remainingMs = this.timeoutMs;
    if (queueSize >= 2 && position === 1) {
      return Math.max(2, Math.round(ESTIMATED_WAIT_WITH_PLAYERS_MS / 1000));
    }
    const ahead = Math.max(0, position - 1);
    return Math.max(2, Math.round(remainingMs / 1000) + ahead * 5);
  }
}
