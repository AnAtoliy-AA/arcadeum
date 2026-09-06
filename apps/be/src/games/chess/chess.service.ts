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
} from '../engines/chess/chess.types';
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

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 2;

@Injectable()
export class ChessService extends BaseGameService<ChessOptions> {
  protected readonly logger = new Logger(ChessService.name);
  readonly gameId = 'chess_v1';
  readonly gameName = 'Chess';
  readonly minPlayers = MIN_PLAYERS;
  readonly maxPlayers = MAX_PLAYERS;

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
        payload: {
          fromFile: string;
          fromRank: number;
          toFile: string;
          toRank: number;
          promotion?: string;
        },
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

  async drawOffer(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'draw_offer', {});
  }

  async drawAccept(userId: string, roomId: string) {
    return this.runAction(userId, roomId, 'draw_accept', {});
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

    return result;
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
    if (moveCount > 0) {
      if (!this.stockfishService?.isReady()) {
        this.logger.warn(
          `[Chess] Stockfish not ready, skipping analysis for room ${session.roomId}`,
        );
      } else {
        const state = session.state as ChessState | undefined;
        if (state) {
          // Generate full FEN (positionHistory only stores board part)
          const { toFen } = await import('@arcadeum/games-core/games/chess/chess-fen');
          const fullFen = toFen(state);
          this.logger.log(
            `[Chess] Analyzing fen for room ${session.roomId}: ${fullFen.substring(0, 50)}...`,
          );
          this.stockfishService
            .analyzePosition({ fen: fullFen, depth: 12, timeMs: 1500 })
            .then((eval_) => {
              this.logger.log(
                `[Chess] Eval for room ${session.roomId}: cp=${eval_.cp} mate=${eval_.mate} depth=${eval_.depth}`,
              );
              this.realtimeService.emitToRoom(
                session.roomId,
                'chess.session.analyzed',
                {
                  roomId: session.roomId,
                  eval: eval_,
                },
              );
              // Also broadcast to spectators
              this.realtimeService.emitToSpectators(
                session.roomId,
                'chess.session.analyzed',
                {
                  roomId: session.roomId,
                  eval: eval_,
                },
              );
            })
            .catch((err) => {
              this.logger.error(
                `[Chess] Stockfish analysis failed for room ${session.roomId}: ${err}`,
              );
            });
        }
      }
    }
  }

  private async checkClockTimeout(session: GameSessionSummary) {
    const state = session.state as ChessState | undefined;
    if (!state || !state.clocks || this.isGameOver(state)) return;

    const isDaily = state.timeControl?.type === 'daily';
    const currentClock = state.clocks[state.currentTurnColor];
    if (!currentClock) return;

    const elapsedMs = Date.now() - currentClock.lastMoveTimestamp;

    if (isDaily) {
      const daysPerMove = state.timeControl?.daysPerMove ?? 1;
      const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
      if (elapsedDays < daysPerMove) return;
    } else {
      const elapsed = Math.floor(elapsedMs / 1000);
      const remaining = currentClock.remainingSeconds - elapsed;
      if (remaining > 0) return;
    }

    const loser = state.players.find((p) => p.color === state.currentTurnColor);
    const winner = state.players.find(
      (p) => p.color !== state.currentTurnColor,
    );
    if (loser && winner) {
      await this.runAction(loser.playerId, session.roomId, 'forfeit', {});
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
      const validTypes: TimeControlType[] = [
        'bullet',
        'blitz',
        'rapid',
        'classical',
        'daily',
      ];
      const type = validTypes.includes(rawTc.type as TimeControlType)
        ? (rawTc.type as TimeControlType)
        : 'blitz';
      const validIncs: TimeIncrement[] = [0, 1, 3, 5, 10, 15, 30];
      const inc = validIncs.includes(rawTc.incrementSeconds as TimeIncrement)
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

    let result: 'white' | 'black' | 'draw';
    if (
      state.isDrawByAgreement ||
      state.isDrawByRepetition ||
      state.isDrawByFiftyMoveRule ||
      state.isInsufficientMaterial ||
      state.isStalemate
    ) {
      result = 'draw';
    } else if (state.winnerColor === 'white') {
      result = 'white';
    } else if (state.winnerColor === 'black') {
      result = 'black';
    } else {
      return;
    }

    await this.tournamentService!.recordGameResult({
      tournamentId,
      whiteUserId: white.playerId,
      blackUserId: black.playerId,
      result,
    });
  }
}
