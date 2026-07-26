import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  forwardRef,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { GameRoomsService } from '../rooms/game-rooms.service';
import {
  GameSessionsService,
  type GameSessionSummary,
} from '../sessions/game-sessions.service';
import { GameHistoryService } from '../history/game-history.service';
import { GamesRealtimeService } from '../games.realtime.service';
import type { StartGameSessionResult } from '../games.types';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
} from '../engines/cat-dash/cat-dash.constants';
import { CatDashBotService } from './cat-dash-bot.service';
import { GameBotWatchdog } from '../game-bot-watchdog';

@Injectable()
export class CatDashService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CatDashService.name);
  private readonly watchdog: GameBotWatchdog;

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => CatDashBotService))
    private readonly botService: CatDashBotService,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {
    this.watchdog = new GameBotWatchdog(
      'cat_dash_v1',
      sessionsService,
      botService,
      mongoConnection,
    );
  }

  onModuleInit() {
    this.watchdog.start();
  }

  onModuleDestroy() {
    this.watchdog.stop();
  }

  async findSessionByRoom(roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) return null;
    return this.afterSessionStep(session);
  }

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

    const options = this.resolveOptions(room.gameOptions);
    const participants = await this.roomsService.getRoomParticipants(roomId);
    const playerIds = [...participants];

    if (withBots || playerIds.length === 1) {
      const needed = Math.max(0, MIN_PLAYERS - playerIds.length);
      const desiredCount =
        botCount !== undefined ? Math.max(botCount, needed) : needed;
      const cap = Math.min(MAX_PLAYERS - playerIds.length, desiredCount);
      for (let i = 0; i < cap; i++) {
        playerIds.push(`bot-${Math.random().toString(36).slice(2, 10)}`);
      }
    }

    if (playerIds.length < MIN_PLAYERS) {
      throw new Error('Not enough players to start Cat Dash (minimum 2)');
    }
    if (playerIds.length > MAX_PLAYERS) {
      throw new Error(
        `Cat Dash supports up to ${MAX_PLAYERS} players — reduce players.`,
      );
    }

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: 'cat_dash_v1',
      playerIds,
      config: { options },
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

  async rollDice(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'rollDice',
      payload: {},
    });

    await this.afterSessionStep(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  async useAbility(userId: string, roomId: string, abilityId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'useAbility',
      payload: { abilityId },
    });

    await this.afterSessionStep(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  async choosePath(userId: string, roomId: string, pathIndex: number) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'choosePath',
      payload: { pathIndex },
    });

    await this.afterSessionStep(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  async forfeit(userId: string, roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'forfeit',
      payload: {},
    });

    await this.afterSessionStep(updatedSession);
    await this.emitSessionUpdate(updatedSession);
    return updatedSession;
  }

  async completeSession(sessionId: string, roomId: string): Promise<void> {
    await this.sessionsService.updateSessionState({
      sessionId,
      state: {},
      status: 'completed',
    });
    await this.roomsService.updateRoomStatus(roomId, 'completed');
  }

  private async afterSessionStep(session: GameSessionSummary) {
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

  private async emitSessionUpdate(session: GameSessionSummary) {
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

  private resolveOptions(raw: unknown): {
    trackType: string;
    theme: string;
  } {
    const r = (raw ?? {}) as Partial<{
      variant: string;
      trackType: string;
      theme: string;
    }>;
    return {
      trackType: r.trackType || 'linear',
      theme: r.theme || 'village',
    };
  }
}
