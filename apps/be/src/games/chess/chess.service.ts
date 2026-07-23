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
  CHESS_VARIANTS,
  type ChessVariant,
} from '../engines/chess/chess.constants';
import type {
  ChessOptions,
  TimeControlType,
  TimeIncrement,
  ChessState,
} from '../engines/chess/chess.types';
import { ChessBotService } from '../engines/chess/chess-bot.service';
import { getLegalMoves } from '../engines/chess/chess.move-generator';
import { GameBotWatchdog } from '../game-bot-watchdog';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 2;

@Injectable()
export class ChessService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChessService.name);
  private readonly watchdog: GameBotWatchdog;
  private readonly roomLocks = new Map<string, Promise<void>>();

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly sessionsService: GameSessionsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => ChessBotService))
    private readonly botService: ChessBotService,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {
    this.watchdog = new GameBotWatchdog(
      'chess_v1',
      sessionsService,
      botService,
      mongoConnection,
      (session) => this.checkClockTimeout(session),
    );
  }

  onModuleInit() {
    this.botService.setMoveFn(
      this.move.bind(this) as (
        userId: string,
        roomId: string,
        payload: {
          fromFile: string;
          fromRank: number;
          toFile: string;
          toRank: number;
          promotion?: string;
        },
      ) => Promise<unknown>,
    );
    this.watchdog.start();
  }

  onModuleDestroy() {
    this.watchdog.stop();
  }

  async findSessionByRoom(roomId: string) {
    const session = await this.sessionsService.findSessionByRoom(roomId);
    if (!session) return null;
    this.backfillLegalMoves(session);
    return this.afterSessionStep(session);
  }

  async startSession(
    userId: string,
    roomId: string,
    withBots?: boolean,
    botCount?: number,
    botDifficulty?: string,
  ): Promise<StartGameSessionResult> {
    const room = await this.roomsService.getRoom(roomId, userId);
    if (room.hostId !== userId) {
      throw new Error('Only the host can start the game');
    }

    if (botDifficulty && ['easy', 'medium', 'hard'].includes(botDifficulty)) {
      this.botService.setDifficulty(
        botDifficulty as 'easy' | 'medium' | 'hard',
      );
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
      throw new Error('Not enough players to start Chess (minimum 2)');
    }
    if (playerIds.length > MAX_PLAYERS) {
      throw new Error(`Chess supports up to ${MAX_PLAYERS} players.`);
    }

    const session = await this.sessionsService.createSession({
      roomId,
      gameId: 'chess_v1',
      playerIds,
      config: { options },
    });

    await this.roomsService.updateRoomStatus(roomId, 'in_progress');
    const updatedRoom = { ...room, status: 'in_progress' as const };
    await this.realtimeService.emitGameStarted(
      updatedRoom,
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
    return { room: updatedRoom, session: updatedSession };
  }

  async move(
    userId: string,
    roomId: string,
    payload: {
      fromFile: string;
      fromRank: number;
      toFile: string;
      toRank: number;
      promotion?: string;
    },
  ) {
    return this.runAction(userId, roomId, 'move', payload);
  }

  async forfeit(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'forfeit', {});
  }

  async drawOffer(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'draw_offer', {});
  }

  async drawAccept(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'draw_accept', {});
  }

  private async runAction(
    userId: string,
    roomId: string,
    action: string,
    payload: unknown,
  ) {
    const prev = this.roomLocks.get(roomId) ?? Promise.resolve();
    let release: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.roomLocks.set(roomId, next);
    await prev;

    try {
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
    } finally {
      release!();
      if (this.roomLocks.get(roomId) === next) {
        this.roomLocks.delete(roomId);
      }
    }
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
    this.backfillLegalMoves(session);
    const moveCount = session.state?.moveHistory
      ? (session.state.moveHistory as unknown[]).length
      : 0;
    this.logger.log(
      `[Chess] emitSessionUpdate room=${session.roomId} moveCount=${moveCount}`,
    );
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

  private async checkClockTimeout(session: GameSessionSummary) {
    const state = session.state as ChessState | undefined;
    if (!state || !state.clocks || this.isGameOver(state)) return;

    const currentClock = state.clocks[state.currentTurnColor];
    if (!currentClock) return;

    const elapsed = Math.floor(
      (Date.now() - currentClock.lastMoveTimestamp) / 1000,
    );
    const remaining = currentClock.remainingSeconds - elapsed;

    if (remaining <= 0) {
      const loser = state.players.find(
        (p) => p.color === state.currentTurnColor,
      );
      const winner = state.players.find(
        (p) => p.color !== state.currentTurnColor,
      );
      if (loser && winner) {
        await this.runAction(loser.playerId, session.roomId, 'forfeit', {});
      }
    }
  }

  private isGameOver(state: ChessState): boolean {
    return (
      state.isCheckmate ||
      state.isStalemate ||
      state.winnerColor !== null ||
      state.isDrawByRepetition ||
      state.isDrawByFiftyMoveRule ||
      state.isInsufficientMaterial ||
      state.isDrawByAgreement
    );
  }

  private resolveOptions(raw: unknown): ChessOptions {
    const r = (raw ?? {}) as Partial<{
      variant: string;
      timeControl: {
        type: string;
        initialSeconds: number;
        incrementSeconds: number;
      } | null;
    }>;
    const variant = CHESS_VARIANTS.includes(r.variant as ChessVariant)
      ? (r.variant as ChessVariant)
      : ('standard' as ChessVariant);
    const rawTc = r.timeControl;
    let timeControl: ChessOptions['timeControl'] = null;
    if (rawTc && typeof rawTc === 'object') {
      const validTypes: TimeControlType[] = ['blitz', 'rapid', 'classical'];
      const type = validTypes.includes(rawTc.type as TimeControlType)
        ? (rawTc.type as TimeControlType)
        : 'blitz';
      const validIncs: TimeIncrement[] = [0, 3, 5, 10, 15, 30];
      const inc = validIncs.includes(rawTc.incrementSeconds as TimeIncrement)
        ? (rawTc.incrementSeconds as TimeIncrement)
        : 0;
      timeControl = {
        type,
        initialSeconds: rawTc.initialSeconds,
        incrementSeconds: inc,
      };
    }
    return { variant, timeControl };
  }

  private backfillLegalMoves(session: GameSessionSummary) {
    const state = session.state as ChessState | undefined;
    if (!state || state.legalMovesForCurrentPlayer) return;
    state.legalMovesForCurrentPlayer = getLegalMoves(
      state,
      state.currentTurnColor,
    ).map((m) => ({ from: m.from, to: m.to, promotion: m.promotion }));
  }
}
