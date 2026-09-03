import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import { GameRoomsService } from '../rooms/game-rooms.service';
import {
  GameSessionsService,
  type GameSessionSummary,
} from '../sessions/game-sessions.service';
import { GamesRealtimeService } from '../games.realtime.service';
import type { StartGameSessionResult } from '../games.types';
import {
  type BotService,
  GameBotWatchdog,
  type PreCheckFn,
} from '../game-bot-watchdog';
import { extractAiVsAiExtras } from './ai-vs-ai';
import { DistributedRoomLock } from './distributed-room-lock';

/**
 * Shared base class for every game service. Encapsulates the session
 * lifecycle boilerplate (watchdog, session lookup, start, forfeit,
 * completion, bot triggering, sanitized broadcasts and per-room mutex)
 * that used to be duplicated across every game service.
 *
 * Subclasses only implement `resolveOptions` plus their game-specific
 * action methods and may override the optional hooks below.
 */
export abstract class BaseGameService<
  TOptions extends object = Record<string, unknown>,
>
  implements OnModuleInit, OnModuleDestroy
{
  protected abstract readonly logger: Logger;
  private readonly roomLock: DistributedRoomLock;
  private watchdogInstance: GameBotWatchdog | null = null;

  abstract readonly gameId: string;
  abstract readonly gameName: string;
  abstract readonly minPlayers: number;
  abstract readonly maxPlayers: number;

  private readonly mongoConnection: Connection;
  private readonly preCheck: PreCheckFn | undefined;

  constructor(
    protected readonly roomsService: GameRoomsService,
    protected readonly sessionsService: GameSessionsService,
    protected readonly realtimeService: GamesRealtimeService,
    protected readonly botService: BotService,
    mongoConnection: Connection,
    preCheck?: PreCheckFn,
    private readonly redis?: Redis | null,
  ) {
    this.mongoConnection = mongoConnection;
    this.preCheck = preCheck;
    this.roomLock = new DistributedRoomLock(redis);
  }

  onModuleInit() {
    this.watchdog.start();
  }

  onModuleDestroy() {
    this.watchdog.stop();
  }

  protected get watchdog(): GameBotWatchdog {
    if (!this.watchdogInstance) {
      this.watchdogInstance = new GameBotWatchdog(
        this.gameId,
        this.sessionsService,
        this.botService,
        this.mongoConnection,
        this.preCheck,
        this.redis ?? undefined,
        this.realtimeService.getSocketServer() ?? undefined,
      );
    }
    return this.watchdogInstance;
  }

  /**
   * Pure read: returns the active session for a room without side effects.
   *
   * This used to funnel through `afterSessionStep`, which meant EVERY session
   * read (spectator joins via `games.room.watch`, client `games.session.request`
   * refreshes, REST GETs) spawned another bot "sleep then act" chain. In AI-vs-AI
   * rooms those duplicate chains piled up behind per-bot locks / room mutexes and
   * turn pacing drifted as spectator traffic arrived. Bot turns are triggered by
   * exactly three paths now: session start, every completed action
   * (`afterSessionStep`), and the watchdog's stale-session revival.
   */
  async findSessionByRoom(roomId: string): Promise<GameSessionSummary | null> {
    return this.sessionsService.findSessionByRoom(roomId);
  }

  async startSession(
    userId: string,
    roomId: string,
    withBots?: boolean,
    botCount?: number,
    startExtras?: unknown,
  ): Promise<StartGameSessionResult> {
    const room = await this.roomsService.getRoom(roomId, userId);
    if (room.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    const options = this.resolveOptions(room.gameOptions);
    await this.applyStartExtras(userId, roomId, options, startExtras);
    const aiExtras = extractAiVsAiExtras(startExtras);
    if (aiExtras) Object.assign(options, aiExtras);
    const maxPlayersForSession = this.getMaxPlayersForOptions(options);

    const participants = await this.roomsService.getRoomParticipants(roomId);
    const playerIds = [...participants];

    if (withBots || playerIds.length === 1) {
      const needed = Math.max(0, this.minPlayers - playerIds.length);
      const desiredCount =
        botCount !== undefined ? Math.max(botCount, needed) : needed;
      const cap = Math.min(
        maxPlayersForSession - playerIds.length,
        desiredCount,
      );
      for (let i = 0; i < cap; i++) {
        playerIds.push(`bot-${crypto.randomUUID()}`);
      }
    }

    if (playerIds.length < this.minPlayers) {
      throw new Error(
        `Not enough players to start ${this.gameName} (minimum ${this.minPlayers})`,
      );
    }
    if (playerIds.length > maxPlayersForSession) {
      throw new Error(
        `${this.gameName} supports up to ${maxPlayersForSession} players.`,
      );
    }

    const config = this.buildSessionConfig(options, room.gameOptions);

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: this.gameId,
      playerIds,
      config,
      options: aiExtras ?? undefined,
    });

    await this.roomsService.updateRoomStatus(roomId, 'in_progress');
    const updatedRoom = { ...room, status: 'in_progress' as const };
    await this.realtimeService.emitGameStarted(
      updatedRoom,
      session,
      (s, pId) => {
        const sanitized = this.sessionsService.sanitizeSummaryForPlayer(s, pId);
        if (sanitized && typeof sanitized === 'object') {
          return { ...s, state: sanitized as Record<string, unknown> };
        }
        return s;
      },
    );

    const updatedSession = await this.afterSessionStep(session);
    return { room: updatedRoom, session: updatedSession };
  }

  async forfeit(userId: string, roomId: string): Promise<GameSessionSummary> {
    return this.runAction(userId, roomId, 'forfeit', {});
  }

  async completeSession(sessionId: string, roomId: string): Promise<void> {
    await this.sessionsService.updateSessionState({
      sessionId,
      state: {},
      status: 'completed',
    });
    await this.roomsService.updateRoomStatus(roomId, 'completed');
  }

  protected async afterSessionStep(
    session: GameSessionSummary,
  ): Promise<GameSessionSummary> {
    if (session.status === 'completed') {
      await this.roomsService.updateRoomStatus(session.roomId, 'completed');
    } else {
      this.botService.checkAndPlay(session).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Bot turn failed for room ${session.roomId}: ${message}`,
        );
      });
    }
    return session;
  }

  protected async emitSessionUpdate(
    session: GameSessionSummary,
  ): Promise<void> {
    await this.realtimeService.emitSessionSnapshot(
      session.roomId,
      session,
      (s, pId) => {
        const sanitized = this.sessionsService.sanitizeSummaryForPlayer(s, pId);
        if (sanitized && typeof sanitized === 'object') {
          return Promise.resolve({
            ...s,
            state: sanitized as Record<string, unknown>,
          });
        }
        return Promise.resolve(s);
      },
    );
  }

  protected async runAction(
    userId: string,
    roomId: string,
    action: string,
    payload: unknown,
  ): Promise<GameSessionSummary> {
    return this.roomLock.runLocked(roomId, async () => {
      const session = await this.sessionsService.findSessionByRoom(roomId);
      if (!session) throw new Error('Session not found');

      const updatedSession = await this.sessionsService.executeAction({
        sessionId: session.id,
        userId,
        action,
        payload,
      });

      await this.afterSessionStep(updatedSession);
      await this.emitSessionUpdate(updatedSession);
      return updatedSession;
    });
  }

  protected abstract resolveOptions(raw: unknown): TOptions;

  /**
   * Hook for subclasses to fold extra start-session parameters (e.g. Chess
   * botDifficulty, Sea Battle difficulty/gridSize) into the resolved options
   * before the session is created.
   */
  protected applyStartExtras(
    _userId: string,
    _roomId: string,
    _options: TOptions,
    _startExtras: unknown,
  ): Promise<void> | void {}

  protected getMaxPlayersForOptions(_options: TOptions): number {
    return this.maxPlayers;
  }

  protected buildSessionConfig(
    options: TOptions,
    _rawGameOptions: unknown,
  ): Record<string, unknown> {
    return { options };
  }
}
