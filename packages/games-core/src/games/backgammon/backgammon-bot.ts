import type {
  BackgammonState,
  LegalMove,
  MoveCheckerPayload,
} from './backgammon.types';
import { getAllLegalMoves } from './backgammon.utils';

/**
 * Framework-agnostic Backgammon bot decision logic.
 */
export class BackgammonBot {
  pickMove(state: BackgammonState, botId: string): MoveCheckerPayload | null {
    const legalMoves = getAllLegalMoves(
      botId,
      state.playerOrder,
      state.points,
      state.bar,
      state.borneOff,
      state.dice,
      state.options.ruleVariant,
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

  protected evaluateMove(
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
}
