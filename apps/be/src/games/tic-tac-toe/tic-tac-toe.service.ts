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
  MAX_PLAYERS_BY_BOARD_SIZE,
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
import { GameBotWatchdog } from '../game-bot-watchdog';

@Injectable()
export class TicTacToeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TicTacToeService.name);
  private readonly watchdog: GameBotWatchdog;

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => TicTacToeBotService))
    private readonly botService: TicTacToeBotService,
  ) {
    this.watchdog = new GameBotWatchdog(
      'tic_tac_toe_v1',
      sessionsService,
      botService,
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
    const sizeCap = MAX_PLAYERS_BY_BOARD_SIZE[options.boardSize];

    const participants = await this.roomsService.getRoomParticipants(roomId);
    const playerIds = [...participants];

    if (withBots || playerIds.length === 1) {
      const needed = Math.max(0, MIN_PLAYERS - playerIds.length);
      const desiredCount =
        botCount !== undefined ? Math.max(botCount, needed) : needed;
      const cap = Math.min(sizeCap - playerIds.length, desiredCount);
      for (let i = 0; i < cap; i++) {
        playerIds.push(`bot-${Math.random().toString(36).slice(2, 10)}`);
      }
    }

    if (playerIds.length < MIN_PLAYERS) {
      throw new Error('Not enough players to start Tic-Tac-Toe (minimum 2)');
    }
    if (playerIds.length > sizeCap) {
      throw new Error(
        `${options.boardSize}×${options.boardSize} supports up to ${sizeCap} players — reduce players or pick a larger board.`,
      );
    }

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: 'tic_tac_toe_v1',
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

  private resolveOptions(raw: unknown): TicTacToeOptions {
    const r = (raw ?? {}) as Partial<{
      variant: string;
      boardSize: number | string;
      teamMode: boolean;
      expansionMargin: number;
      infinityWinLength: number;
    }>;
    const allowedSizes: number[] = [3, 5, 7, 9];
    const rawSize = r.boardSize;
    let boardSize: BoardSize;
    if (rawSize === 'infinity') {
      boardSize = 'infinity';
    } else {
      const numSize: number =
        Number(rawSize) || (DEFAULT_OPTIONS.boardSize as number);
      boardSize = (
        allowedSizes.includes(numSize) ? numSize : DEFAULT_OPTIONS.boardSize
      ) as BoardSize;
    }
    const isMargin = (n: number | undefined): n is 1 | 2 | 3 =>
      n === 1 || n === 2 || n === 3;
    const isWinLen = (n: number | undefined): n is 4 | 5 => n === 4 || n === 5;
    return {
      variant: (r.variant as Variant) ?? DEFAULT_OPTIONS.variant,
      boardSize,
      teamMode: !!r.teamMode,
      expansionMargin: isMargin(r.expansionMargin)
        ? r.expansionMargin
        : DEFAULT_OPTIONS.expansionMargin,
      infinityWinLength: isWinLen(r.infinityWinLength)
        ? r.infinityWinLength
        : DEFAULT_OPTIONS.infinityWinLength,
    };
  }
}

void ({} as TicTacToeState);
