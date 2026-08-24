import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { CheckersService } from './checkers.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '@arcadeum/games-core/games/checkers/checkers.constants';
import type {
  CheckersState,
  MovePayload,
} from '@arcadeum/games-core/games/checkers/checkers.types';
import { CheckersBot } from '@arcadeum/games-core/games/checkers/checkers-bot';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';

const MOVE_DELAY_MS = { min: 400, max: 1100 };

@Injectable()
export class CheckersBotService extends CheckersBot {
  private readonly logger = new Logger(CheckersBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => CheckersService))
    private readonly checkersService: CheckersService,
  ) {
    super();
  }

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as CheckersState | undefined;
    if (!state || state.phase !== GAME_PHASE.PLAYING) return;

    const hasAliveHuman = state.players.some(
      (p) => p.alive && !this.isBot(p.playerId),
    );
    if (!hasAliveHuman && !isAiVsAiSession(session)) {
      this.logger.log(
        `No alive humans in room ${session.roomId} — completing session`,
      );
      await this.checkersService.completeSession(session.id, session.roomId);
      return;
    }

    const currentBotId = state.playerOrder[state.currentTurnIndex];
    if (!currentBotId || !this.isBot(currentBotId)) return;

    const lockKey = `${session.roomId}:${currentBotId}`;
    if (this.processing.has(lockKey)) return;
    this.processing.add(lockKey);

    try {
      const aiDelay = getAiMoveDelayMs(session);
      if (aiDelay !== null) {
        await this.randomDelay({ min: aiDelay, max: aiDelay });
      } else {
        await this.randomDelay(MOVE_DELAY_MS);
      }
      const move: MovePayload | null = this.pickMove(state, currentBotId);
      if (!move) return;
      await this.checkersService.movePiece(currentBotId, session.roomId, move);
    } catch (error) {
      this.logger.error(`Bot ${currentBotId} failed to play: ${error}`);
    } finally {
      this.processing.delete(lockKey);
    }
  }

  private async randomDelay(range: { min: number; max: number }) {
    const ms = range.min + Math.random() * (range.max - range.min);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
