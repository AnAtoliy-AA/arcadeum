import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GameRoomsService } from './game-rooms.service';
import { GameRoomsQuickplayService } from './game-rooms.quickplay.service';
import { GamesRealtimeService } from '../games.realtime.service';

export interface QueueEntry {
  userId: string;
  socketId: string;
  gameId: string;
  variant?: string;
  ranked?: boolean;
  ip?: string;
  timestamp: number;
  timeoutId: NodeJS.Timeout;
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

@Injectable()
export class GameRoomsMatchmakingService {
  private readonly logger = new Logger(GameRoomsMatchmakingService.name);
  private readonly queue = new Map<string, Map<string, QueueEntry>>();

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly quickplayService: GameRoomsQuickplayService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly config: ConfigService,
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
    const overview: Record<string, number> = {};
    for (const bucket of this.queue.values()) {
      for (const entry of bucket.values()) {
        overview[entry.gameId] = (overview[entry.gameId] ?? 0) + 1;
      }
    }
    return overview;
  }

  joinQueue(
    userId: string,
    socketId: string,
    gameId: string,
    variant?: string,
    ranked?: boolean,
    onSuccess?: (roomId: string) => void,
    ip?: string,
  ): void {
    this.logger.log(
      `User ${userId} (socket ${socketId}) joining ${ranked ? 'ranked' : 'casual'} matchmaking queue for game ${gameId}${variant ? ` (${variant})` : ''}`,
    );

    this.leaveQueue(userId);

    const match = this.findMatch(gameId, variant, ranked, userId, ip);
    if (match) {
      this.logger.log(
        `Match found between ${userId} and ${match.userId} for game ${gameId}`,
      );
      this.leaveQueue(match.userId);
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

    const timeoutId = setTimeout(() => {
      void this.handleMatchmakingTimeout(
        userId,
        gameId,
        variant,
        ranked,
        onSuccess,
      );
    }, this.timeoutMs);

    const key = this.queueKey(gameId, variant, ranked);
    let bucket = this.queue.get(key);
    if (!bucket) {
      bucket = new Map();
      this.queue.set(key, bucket);
    }
    bucket.set(userId, {
      userId,
      socketId,
      gameId,
      variant,
      ranked,
      ip,
      timestamp: Date.now(),
      timeoutId,
    });

    this.emitStatusesFor(gameId, variant, ranked);
  }

  leaveQueue(userId: string): void {
    const entry = this.findEntry(userId);
    if (!entry) {
      return;
    }
    clearTimeout(entry.timeoutId);
    const key = this.queueKey(entry.gameId, entry.variant, entry.ranked);
    const bucket = this.queue.get(key);
    if (bucket) {
      bucket.delete(userId);
      if (bucket.size === 0) {
        this.queue.delete(key);
      }
    }
    this.emitStatusesFor(entry.gameId, entry.variant, entry.ranked);
    this.logger.log(`User ${userId} left matchmaking queue`);
  }

  private findMatch(
    gameId: string,
    variant: string | undefined,
    ranked: boolean | undefined,
    excludeUserId: string,
    ip?: string,
  ): QueueEntry | null {
    const bucket = this.queue.get(this.queueKey(gameId, variant, ranked));
    if (!bucket) return null;
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    for (const entry of bucket.values()) {
      if (entry.userId === excludeUserId) continue;
      if (isProd && ip && entry.ip && ip === entry.ip) continue;
      return entry;
    }
    return null;
  }

  private findEntry(userId: string): QueueEntry | null {
    for (const bucket of this.queue.values()) {
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
    const entry = this.findEntry(userId);
    if (!entry) return;

    this.leaveQueue(userId);

    const queuedOpponent = this.findMatch(
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
      this.leaveQueue(queuedOpponent.userId);
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

  private emitStatus(
    userId: string,
    gameId: string,
    variant?: string,
    ranked?: boolean,
  ): void {
    const key = this.queueKey(gameId, variant, ranked);
    const bucket = this.queue.get(key);
    const queueSize = bucket?.size ?? 0;
    const position = this.positionInBucket(bucket, userId);
    const playersAhead = Math.max(0, position - 1);
    this.realtimeService.emitToUser(userId, 'games.matchmaking.status', {
      gameId,
      variant,
      ranked,
      queueSize,
      position,
      playersAhead,
      estimatedWaitSeconds: this.estimateWaitSeconds(queueSize, position),
      activeQueues: this.getQueueOverview(),
      openRoomsCount: 0,
    } satisfies MatchmakingStatus);
  }

  private emitStatusesFor(
    gameId: string,
    variant?: string,
    ranked?: boolean,
  ): void {
    const key = this.queueKey(gameId, variant, ranked);
    const bucket = this.queue.get(key);
    if (!bucket) return;
    for (const entry of bucket.values()) {
      this.emitStatus(entry.userId, gameId, variant, entry.ranked);
    }
  }

  private positionInBucket(
    bucket: Map<string, QueueEntry> | undefined,
    userId: string,
  ): number {
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
