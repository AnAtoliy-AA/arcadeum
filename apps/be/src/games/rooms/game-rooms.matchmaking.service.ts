import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class GameRoomsMatchmakingService {
  private readonly logger = new Logger(GameRoomsMatchmakingService.name);
  private readonly queue = new Map<string, QueueEntry>();

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly quickplayService: GameRoomsQuickplayService,
    private readonly realtimeService: GamesRealtimeService,
  ) {}

  joinQueue(
    userId: string,
    socketId: string,
    gameId: string,
    variant?: string,
    onSuccess?: (roomId: string) => void,
  ): void {
    this.logger.log(
      `User ${userId} (socket ${socketId}) joining matchmaking queue for game ${gameId}`,
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
    }, 30000);

    this.queue.set(userId, {
      userId,
      socketId,
      gameId,
      variant,
      timestamp: Date.now(),
      timeoutId,
    });
  }

  leaveQueue(userId: string): void {
    const entry = this.queue.get(userId);
    if (entry) {
      clearTimeout(entry.timeoutId);
      this.queue.delete(userId);
      this.logger.log(`User ${userId} left matchmaking queue`);
    }
  }

  private findMatch(
    gameId: string,
    variant: string | undefined,
    excludeUserId: string,
  ): QueueEntry | null {
    for (const entry of this.queue.values()) {
      if (
        entry.gameId === gameId &&
        entry.variant === variant &&
        entry.userId !== excludeUserId
      ) {
        return entry;
      }
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
    const entry = this.queue.get(userId);
    if (!entry) return;

    this.queue.delete(userId);
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
}
