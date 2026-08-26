import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { TicTacToeService } from './tic-tac-toe.service';
import type { TicTacToeService as ITicTacToeService } from './tic-tac-toe.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import {
  GAME_PHASE,
  type BoardSize,
} from '@arcadeum/games-core/games/tic-tac-toe/tic-tac-toe.constants';
import type { TicTacToeState } from '@arcadeum/games-core/games/tic-tac-toe/tic-tac-toe.types';
import { TicTacToeBot } from '@arcadeum/games-core/games/tic-tac-toe/tic-tac-toe-bot';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';
import { randomInt } from 'crypto';

const MOVE_DELAY_MS = { min: 400, max: 1100 };

@Injectable()
export class TicTacToeBotService extends TicTacToeBot {
  private readonly logger = new Logger(TicTacToeBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => TicTacToeService))
    private readonly ticTacToeService: ITicTacToeService,
  ) {
    super();
  }

  private secureRandom(max: number): number {
    return randomInt(max);
  }

  private secureRandomRange(min: number, max: number): number {
    return min + this.secureRandom(max - min + 1);
  }

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as TicTacToeState | undefined;
    if (!state || state.phase !== GAME_PHASE.PLAYING) return;

    const hasAliveHuman = state.players.some(
      (p) => p.alive && !this.isBot(p.playerId),
    );
    if (!hasAliveHuman && !isAiVsAiSession(session)) {
      this.logger.log(
        `No alive humans in room ${session.roomId} — completing session`,
      );
      await this.ticTacToeService.completeSession(session.id, session.roomId);
      return;
    }

    const currentShooterId = this.getCurrentShooterId(state);
    if (!currentShooterId || !this.isBot(currentShooterId)) return;

    const lockKey = `${session.roomId}:${currentShooterId}`;
    if (this.processing.has(lockKey)) return;
    this.processing.add(lockKey);

    try {
      const aiDelay = getAiMoveDelayMs(session);
      if (aiDelay !== null) {
        await this.randomDelay({ min: aiDelay, max: aiDelay });
      } else {
        await this.randomDelay(MOVE_DELAY_MS);
      }
      const move = this.pickMove(state, currentShooterId);
      if (!move) return;
      await this.ticTacToeService.placeMark(
        currentShooterId,
        session.roomId,
        move,
      );
    } catch (error) {
      this.logger.error(`Bot ${currentShooterId} failed to play: ${error}`);
    } finally {
      this.processing.delete(lockKey);
    }
  }

  private async randomDelay(range: { min: number; max: number }) {
    const ms = this.secureRandomRange(range.min, range.max);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Exposed for test inspection; not part of the public API.
  /** @internal */
  _boardSizeGuard(size: number | string): size is BoardSize {
    return (
      size === 3 ||
      size === 5 ||
      size === 7 ||
      size === 9 ||
      size === 'infinity'
    );
  }
}
