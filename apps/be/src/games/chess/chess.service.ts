import {
  Inject,
  Injectable,
  Logger,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type Redis from 'ioredis';
import { GameRoomsService } from '../rooms/game-rooms.service';
import {
  GameSessionsService,
  type GameSessionSummary,
} from '../sessions/game-sessions.service';
import { GamesRealtimeService } from '../games.realtime.service';
import {
  CHESS_VARIANTS,
  type ChessVariant,
} from '../engines/chess/chess.constants';
import type {
  ChessOptions,
  TimeControlType,
  TimeIncrement,
  ChessState,
  MovePayload,
} from '../engines/chess/chess.types';
import { broadcastLiveAnalysis } from './chess-live-analysis';
import { ChessBotService } from '../engines/chess/chess-bot.service';
import { ChessStockfishService } from './engine/chess-stockfish.service';
import { ChessTournamentService } from './tournaments/chess-tournament.service';
import { getLegalMoves } from '../engines/chess/chess.move-generator';
import {
  AI_DIFFICULTIES,
  isAiDifficulty,
  type AiDifficulty,
} from '../ai-difficulty';
import { BaseGameService } from '../common/base-game.service';
import { getBotPersonality, type BotPersonality } from '../engines/chess';
import {
  isChessDraw,
  isChessGameOver,
} from '@arcadeum/games-core/games/chess/chess-engine-rules';

@Injectable()
export class ChessService extends BaseGameService<ChessOptions> {
  protected readonly logger = new Logger(ChessService.name);
  readonly gameId = 'chess_v1';
  readonly gameName = 'Chess';
  readonly minPlayers = 2;
  readonly maxPlayers = 2;

  protected readonly botService: ChessBotService;

  /** Stockfish 19 engine — always available after module init. */
  readonly stockfishService: ChessStockfishService;

  /** Chess tournament service — injected optionally. */
  private readonly tournamentService: ChessTournamentService | null;

  constructor(
    roomsService: GameRoomsService,
    sessionsService: GameSessionsService,
    realtimeService: GamesRealtimeService,
    @Inject(forwardRef(() => ChessBotService))
    botService: ChessBotService,
    stockfishService: ChessStockfishService,
    @Optional() tournamentService: ChessTournamentService | null,
    @InjectConnection() mongoConnection: Connection,
    @Optional() @Inject('REDIS_CLIENT') redis?: Redis | null,
  ) {
    super(
      roomsService,
      sessionsService,
      realtimeService,
      botService,
      mongoConnection,
      (session) => this.checkClockTimeout(session),
      redis,
    );
    this.botService = botService;
    this.stockfishService = stockfishService;
    this.tournamentService = tournamentService;
  }

  override onModuleInit() {
    super.onModuleInit();
    this.botService.setMoveFn(
      this.move.bind(this) as (
        userId: string,
        roomId: string,
        payload: MovePayload,
      ) => Promise<unknown>,
    );
  }

  override async startSession(
    userId: string,
    roomId: string,
    withBots?: boolean,
    botCount?: number,
    botDifficultyOrExtras?: string | Record<string, unknown>,
  ) {
    const extras =
      typeof botDifficultyOrExtras === 'string'
        ? { botDifficulty: botDifficultyOrExtras }
        : botDifficultyOrExtras;
    return super.startSession(userId, roomId, withBots, botCount, extras);
  }

  override async findSessionByRoom(roomId: string) {
    const result = await super.findSessionByRoom(roomId);
    if (result) this.backfillLegalMoves(result);
    return result;
  }

  async move(userId: string, roomId: string, payload: MovePayload) {
    return this.runAction(userId, roomId, 'move', payload);
  }
  async drawOffer(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'draw_offer', {});
  }
  async drawAccept(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'draw_accept', {});
  }
  async drawDecline(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'draw_decline', {});
  }
  /** Abort before both sides have moved: no result, no rating change. */
  async abort(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'abort', {});
  }
  async takebackOffer(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'takeback_offer', {});
  }
  async takebackAccept(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'takeback_accept', {});
  }
  async takebackDecline(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'takeback_decline', {});
  }

  protected override applyStartExtras(
    _userId: string,
    _roomId: string,
    options: ChessOptions,
    startExtras: unknown,
  ): void {
    const { botDifficulty, botPersonality } = (startExtras ?? {}) as {
      botDifficulty?: string;
      botPersonality?: string;
    };
    if (
      botDifficulty &&
      AI_DIFFICULTIES.includes(botDifficulty as AiDifficulty)
    ) {
      this.botService.setDifficulty(botDifficulty as AiDifficulty);
      options.botDifficulty = botDifficulty as AiDifficulty;
    }
    if (botPersonality && typeof botPersonality === 'string') {
      options.botPersonality = botPersonality;
    }
  }

  protected override async afterSessionStep(
    session: GameSessionSummary,
  ): Promise<GameSessionSummary> {
    const result = await super.afterSessionStep(session);

    if (session.status === 'completed' && this.tournamentService) {
      await this.reportTournamentResult(session).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Tournament result reporting failed for room ${session.roomId}: ${message}`,
        );
      });
    }

    // Emit bot chat messages on game completion
    if (session.status === 'completed') {
      await this.emitBotChatOnGameOver(session).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Bot chat emit failed for room ${session.roomId}: ${message}`,
        );
      });
    }

    return result;
  }

  private async emitBotChatOnGameOver(
    session: GameSessionSummary,
  ): Promise<void> {
    const state = session.state as ChessState | undefined;
    if (!state?.players) return;

    const room = await this.roomsService.getRoom(session.roomId, 'system');
    const gameOpts = (room as unknown as Record<string, unknown>)
      .gameOptions as Record<string, unknown> | undefined;

    for (const player of state.players) {
      if (!player.isBot) continue;

      const perColorKey =
        player.color === 'white'
          ? 'botPersonalityWhite'
          : 'botPersonalityBlack';
      const personalityId =
        (gameOpts?.[perColorKey] as string) ??
        (gameOpts?.botPersonality as string) ??
        state.botPersonality;

      if (!personalityId) continue;
      const personality: BotPersonality | undefined =
        getBotPersonality(personalityId);
      if (!personality) continue;

      if (state.isAborted) continue;
      const botWon = state.winnerColor === player.color;
      const isDraw = isChessDraw(state);

      let message: string | null = null;
      if (botWon && personality.chatMessages.onWin.length > 0) {
        message =
          personality.chatMessages.onWin[
            Math.floor(Math.random() * personality.chatMessages.onWin.length)
          ];
      } else if (
        !botWon &&
        !isDraw &&
        personality.chatMessages.onLoss.length > 0
      ) {
        message =
          personality.chatMessages.onLoss[
            Math.floor(Math.random() * personality.chatMessages.onLoss.length)
          ];
      }

      if (message) {
        this.realtimeService.emitToRoom(session.roomId, 'game.chat', {
          senderId: player.playerId,
          senderName: personality.name,
          message,
          scope: 'all',
        });
      }
    }
  }

  protected override async emitSessionUpdate(
    session: GameSessionSummary,
  ): Promise<void> {
    this.backfillLegalMoves(session);
    const moveCount = session.state?.moveHistory
      ? (session.state.moveHistory as unknown[]).length
      : 0;
    this.logger.log(
      `[Chess] emitSessionUpdate room=${session.roomId} moveCount=${moveCount}`,
    );
    await super.emitSessionUpdate(session);

    // Broadcast Stockfish analysis after each move (fire-and-forget)
    const state = session.state as ChessState | undefined;
    if (moveCount > 0 && state) {
      broadcastLiveAnalysis(
        session.roomId,
        state,
        this.stockfishService,
        this.realtimeService,
        this.logger,
      );
    }
  }

  private isTimeExpired(
    elapsedMs: number,
    remaining: number,
    isDaily: boolean,
    daysPerMove: number,
  ): boolean {
    return isDaily
      ? elapsedMs / 86_400_000 >= daysPerMove
      : Math.floor(elapsedMs / 1000) >= remaining;
  }

  private async checkClockTimeout(session: GameSessionSummary) {
    const state = session.state as ChessState | undefined;
    if (!state || !state.clocks || this.isGameOver(state)) return;

    const isDaily = state.timeControl?.type === 'daily';
    const daysPerMove = state.timeControl?.daysPerMove ?? 1;
    const currentClock = state.clocks[state.currentTurnColor];
    if (!currentClock) return;

    const isFirstMove =
      state.clocks.white.lastMoveTimestamp === 0 &&
      state.clocks.black.lastMoveTimestamp === 0;

    if (isFirstMove) {
      const gca =
        state.gameCreatedAt > 0
          ? state.gameCreatedAt
          : new Date(session.createdAt).getTime();
      const elapsed = Date.now() - gca - 20_000;
      if (
        elapsed < 0 ||
        !this.isTimeExpired(
          elapsed,
          currentClock.remainingSeconds,
          isDaily,
          daysPerMove,
        )
      )
        return;
      // Nobody moved: abort instead of awarding a win (no rating change).
      const p = state.players.find((p) => p.color === state.currentTurnColor);
      if (p) await this.runAction(p.playerId, session.roomId, 'abort', {});
      return;
    }

    const opponentClock =
      state.clocks[state.currentTurnColor === 'white' ? 'black' : 'white'];
    const turnStartedAt =
      opponentClock?.lastMoveTimestamp > 0
        ? opponentClock.lastMoveTimestamp
        : state.gameCreatedAt > 0
          ? state.gameCreatedAt
          : new Date(session.createdAt).getTime();
    if (
      !this.isTimeExpired(
        Date.now() - turnStartedAt,
        currentClock.remainingSeconds,
        isDaily,
        daysPerMove,
      )
    )
      return;

    const loser = state.players.find((p) => p.color === state.currentTurnColor);
    if (!loser) return;
    // A side that never made its first move aborts the game; otherwise the
    // flag fall is judged by the engine (loss, or draw vs. no mating material).
    const neverMoved = !state.moveHistory.some(
      (m) => m.piece.color === loser.color,
    );
    await this.runAction(
      loser.playerId,
      session.roomId,
      neverMoved ? 'abort' : 'timeout',
      {},
    );
  }

  private isGameOver(state: ChessState): boolean {
    return isChessGameOver(state);
  }

  protected resolveOptions(raw: unknown): ChessOptions {
    const r = (raw ?? {}) as Partial<{
      variant: string;
      timeControl: {
        type: string;
        initialSeconds: number;
        incrementSeconds: number;
      } | null;
      botDifficulty: string;
      botPersonality: string;
      aiDifficulty: string;
    }>;
    const variant = CHESS_VARIANTS.includes(r.variant as ChessVariant)
      ? (r.variant as ChessVariant)
      : ('standard' as ChessVariant);
    const rawTc = r.timeControl;
    let timeControl: ChessOptions['timeControl'] = null;
    if (rawTc && typeof rawTc === 'object') {
      const type: TimeControlType = [
        'bullet',
        'blitz',
        'rapid',
        'classical',
        'daily',
      ].includes(rawTc.type)
        ? (rawTc.type as TimeControlType)
        : 'blitz';
      const inc: TimeIncrement = [0, 1, 3, 5, 10, 15, 30].includes(
        rawTc.incrementSeconds,
      )
        ? (rawTc.incrementSeconds as TimeIncrement)
        : 0;
      const daysPerMove =
        type === 'daily'
          ? Math.max(
              1,
              Math.min(
                14,
                ((rawTc as Record<string, unknown>).daysPerMove as number) || 1,
              ),
            )
          : undefined;
      timeControl = {
        type,
        initialSeconds: rawTc.initialSeconds,
        incrementSeconds: inc,
        daysPerMove,
      };
    }
    const botDifficulty = isAiDifficulty(r.botDifficulty)
      ? r.botDifficulty
      : isAiDifficulty(r.aiDifficulty)
        ? r.aiDifficulty
        : undefined;
    const botPersonality =
      typeof r.botPersonality === 'string' ? r.botPersonality : undefined;
    return { variant, timeControl, botDifficulty, botPersonality };
  }

  private backfillLegalMoves(session: GameSessionSummary) {
    const state = session.state as ChessState | undefined;
    if (!state || state.legalMovesForCurrentPlayer) return;
    state.legalMovesForCurrentPlayer = getLegalMoves(
      state,
      state.currentTurnColor,
    ).map((m) => ({ from: m.from, to: m.to, promotion: m.promotion }));
  }

  private async reportTournamentResult(
    session: GameSessionSummary,
  ): Promise<void> {
    const state = session.state as ChessState | undefined;
    if (!state?.players || state.players.length < 2) return;

    const room = await this.roomsService.getRoom(session.roomId, 'system');
    const tournamentId = (room as unknown as Record<string, unknown>)
      .tournamentId;
    if (!tournamentId || typeof tournamentId !== 'string') return;

    const white = state.players.find((p) => p.color === 'white');
    const black = state.players.find((p) => p.color === 'black');
    if (!white || !black) return;

    if (state.isAborted) return;
    const isDraw = isChessDraw(state);
    const result = isDraw
      ? 'draw'
      : state.winnerColor === 'white'
        ? 'white'
        : state.winnerColor === 'black'
          ? 'black'
          : null;
    if (!result) return;

    await this.tournamentService!.recordGameResult({
      tournamentId,
      whiteUserId: white.playerId,
      blackUserId: black.playerId,
      result,
    });
  }
}
