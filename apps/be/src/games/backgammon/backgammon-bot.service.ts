import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { BackgammonService } from './backgammon.service';
import type { BackgammonService as IBackgammonService } from './backgammon.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '@arcadeum/games-core/games/backgammon/backgammon.constants';
import type { BackgammonState } from '@arcadeum/games-core/games/backgammon/backgammon.types';
import { BackgammonBot } from '@arcadeum/games-core/games/backgammon/backgammon-bot';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';

const MOVE_DELAY_MS = { min: 400, max: 900 };

@Injectable()
export class BackgammonBotService extends BackgammonBot {
  private readonly logger = new Logger(BackgammonBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => BackgammonService))
    private readonly backgammonService: IBackgammonService,
  ) {
    super();
  }

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as BackgammonState | undefined;
    if (!state || state.phase === GAME_PHASE.GAME_OVER) return;

    const hasAliveHuman = state.players.some(
      (p) => p.alive && !this.isBot(p.playerId),
    );
    if (!hasAliveHuman && !isAiVsAiSession(session)) {
      await this.backgammonService.completeSession(session.id, session.roomId);
      return;
    }

    const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
    if (!currentTurnPlayerId || !this.isBot(currentTurnPlayerId)) return;

    const lockKey = `${session.roomId}:${currentTurnPlayerId}`;
    if (this.processing.has(lockKey)) return;
    this.processing.add(lockKey);

    try {
      let currentSession = session;
      let currentState = currentSession.state as unknown as
        BackgammonState | undefined;

      while (
        currentSession.status === 'active' &&
        currentState &&
        currentState.phase !== GAME_PHASE.GAME_OVER &&
        currentState.playerOrder[currentState.currentTurnIndex] ===
          currentTurnPlayerId
      ) {
        const aiDelay = getAiMoveDelayMs(currentSession);
        const delayMs = aiDelay !== null ? aiDelay : MOVE_DELAY_MS.min;
        await this.delay(delayMs);

        if (currentState.phase === GAME_PHASE.ROLL) {
          const updated = await this.backgammonService.rollDice(
            currentTurnPlayerId,
            currentSession.roomId,
          );
          currentSession = updated;
          currentState = updated.state as unknown as BackgammonState;
        } else if (currentState.phase === GAME_PHASE.MOVE) {
          const move = this.pickMove(currentState, currentTurnPlayerId);
          if (!move) {
            // Defensive fallback: if the bot is stuck in MOVE with no legal
            // moves (state drift), pass the turn instead of deadlocking.
            const updated = await this.backgammonService.passTurn(
              currentTurnPlayerId,
              currentSession.roomId,
            );
            currentSession = updated;
            currentState = updated.state as unknown as BackgammonState;
            continue;
          }
          const updated = await this.backgammonService.moveChecker(
            currentTurnPlayerId,
            currentSession.roomId,
            move,
          );
          currentSession = updated;
          currentState = updated.state as unknown as BackgammonState;
        } else {
          break;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Bot ${currentTurnPlayerId} error: ${message}`);
    } finally {
      this.processing.delete(lockKey);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
