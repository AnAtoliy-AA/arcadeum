import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { BackgammonService } from './backgammon.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '../engines/backgammon/backgammon.constants';
import type {
  BackgammonState,
  LegalMove,
  MoveCheckerPayload,
} from '../engines/backgammon/backgammon.types';
import { getAllLegalMoves } from '../engines/backgammon/backgammon.utils';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';

const MOVE_DELAY_MS = { min: 400, max: 900 };

@Injectable()
export class BackgammonBotService {
  private readonly logger = new Logger(BackgammonBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => BackgammonService))
    private readonly backgammonService: BackgammonService,
  ) {}

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
      const aiDelay = getAiMoveDelayMs(session);
      const delayMs = aiDelay !== null ? aiDelay : MOVE_DELAY_MS.min;
      await this.delay(delayMs);

      if (state.phase === GAME_PHASE.ROLL) {
        await this.backgammonService.rollDice(
          currentTurnPlayerId,
          session.roomId,
        );
      } else if (state.phase === GAME_PHASE.MOVE) {
        const move = this.pickMove(state, currentTurnPlayerId);
        if (move) {
          await this.backgammonService.moveChecker(
            currentTurnPlayerId,
            session.roomId,
            move,
          );
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Bot ${currentTurnPlayerId} error: ${message}`);
    } finally {
      this.processing.delete(lockKey);
    }
  }

  pickMove(state: BackgammonState, botId: string): MoveCheckerPayload | null {
    const legalMoves = getAllLegalMoves(
      botId,
      state.playerOrder,
      state.points,
      state.bar,
      state.borneOff,
      state.dice,
    );

    if (legalMoves.length === 0) return null;

    const difficulty = state.options.aiDifficulty ?? 'medium';
    if (difficulty === 'easy') {
      const randomIndex = Math.floor(Math.random() * legalMoves.length);
      const chosen = legalMoves[randomIndex];
      return { from: chosen.from, to: chosen.to };
    }

    let bestScore = -Infinity;
    let bestMove = legalMoves[0];

    for (const move of legalMoves) {
      const score = this.evaluateMove(state, botId, move);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return { from: bestMove.from, to: bestMove.to };
  }

  private evaluateMove(
    state: BackgammonState,
    botId: string,
    move: LegalMove,
  ): number {
    let score = 0;

    if (move.to === 'off') {
      score += 100;
    }

    if (move.isHit) {
      score += 50;
    }

    if (move.from === 'bar') {
      score += 40;
    }

    if (typeof move.to === 'number') {
      const targetPoint = state.points[move.to];
      if (targetPoint.playerId === botId && targetPoint.count === 1) {
        score += 25;
      }
      if (targetPoint.count === 0) {
        score -= 10;
      }
    }

    if (typeof move.from === 'number') {
      const advanceDistance = move.die;
      score += advanceDistance * 2;

      const fromPoint = state.points[move.from];
      if (fromPoint.count === 2) {
        score -= 15;
      }
    }

    return score;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
