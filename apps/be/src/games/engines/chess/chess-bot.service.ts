import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ChessService } from '../../chess/chess.service';
import type { ChessService as IChessService } from '../../chess/chess.service';
import type {
  ChessMove,
  ChessState,
} from '@arcadeum/games-core/games/chess/chess.types';
import type { GameSessionSummary } from '../../sessions/game-sessions.service';
import { ChessBot } from '@arcadeum/games-core/games/chess/chess-bot';
import { getAiMoveDelayMs, isAiVsAiSession } from '../../common/ai-vs-ai';

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

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as ChessState | undefined;
    if (!state) return;

    const hasHuman = state.players.some((p) => !p.isBot);
    if (!hasHuman && !isAiVsAiSession(session)) {
      this.logger.log(
        `No humans in room ${session.roomId} — completing session`,
      );
      await this.chessService.completeSession(session.id, session.roomId);
      return;
    }

    const currentId = state.players.find(
      (p) => p.color === state.currentTurnColor,
    )?.playerId;
    if (!currentId || !this.isBot(currentId)) return;
    if (this.processing.has(session.roomId)) return;
    this.processing.add(session.roomId);

    try {
      this.tt.clear();
      this.killers = Array.from({ length: 20 }, (): ChessMove[] => []);
      this.history = Array.from({ length: 8 }, (): number[] => [
        0, 0, 0, 0, 0, 0, 0, 0,
      ]);

      const timeBudget = this.computeTimeBudget(state);
      const startTime = Date.now();
      const move = this.findBestMoveWithTimeBudget(
        state,
        timeBudget,
        startTime,
      );
      if (!move) return;
      const delay =
        getAiMoveDelayMs(session) ??
        Math.max(300, Math.min(800, 1500 - Date.now() + startTime));
      await new Promise((r) => setTimeout(r, delay));

      if (this.moveFn) {
        await this.moveFn(currentId, session.roomId, {
          fromFile: move.from.file,
          fromRank: move.from.rank,
          toFile: move.to.file,
          toRank: move.to.rank,
          promotion: move.promotion ?? undefined,
        });
      }
    } catch (err) {
      this.logger.error(`Bot move failed for room ${session.roomId}: ${err}`);
    } finally {
      this.processing.delete(session.roomId);
    }
  }
}
