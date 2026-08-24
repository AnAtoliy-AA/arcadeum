import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { PachisiService } from './pachisi.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '@arcadeum/games-core/games/pachisi/pachisi.constants';
import type { PachisiState } from '@arcadeum/games-core/games/pachisi/pachisi.types';
import { PachisiBot } from '@arcadeum/games-core/games/pachisi/pachisi-bot';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';
import { BotTurnLock } from '../common/bot-turn-lock';

const MOVE_DELAY_MS = { min: 400, max: 900 };

@Injectable()
export class PachisiBotService extends PachisiBot {
  private readonly logger = new Logger(PachisiBotService.name);
  /** TTL-based single-flight lock so a hung chain cannot deadlock a room. */
  private readonly turnLock = new BotTurnLock();

  constructor(
    @Inject(forwardRef(() => PachisiService))
    private readonly pachisiService: PachisiService,
  ) {
    super();
  }

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as PachisiState | undefined;
    if (!state || state.phase === GAME_PHASE.GAME_OVER) return;

    const hasAliveHuman = state.players.some(
      (p) => p.alive && !this.isBot(p.playerId),
    );
    if (!hasAliveHuman && !isAiVsAiSession(session)) {
      await this.pachisiService.completeSession(session.id, session.roomId);
      return;
    }

    const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
    if (!currentTurnPlayerId || !this.isBot(currentTurnPlayerId)) return;

    const lockKey = `${session.roomId}:${currentTurnPlayerId}`;
    if (!this.turnLock.tryAcquire(lockKey)) return;

    try {
      let currentSession = session;
      let currentState = currentSession.state as unknown as
        PachisiState | undefined;

      while (
        currentSession.status === 'active' &&
        currentState &&
        currentState.phase !== GAME_PHASE.GAME_OVER &&
        currentState.playerOrder[currentState.currentTurnIndex] ===
          currentTurnPlayerId
      ) {
        const aiDelay = getAiMoveDelayMs(currentSession);
        const delayMs =
          aiDelay ??
          MOVE_DELAY_MS.min +
            Math.floor(Math.random() * (MOVE_DELAY_MS.max - MOVE_DELAY_MS.min));
        await this.delay(delayMs);

        if (currentState.phase === GAME_PHASE.ROLL) {
          const updated = await this.pachisiService.rollDice(
            currentTurnPlayerId,
            currentSession.roomId,
          );
          currentSession = updated;
          currentState = updated.state as unknown as PachisiState;
        } else if (currentState.phase === GAME_PHASE.MOVE) {
          const move = this.pickMove(currentState, currentTurnPlayerId);
          if (!move) {
            // Defensive fallback: if the bot is stuck in MOVE with no legal
            // moves (state drift), pass the turn instead of deadlocking.
            const updated = await this.pachisiService.passTurn(
              currentTurnPlayerId,
              currentSession.roomId,
            );
            currentSession = updated;
            currentState = updated.state as unknown as PachisiState;
            continue;
          }
          const updated = await this.pachisiService.moveToken(
            currentTurnPlayerId,
            currentSession.roomId,
            move.tokenId,
          );
          currentSession = updated;
          currentState = updated.state as unknown as PachisiState;
        } else {
          break;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Bot ${currentTurnPlayerId} error: ${message}`);
    } finally {
      this.turnLock.release(lockKey);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
