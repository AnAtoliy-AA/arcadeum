import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { CatDashService } from './cat-dash.service';
import type { CatDashService as ICatDashService } from './cat-dash.service';
import { GameSessionSummary } from '../sessions/game-sessions.service';
import type { CatDashState } from '../engines/cat-dash/cat-dash.types';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';

const LOCK_TIMEOUT_MS = 60000;
const PROCESSING_ENTRY_TTL_MS = 120_000;

const ROLL_DELAY_MS = { min: 800, max: 2000 };

@Injectable()
export class CatDashBotService {
  private readonly logger = new Logger(CatDashBotService.name);
  private readonly processing = new Map<string, number>();

  constructor(
    @Inject(forwardRef(() => CatDashService))
    private readonly catDashService: ICatDashService,
  ) {}

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status === 'completed') return;

    const state = session.state as CatDashState | undefined;
    if (!state || state.gameOver) return;

    const hasAliveHuman =
      Array.isArray(state.players) &&
      state.players.some((p) => p.playerId && !p.playerId.startsWith('bot-'));
    if (!hasAliveHuman && !isAiVsAiSession(session)) {
      this.logger.log(
        `No alive humans in room ${session.roomId} — completing session`,
      );
      await this.catDashService.completeSession(session.id, session.roomId);
      return;
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer) return;

    if (!currentPlayer.playerId.startsWith('bot-')) return;

    const lockKey = `${session.roomId}:${currentPlayer.playerId}`;
    const now = Date.now();

    if (this.processing.has(lockKey)) {
      const lockTime = this.processing.get(lockKey)!;
      if (now - lockTime < LOCK_TIMEOUT_MS) return;
      this.logger.warn(
        `Stale lock detected for ${lockKey}, clearing and retrying`,
      );
    }

    this.processing.set(lockKey, now);

    try {
      // AI-vs-AI matches pace turns with the configured fixed delay so
      // spectators get a steady rhythm instead of the random human-ish roll.
      const aiDelay = getAiMoveDelayMs(session);
      if (aiDelay !== null) {
        await this.delay(aiDelay, aiDelay);
      } else {
        await this.delay(ROLL_DELAY_MS.min, ROLL_DELAY_MS.max);
      }

      if (Date.now() - now > PROCESSING_ENTRY_TTL_MS) {
        this.logger.warn(
          `Bot ${currentPlayer.playerId} entry expired, skipping`,
        );
        return;
      }

      await this.catDashService.rollDice(
        currentPlayer.playerId,
        session.roomId,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Bot ${currentPlayer.playerId} failed in room ${session.roomId}: ${message}`,
      );
    } finally {
      this.processing.delete(lockKey);
    }
  }

  private delay(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
