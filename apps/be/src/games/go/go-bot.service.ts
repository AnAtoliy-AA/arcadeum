import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '../engines/go/go.constants';
import type { GoState } from '../engines/go/go.types';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';
import { pickStrategyMove } from './go-bot.strategy';
import { GoService } from './go.service';

const MOVE_DELAY_MS = 500;

@Injectable()
export class GoBotService {
  private readonly logger = new Logger(GoBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => GoService))
    private readonly goService: GoService,
  ) {}

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as GoState | undefined;
    if (!state || state.phase === GAME_PHASE.GAME_OVER) return;

    const hasAliveHuman = state.players.some(
      (p) => p.alive && !this.isBot(p.playerId),
    );
    if (!hasAliveHuman && !isAiVsAiSession(session)) {
      await this.goService.completeSession(session.id, session.roomId);
      return;
    }

    const currentTurnPlayerId = state.playerOrder[state.currentTurnIndex];
    if (!currentTurnPlayerId || !this.isBot(currentTurnPlayerId)) return;

    const lockKey = `${session.roomId}:${currentTurnPlayerId}`;
    if (this.processing.has(lockKey)) return;
    this.processing.add(lockKey);

    try {
      let currentSession = session;
      let currentState = currentSession.state as unknown as GoState | undefined;

      while (
        currentSession.status === 'active' &&
        currentState &&
        currentState.phase !== GAME_PHASE.GAME_OVER &&
        currentState.playerOrder[currentState.currentTurnIndex] ===
          currentTurnPlayerId
      ) {
        const aiDelay = getAiMoveDelayMs(currentSession);
        await this.delay(aiDelay !== null ? aiDelay : MOVE_DELAY_MS);

        const decision = pickStrategyMove(
          currentState,
          currentState.players.find((p) => p.playerId === currentTurnPlayerId)
            ?.color ?? 'black',
          currentState.options.aiDifficulty ?? 'medium',
        );

        const updated =
          decision === null || decision === 'pass'
            ? // Defensive fallback + strategic pass: never deadlock a session.
              await this.goService.passTurn(
                currentTurnPlayerId,
                currentSession.roomId,
              )
            : await this.goService.placeStone(
                currentTurnPlayerId,
                currentSession.roomId,
                decision,
              );
        currentSession = updated;
        currentState = updated.state as unknown as GoState;
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
