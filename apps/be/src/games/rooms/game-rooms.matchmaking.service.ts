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
  timestamp: number;
  timeoutId: NodeJS.Timeout;
}

export interface MatchmakingStatus {
  gameId: string;
  variant?: string;
  queueSize: number;
  position: number;
  estimatedWaitSeconds: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;
// When more than one player is waiting, a match is likely within this window.
const ESTIMATED_WAIT_WITH_PLAYERS_MS = 12_000;

/**
 * Real-time matchmaking queue.
 *
 * Players queue per game (and optional variant). When a second player for the
 * same game joins, they are paired immediately into an "Open Match" room. If
 * nobody else is queued, the player waits up to a configurable timeout
 * (`MATCHMAKING_TIMEOUT_MS`, default 30s); on timeout we first try to pair
 * with anyone still queued, and only fall back to a bot room as a last resort.
 *
 * Each queued player receives `games.matchmaking.status` updates carrying the
 * current queue size, their position, and an estimated wait so the client can
 * render a "Searching for opponent..." experience with a live wait estimate.
 */
@Injectable()
export class GameRoomsMatchmakingService {
  private readonly logger = new Logger(GameRoomsMatchmakingService.name);
  // Queue bucketed per game+variant: key = `${gameId}::${variant ?? ''}`
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

  private queueKey(gameId: string, variant?: string): string {
    return variant ? `${gameId}::${variant}` : gameId;
  }

  joinQueue(
    userId: string,
    socketId: string,
    gameId: string,
    variant?: string,
    onSuccess?: (roomId: string) => void,
  ): void {
    this.logger.log(
      `User ${userId} (socket ${socketId}) joining matchmaking queue for game ${gameId}${variant ? ` (${variant})` : ''}`,
    );

    this.leaveQueue(userId);

    const match = this.findMatch(gameId, variant, userId);
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
        onSuccess,
      );
      return;
    }

    const timeoutId = setTimeout(() => {
      void this.handleMatchmakingTimeout(userId, gameId, variant, onSuccess);
    }, this.timeoutMs);

    const key = this.queueKey(gameId, variant);
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
      timestamp: Date.now(),
      timeoutId,
    });

    this.emitStatus(userId, gameId, variant);
  }

  leaveQueue(userId: string): void {
    const entry = this.findEntry(userId);
    if (!entry) {
      return;
    }
    clearTimeout(entry.timeoutId);
    const key = this.queueKey(entry.gameId, entry.variant);
    const bucket = this.queue.get(key);
    if (bucket) {
      bucket.delete(userId);
      if (bucket.size === 0) {
        this.queue.delete(key);
      }
    }
    this.emitStatusesFor(entry.gameId, entry.variant);
    this.logger.log(`User ${userId} left matchmaking queue`);
  }

  private findMatch(
    gameId: string,
    variant: string | undefined,
    excludeUserId: string,
  ): QueueEntry | null {
    const bucket = this.queue.get(this.queueKey(gameId, variant));
    if (!bucket) return null;
    for (const entry of bucket.values()) {
      if (entry.userId !== excludeUserId) {
        return entry;
      }
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
    onSuccess?: (roomId: string) => void,
  ): Promise<void> {
    try {
      const room = await this.roomsService.createRoom(user1, {
        gameId,
        name: 'Open Match',
        visibility: 'public',
        maxPlayers: 2,
        gameOptions: variant ? { variant } : undefined,
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
    onSuccess?: (roomId: string) => void,
  ): Promise<void> {
    const entry = this.findEntry(userId);
    if (!entry) return;

    this.leaveQueue(userId);

    // Prefer pairing with anyone still queued for the same game over
    // dropping the player into a bot match.
    const queuedOpponent = this.findMatch(gameId, variant, userId);
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

  private emitStatus(userId: string, gameId: string, variant?: string): void {
    const key = this.queueKey(gameId, variant);
    const bucket = this.queue.get(key);
    const queueSize = bucket?.size ?? 0;
    const position = this.positionInBucket(bucket, userId);
    this.realtimeService.emitToUser(userId, 'games.matchmaking.status', {
      gameId,
      variant,
      queueSize,
      position,
      estimatedWaitSeconds: this.estimateWaitSeconds(queueSize, position),
    } satisfies MatchmakingStatus);
  }

  private emitStatusesFor(gameId: string, variant?: string): void {
    const key = this.queueKey(gameId, variant);
    const bucket = this.queue.get(key);
    if (!bucket) return;
    for (const entry of bucket.values()) {
      this.emitStatus(entry.userId, gameId, variant);
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
      // A fresh opponent join will pair us almost immediately.
      return Math.max(2, Math.round(ESTIMATED_WAIT_WITH_PLAYERS_MS / 1000));
    }
    const ahead = Math.max(0, position - 1);
    return Math.max(2, Math.round(remainingMs / 1000) + ahead * 5);
  }
}
