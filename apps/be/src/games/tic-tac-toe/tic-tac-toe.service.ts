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
  type GameSessionSummary,
} from '../sessions/game-sessions.service';
import { GameHistoryService } from '../history/game-history.service';
import { GamesRealtimeService } from '../games.realtime.service';
import type { StartGameSessionResult } from '../games.types';
import {
  DEFAULT_OPTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  type BoardSize,
  type Variant,
} from '../engines/tic-tac-toe/tic-tac-toe.constants';
import type {
  PlaceMarkPayload,
  TicTacToeOptions,
  TicTacToeState,
} from '../engines/tic-tac-toe/tic-tac-toe.types';
import { TicTacToeBotService } from './tic-tac-toe-bot.service';

const WATCHDOG_INTERVAL_MS = 10000;
const WATCHDOG_STALE_THRESHOLD_MS = 20000;

@Injectable()
export class TicTacToeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TicTacToeService.name);
  private watchdogInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => TicTacToeBotService))
    private readonly botService: TicTacToeBotService,
  ) {}

  onModuleInit() {
    this.watchdogInterval = setInterval(() => {
      void this.runWatchdog();
    }, WATCHDOG_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.watchdogInterval) {
      clearInterval(this.watchdogInterval);
      this.watchdogInterval = null;
    }
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
      const desiredCount =
        botCount !== undefined ? botCount : Math.max(0, 2 - playerIds.length);
      const cap = Math.min(MAX_PLAYERS - playerIds.length, desiredCount);
      for (let i = 0; i < cap; i++) {
        playerIds.push(`bot-${Math.random().toString(36).slice(2, 10)}`);
      }
    }

    if (playerIds.length < MIN_PLAYERS) {
      throw new Error('Not enough players to start Tic-Tac-Toe (minimum 2)');
    }
    if (playerIds.length > MAX_PLAYERS) {
      throw new Error(
        `Too many players to start Tic-Tac-Toe (maximum ${MAX_PLAYERS})`,
      );
    }

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: 'tic_tac_toe_v1',
      playerIds,
      config: { options },
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

    const updatedSession = await this.afterSessionStep(session);
    return { room, session: updatedSession };
  }

  async placeMark(userId: string, roomId: string, payload: PlaceMarkPayload) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) throw new Error('Session not found');

    const updatedSession = await this.sessionsService.executeAction({
      sessionId: session.id,
      userId,
      action: 'place_mark',
      payload,
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

  private async afterSessionStep(session: GameSessionSummary) {
    if (session.status === 'completed') {
      await this.roomsService.updateRoomStatus(session.roomId, 'completed');
    } else {
      // Fire-and-forget — bot decides if any action is needed.
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

  private async runWatchdog() {
    try {
      const stale = await this.sessionsService.findStaleActiveSessions(
        'tic_tac_toe_v1',
        WATCHDOG_STALE_THRESHOLD_MS,
        100,
      );
      for (const session of stale) {
        this.botService
          .checkAndPlay(session)
          .catch((err) =>
            this.logger.error(
              `Watchdog trigger failed for room ${session.roomId}: ${err}`,
            ),
          );
      }
    } catch (err) {
      this.logger.error(`Watchdog failed: ${err}`);
    }
  }

  private resolveOptions(raw: unknown): TicTacToeOptions {
    const r = (raw ?? {}) as Partial<{
      variant: string;
      boardSize: number;
      teamMode: boolean;
    }>;
    const allowedSizes: number[] = [3, 5, 7, 9];
    const boardSize = (
      allowedSizes.includes(r.boardSize ?? 3)
        ? r.boardSize
        : DEFAULT_OPTIONS.boardSize
    ) as BoardSize;
    return {
      variant: (r.variant as Variant) ?? DEFAULT_OPTIONS.variant,
      boardSize,
      teamMode: !!r.teamMode,
    };
  }
}

void ({} as TicTacToeState);
