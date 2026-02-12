import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { GameRoomsService } from '../rooms/game-rooms.service';
import {
  GameSessionsService,
  GameSessionSummary,
} from '../sessions/game-sessions.service';
import { GameHistoryService } from '../history/game-history.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { StartGameSessionResult } from '../games.types';
import { ChatScope } from '../engines/base/game-engine.interface';
import { SeaBattleBotService } from './sea-battle-bot.service';
import { MAX_PLAYERS } from '../engines/sea-battle/sea-battle.constants';

interface PlaceShipPayload {
  shipId: string;
  cells: { row: number; col: number }[];
}

interface AttackPayload {
  targetPlayerId: string;
  row: number;
  col: number;
}

@Injectable()
export class SeaBattleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SeaBattleService.name);
  private watchdogInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => SeaBattleBotService))
    private readonly botService: SeaBattleBotService,
  ) {}

  onModuleInit() {
    this.startWatchdog();
  }

  onModuleDestroy() {
    this.stopWatchdog();
  }

  private stopWatchdog() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
  }

  private startWatchdog() {
    // Every 10 seconds, check active Sea Battle sessions that haven't moved for 20 seconds
    this.watchdogInterval = setInterval(() => {
      void (async () => {
        try {
          const staleSessions =
            await this.sessionsService.findStaleActiveSessions(
              'sea_battle_v1',
              20000, // 20 seconds stale threshold
              100, // Limit to 100 per cycle for safety
            );

          if (staleSessions.length > 0) {
            for (const session of staleSessions) {
              this.botService
                .checkAndPlay(session)
                .catch((err) =>
                  this.logger.error(
                    `Watchdog trigger failed for room ${session.roomId}: ${err}`,
                  ),
                );
            }
          }
        } catch (error) {
          this.logger.error(`Watchdog failed: ${error}`);
        }
      })();
    }, 10000);
  }

  /**
   * Find a session by room ID
   */
  async findSessionByRoom(roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (session) {
      return this.checkAndSyncRoomStatus(session);
    }
    return null;
  }

  private async checkAndSyncRoomStatus(session: GameSessionSummary) {
    if (session.status === 'completed') {
      await this.roomsService.updateRoomStatus(session.roomId, 'completed');
    } else {
      // Trigger bot logic asynchronously
      this.botService.checkAndPlay(session).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        const stack = err instanceof Error ? err.stack : undefined;
        this.logger.error(
          `Error in bot turn for room ${session.roomId}: ${message}`,
          stack,
        );
      });
    }
    return session;
  }

  private async emitSessionUpdate(session: GameSessionSummary) {
    await this.realtimeService.emitSessionSnapshot(
      session.roomId,
      session,
      async (s, pId) => {
        const sanitized = await this.sessionsService.getSanitizedStateForPlayer(
          s.id,
          pId,
        );
        if (sanitized && typeof sanitized === 'object') {
          return { ...s, state: sanitized as Record<string, unknown> };
        }
        return s;
      },
    );
  }

  /**
   * Start a Sea Battle session
   * (Verified fix for single player bot mode)
   */
  async startSession(
    userId: string,
    roomId: string,
    withBots?: boolean,
    botCount?: number,
  ): Promise<StartGameSessionResult> {
    const room = await this.roomsService.getRoom(roomId, userId);

    if (room.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    const participants = await this.roomsService.getRoomParticipants(roomId);
    const playerIds = [...participants];

    // If only one player, automatically add a bot to meet minimum requirements (2 players)
    // This handles both explicit bot mode and fallback for single users
    if (playerIds.length === 1) {
      const targetBotCount = botCount !== undefined ? botCount : 1;
      const needed = Math.min(MAX_PLAYERS - 1, targetBotCount);
      for (let i = 0; i < needed; i++) {
        playerIds.push(`bot-${Math.random().toString(36).substr(2, 9)}`);
      }
    } else if (withBots) {
      const targetTotalPlayers = playerIds.length + (botCount || 1);
      const needed = Math.min(
        MAX_PLAYERS - playerIds.length,
        Math.max(0, targetTotalPlayers - playerIds.length),
      );
      for (let i = 0; i < needed; i++) {
        playerIds.push(`bot-${Math.random().toString(36).substr(2, 9)}`);
      }
    }

    if (playerIds.length < 2) {
      throw new Error('Not enough players to start Sea Battle (minimum 2)');
    }

    if (playerIds.length > MAX_PLAYERS) {
      throw new Error(
        `Too many players to start Sea Battle (maximum ${MAX_PLAYERS})`,
      );
    }

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: room.gameId,
      playerIds,
      config: { ...room.gameOptions },
    });

    await this.roomsService.updateRoomStatus(roomId, 'in_progress');
    await this.realtimeService.emitGameStarted(
      room,
      session,
      async (s, pId) => {
        const sanitized = await this.sessionsService.getSanitizedStateForPlayer(
          s.id,
          pId,
        );
        if (sanitized && typeof sanitized === 'object') {
          return { ...s, state: sanitized as Record<string, unknown> };
        }
        return s;
      },
    );

    const updatedSession = await this.checkAndSyncRoomStatus(session);
    return { room, session: updatedSession };
  }

  /**
   * Place a ship on the board
   */
  async placeShipByRoom(
    userId: string,
    roomId: string,
    payload: PlaceShipPayload,
  ) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'placeShip',
      payload,
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Confirm ship placement is complete
   */
  async confirmPlacementByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'confirmPlacement',
      payload: {},
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Attack an opponent's cell
   */
  async attackByRoom(userId: string, roomId: string, payload: AttackPayload) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'attack',
      payload,
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Reset ship placement
   */
  async resetPlacementByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'resetPlacement',
      payload: {},
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Auto place ships for a player
   */
  async autoPlaceShipsByRoom(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'autoPlace',
      payload: {},
    });

    await this.checkAndSyncRoomStatus(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  /**
   * Post a note to Sea Battle history
   */
  async postHistoryNote(
    userId: string,
    roomId: string,
    message: string,
    scope: ChatScope,
  ) {
    // Primary mechanism is via engine action to ensure state update and realtime event
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (session) {
      const updatedSession = await this.sessionsService.executeAction({
        sessionId: session.id,
        userId,
        action: 'chat',
        payload: {
          message,
          scope,
        },
      });
      await this.emitSessionUpdate(updatedSession);
    }
  }
}
