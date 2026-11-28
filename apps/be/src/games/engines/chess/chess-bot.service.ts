import {
  Inject,
  Injectable,
  Logger,
  forwardRef,
  Optional,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ChessService } from '../../chess/chess.service';
import type { ChessService as IChessService } from '../../chess/chess.service';
import type {
  ChessState,
  File,
  Rank,
} from '@arcadeum/games-core/games/chess/chess.types';
import type { PieceColor } from '@arcadeum/games-core/games/chess/chess.constants';
import type { BotSearchMove } from '@arcadeum/games-core/games/chess/chess-bot-search';
import { computeBotThinkTimeMs } from '@arcadeum/games-core/games/chess/chess-bot-pacing';
import { evaluate } from '@arcadeum/games-core/games/chess/chess-bot-eval';
import type { BotPersonality } from '@arcadeum/games-core/games/chess/chess-bot-personalities';
import { ChessBotSearchPool } from './chess-bot-search.pool';
import type { GameSessionSummary } from '../../sessions/game-sessions.service';
import { toFen } from '@arcadeum/games-core/games/chess/chess-fen';
import type { PieceType } from '@arcadeum/games-core/games/chess/chess.constants';
import { ChessBot } from '@arcadeum/games-core/games/chess/chess-bot';
import { getBotPersonality } from '@arcadeum/games-core/games/chess/chess-bot-personalities';
import { getAiMoveDelayMs, isAiVsAiSession } from '../../common/ai-vs-ai';
import { ChessStockfishService } from '../../chess/engine/chess-stockfish.service';

/** UCI promotion letters (e7e8q) to engine piece types. */
export const UCI_PROMOTION: Record<string, PieceType> = {
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
};

export interface ChessBotMovePayload {
  fromFile: string;
  fromRank: number;
  toFile: string;
  toRank: number;
  promotion?: string;
}

@Injectable()
export class ChessBotService extends ChessBot implements OnModuleDestroy {
  private readonly logger = new Logger(ChessBotService.name);
  /** Off-main-thread search so a thinking bot never blocks other games. */
  readonly searchPool = new ChessBotSearchPool();
  /** Think-time pause; overridable in tests. */
  pause: (ms: number) => Promise<void> = sleep;
  private readonly processing = new Set<string>();
  private moveFn:
    | ((
        userId: string,
        roomId: string,
        move: ChessBotMovePayload,
      ) => Promise<unknown>)
    | null = null;

  constructor(
    @Inject(forwardRef(() => ChessService))
    private readonly chessService: IChessService,
    @Optional() private readonly stockfishService: ChessStockfishService | null,
  ) {
    super();
  }

  setMoveFn(
    fn: (
      userId: string,
      roomId: string,
      move: ChessBotMovePayload,
    ) => Promise<unknown>,
  ) {
    this.moveFn = fn;
  }
  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  private buildStockfishUciOptions(
    personality: {
      style?: string;
      evaluationModifiers?: {
        attackWeight: number;
        safetyWeight: number;
        materialWeight: number;
      };
    } | null,
  ):
    | { skillLevel?: number; contempt?: number; aggression?: number }
    | undefined {
    if (!personality) return undefined;

    const mods = personality.evaluationModifiers;
    const style = personality.style;

    let skillLevel = 20;
    let contempt = 0;
    let aggression = 100;

    if (mods) {
      aggression = Math.round((mods.attackWeight / 1.8) * 100);
      contempt = Math.round((mods.attackWeight - mods.safetyWeight) * 40);
    }

    if (style === 'aggressive' || style === 'gambit') {
      skillLevel = 18;
      aggression = Math.max(aggression, 140);
      contempt = Math.max(contempt, 40);
    } else if (style === 'defensive' || style === 'fortress') {
      skillLevel = 19;
      aggression = Math.min(aggression, 60);
      contempt = Math.min(contempt, -20);
    } else if (style === 'positional') {
      skillLevel = 20;
      aggression = Math.min(aggression, 90);
      contempt = 10;
    } else if (style === 'greedy') {
      skillLevel = 19;
      aggression = Math.min(aggression, 50);
      contempt = -30;
    } else if (style === 'trickster') {
      skillLevel = 18;
      aggression = 110;
      contempt = 20;
    }

    return { skillLevel, contempt, aggression };
  }

  async onModuleDestroy(): Promise<void> {
    await this.searchPool.destroy();
  }

  /** Stockfish move for hard / master / expert bots, when the engine is up. */
  private async findStockfishMove(
    state: ChessState,
    personality: BotPersonality | null,
  ): Promise<BotSearchMove | null> {
    const difficulty = state.botDifficulty;
    if (
      (difficulty !== 'hard' &&
        difficulty !== 'master' &&
        difficulty !== 'expert') ||
      !this.stockfishService?.isReady()
    ) {
      return null;
    }
    const depth = difficulty === 'hard' ? 8 : difficulty === 'master' ? 12 : 15;
    const timeMs =
      difficulty === 'hard' ? 1000 : difficulty === 'master' ? 1500 : 2000;
    const sfResult = await this.stockfishService.getBestMove(
      toFen(state),
      depth,
      timeMs,
      this.buildStockfishUciOptions(personality),
    );
    const uci = sfResult.bestMove;
    if (!uci || uci.length < 4) return null;
    this.logger.log(
      `[Bot] Stockfish best move for ${state.currentTurnColor}: ${uci}`,
    );
    return {
      from: { file: uci[0] as File, rank: Number(uci[1]) as Rank },
      to: { file: uci[2] as File, rank: Number(uci[3]) as Rank },
      promotion: UCI_PROMOTION[uci.slice(4)] ?? null,
    };
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    const freshSession = await this.chessService.findSessionByRoom(
      session.roomId,
    );
    if (!freshSession) return;

    if (freshSession.status !== 'active') {
      this.logger.debug(
        `[Bot] Session ${freshSession.roomId} not active, skipping`,
      );
      return;
    }
    const state = freshSession.state as unknown as ChessState | undefined;
    if (!state) {
      this.logger.debug(`[Bot] No state for ${freshSession.roomId}, skipping`);
      return;
    }

    const hasHuman = state.players.some((p) => !p.isBot);
    if (!hasHuman && !isAiVsAiSession(freshSession)) {
      this.logger.log(
        `No humans in room ${freshSession.roomId}: completing session`,
      );
      await this.chessService.completeSession(
        freshSession.id,
        freshSession.roomId,
      );
      return;
    }

    const botPlayer = state.players.find(
      (p) => this.isBot(p.playerId) || p.isBot,
    );
    if (
      botPlayer &&
      state.takebackOfferedBy &&
      state.takebackOfferedBy !== botPlayer.playerId
    ) {
      await this.chessService.takebackAccept(
        botPlayer.playerId,
        freshSession.roomId,
      );
      return;
    }
    if (
      botPlayer &&
      state.drawOfferedBy &&
      state.drawOfferedBy !== botPlayer.playerId
    ) {
      // Accept only when the bot is not clearly better; otherwise decline
      // and keep playing (the offer would otherwise stay pending).
      if (shouldBotAcceptDraw(state, botPlayer.color)) {
        await this.chessService.drawAccept(
          botPlayer.playerId,
          freshSession.roomId,
        );
      } else {
        await this.chessService.drawDecline(
          botPlayer.playerId,
          freshSession.roomId,
        );
      }
      return;
    }

    const currentId = state.players.find(
      (p) => p.color === state.currentTurnColor,
    )?.playerId;
    if (!currentId || !this.isBot(currentId)) {
      this.logger.debug(
        `[Bot] Current player ${currentId} is not a bot in ${freshSession.roomId}`,
      );
      return;
    }
    if (this.processing.has(freshSession.roomId)) {
      this.logger.debug(
        `[Bot] Already processing ${freshSession.roomId}, skipping`,
      );
      return;
    }
    this.processing.add(session.roomId);

    try {
      const startedAt = Date.now();
      const currentColor = state.currentTurnColor;
      const options = (
        session as unknown as { options?: Record<string, unknown> }
      ).options;
      let personalityId = state.botPersonality;
      if (options?.aiVsAi) {
        const perColorKey =
          currentColor === 'white'
            ? 'botPersonalityWhite'
            : 'botPersonalityBlack';
        personalityId = (options[perColorKey] as string) ?? personalityId;
      }
      const personality = personalityId
        ? (getBotPersonality(personalityId) ?? null)
        : null;

      let move = await this.findStockfishMove(state, personality);
      if (!move) {
        move = await this.searchPool.search({
          state,
          timeBudgetMs: this.computeTimeBudget(state),
          difficulty: state.botDifficulty,
          personalityId: personalityId ?? null,
        });
      }
      if (!move) return;

      // Natural pacing: never answer instantly, vary the think time.
      const target =
        getAiMoveDelayMs(freshSession) ??
        computeBotThinkTimeMs(
          state,
          state.legalMovesForCurrentPlayer?.length ?? 2,
        );
      const waitMs = target - (Date.now() - startedAt);
      if (waitMs > 0) await this.pause(waitMs);

      // The position may have changed while thinking (resign, takeback...).
      const latest = await this.chessService.findSessionByRoom(session.roomId);
      const latestState = latest?.state as unknown as ChessState | undefined;
      if (
        !latest ||
        latest.status !== 'active' ||
        !latestState ||
        latestState.currentTurnColor !== currentColor ||
        latestState.moveHistory.length !== state.moveHistory.length
      ) {
        return;
      }

      if (this.moveFn) {
        this.logger.log(
          `[Bot] ${currentId} moving ${currentColor} in ${session.roomId}: ${move.from.file}${move.from.rank}-${move.to.file}${move.to.rank}`,
        );
        await this.moveFn(currentId, session.roomId, {
          fromFile: move.from.file,
          fromRank: move.from.rank,
          toFile: move.to.file,
          toRank: move.to.rank,
          promotion: move.promotion ?? undefined,
        });
      } else {
        this.logger.warn(`[Bot] moveFn not set for ${session.roomId}`);
      }
    } catch (err) {
      this.logger.error(`Bot move failed for room ${session.roomId}: ${err}`);
    } finally {
      this.processing.delete(session.roomId);
    }
  }
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Bot accepts a draw unless it is ahead by more than this (centipawns). */
export const BOT_DRAW_ACCEPT_MAX_EVAL = 50;

/** Static evaluation from the bot's point of view decides draw offers. */
export function shouldBotAcceptDraw(
  state: ChessState,
  botColor: PieceColor,
): boolean {
  const sideToMoveScore = evaluate(state);
  const botScore =
    state.currentTurnColor === botColor ? sideToMoveScore : -sideToMoveScore;
  return botScore <= BOT_DRAW_ACCEPT_MAX_EVAL;
}
