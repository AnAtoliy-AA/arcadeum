import {
  Inject,
  Injectable,
  Logger,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { ChessService } from '../../chess/chess.service';
import type { ChessService as IChessService } from '../../chess/chess.service';
import type {
  ChessMove,
  ChessState,
} from '@arcadeum/games-core/games/chess/chess.types';
import type { GameSessionSummary } from '../../sessions/game-sessions.service';
import { ChessBot } from '@arcadeum/games-core/games/chess/chess-bot';
import { getBotPersonality } from '@arcadeum/games-core/games/chess/chess-bot-personalities';
import { isAiVsAiSession } from '../../common/ai-vs-ai';
import { ChessStockfishService } from '../../chess/engine/chess-stockfish.service';

export interface ChessBotMovePayload {
  fromFile: string;
  fromRank: number;
  toFile: string;
  toRank: number;
  promotion?: string;
}

@Injectable()
export class ChessBotService extends ChessBot {
  private readonly logger = new Logger(ChessBotService.name);
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
      await this.chessService.drawAccept(
        botPlayer.playerId,
        freshSession.roomId,
      );
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
      this.tt.clear();
      this.killers = Array.from({ length: 20 }, (): ChessMove[] => []);
      this.history = Array.from({ length: 8 }, (): number[] => [
        0, 0, 0, 0, 0, 0, 0, 0,
      ]);

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
      this.setPersonality(personality);

      const isStockfishDifficulty =
        state.botDifficulty === 'hard' ||
        state.botDifficulty === 'master' ||
        state.botDifficulty === 'expert';
      let move: ChessMove | null = null;

      if (isStockfishDifficulty && this.stockfishService?.isReady()) {
        const { toFen } =
          await import('@arcadeum/games-core/games/chess/chess-fen');
        const fen = toFen(state);

        const depth =
          state.botDifficulty === 'hard'
            ? 8
            : state.botDifficulty === 'master'
              ? 12
              : 15;
        const timeMs =
          state.botDifficulty === 'hard'
            ? 1000
            : state.botDifficulty === 'master'
              ? 1500
              : 2000;

        const uciOptions = this.buildStockfishUciOptions(personality);
        const sfResult = await this.stockfishService.getBestMove(
          fen,
          depth,
          timeMs,
          uciOptions,
        );
        if (sfResult.bestMove) {
          const fromStr = sfResult.bestMove.slice(0, 2);
          const toStr = sfResult.bestMove.slice(2, 4);
          const promoChar = sfResult.bestMove.slice(4);
          move = {
            from: {
              file: fromStr[0] as ChessMove['from']['file'],
              rank: parseInt(fromStr[1]) as ChessMove['from']['rank'],
            },
            to: {
              file: toStr[0] as ChessMove['to']['file'],
              rank: parseInt(toStr[1]) as ChessMove['to']['rank'],
            },
            piece:
              state.board[fromStr.charCodeAt(0) - 97]?.[
                8 - parseInt(fromStr[1])
              ]?.type ?? 'pawn',
            promotion: promoChar || undefined,
          } as unknown as ChessMove;
          this.logger.log(
            `[Bot] Stockfish best move for ${state.currentTurnColor}: ${sfResult.bestMove}`,
          );
        }
      }

      if (!move) {
        const timeBudget = this.computeTimeBudget(state);
        move = this.findBestMoveWithTimeBudget(state, timeBudget, Date.now());
      }

      if (!move) return;
      if (this.moveFn) {
        this.logger.log(
          `[Bot] ${currentId} moving ${state.currentTurnColor} in ${session.roomId}: ${move.from.file}${move.from.rank}-${move.to.file}${move.to.rank}`,
        );
        await this.moveFn(currentId, session.roomId, {
          fromFile: move.from.file,
          fromRank: move.from.rank,
          toFile: move.to.file,
          toRank: move.to.rank,
          promotion: move.promotion ?? undefined,
        });
        this.logger.log(
          `[Bot] ${currentId} move completed in ${session.roomId}`,
        );
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
