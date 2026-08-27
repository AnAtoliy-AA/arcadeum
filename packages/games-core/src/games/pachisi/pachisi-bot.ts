import type {
  LegalMove,
  MoveTokenPayload,
  PachisiState,
} from './pachisi.types';
import {
  absoluteCell,
  computeMoveOutcome,
  getAllLegalMoves,
  tokensByPlayer,
} from './pachisi.utils';
import {
  FINISH_PROGRESS,
  MAIN_PATH_STEPS,
  SEAT_START_OFFSETS,
  STAR_CELLS,
} from './pachisi.constants';

/**
 * Framework-agnostic Pachisi bot decision logic (basic positional strategy).
 */

/** Heuristic weights (basic positional strategy). */
const SCORE = {
  finish: 120,
  captureBase: 60,
  exitYard: 55,
  enterLane: 40,
  landSafe: 12,
  dangerPenalty: -18,
  stackOwnStart: 6,
};

/**
 * One-ply positional heuristic. Medium uses a reduced subset (progress,
 * finish, capture, exit); hard/expert add lane entry, safe landing and
 * danger avoidance.
 */
export class PachisiBot {
  pickMove(state: PachisiState, botId: string): MoveTokenPayload | null {
    const legalMoves = getAllLegalMoves(state, botId);
    if (legalMoves.length === 0) return null;

    const difficulty = state.options.aiDifficulty ?? 'medium';
    if (difficulty === 'easy') {
      const chosen = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return { tokenId: chosen.tokenId };
    }

    let bestScore = -Infinity;
    let best = legalMoves[0];
    for (const move of legalMoves) {
      let score = this.scoreMove(state, botId, move);
      if (difficulty === 'expert')
        score += this.expertBonus(state, botId, move);
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }
    return { tokenId: best.tokenId };
  }

  /**
   * One-ply positional heuristic. Medium uses a reduced subset (progress,
   * finish, capture, exit); hard/expert add lane entry, safe landing and
   * danger avoidance.
   */
  private scoreMove(
    state: PachisiState,
    botId: string,
    move: LegalMove,
  ): number {
    const outcome = computeMoveOutcome(state, botId, move.tokenId);
    if (!outcome) return -Infinity;

    const token = tokensByPlayer(state, botId).find(
      (t) => t.id === move.tokenId,
    );

    let score = outcome.targetProgress / 4;

    if (outcome.targetProgress === FINISH_PROGRESS) score += SCORE.finish;

    if (outcome.captured.length > 0) {
      const maxVictimProgress = Math.max(
        ...outcome.captured.map(({ ownerId, tokenId }) => {
          const victim = tokensByPlayer(state, ownerId)?.find(
            (t) => t.id === tokenId,
          );
          return victim?.progress ?? 0;
        }),
      );
      score += SCORE.captureBase + maxVictimProgress;
    }

    if (state.die === 6 && token?.progress === -1) {
      score += SCORE.exitYard;
    }

    // Reduced medium heuristic stops here.
    if ((state.options.aiDifficulty ?? 'medium') === 'medium') {
      return score;
    }

    if (outcome.targetProgress >= MAIN_PATH_STEPS) {
      score += SCORE.enterLane;
    }

    if (
      outcome.targetCell !== null &&
      this.isSafeCell(state, botId, outcome.targetCell)
    ) {
      score += SCORE.landSafe;
    }

    if (
      outcome.targetCell !== null &&
      this.isDangerous(state, botId, outcome.targetCell)
    ) {
      score += SCORE.dangerPenalty;
    }

    return score;
  }

  /** Star cells are safe for everyone; own start cell is safe for its owner. */
  protected isSafeCell(
    state: PachisiState,
    botId: string,
    cell: number,
  ): boolean {
    if (STAR_CELLS.has(cell)) return true;
    const seat = state.seats[botId];
    if (seat === undefined) return false;
    return SEAT_START_OFFSETS[seat] === cell;
  }

  /** True when any opponent token can reach `cell` on its next roll. */
  protected isDangerous(
    state: PachisiState,
    botId: string,
    cell: number,
  ): boolean {
    for (const ownerId of state.playerOrder) {
      if (ownerId === botId) continue;
      const ownerSeat = state.seats[ownerId];
      if (ownerSeat === undefined) continue;
      for (const token of tokensByPlayer(state, ownerId)) {
        const p = token.progress;
        if (p < 0 || p >= MAIN_PATH_STEPS) continue;
        for (let die = 1; die <= 6; die++) {
          if (
            p + die < MAIN_PATH_STEPS &&
            absoluteCell(ownerSeat, p + die) === cell
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /** Expert-only refinements: prefer stacking tokens on the own safe start. */
  protected expertBonus(
    state: PachisiState,
    botId: string,
    move: LegalMove,
  ): number {
    const outcome = computeMoveOutcome(state, botId, move.tokenId);
    if (!outcome || outcome.targetCell === null) return 0;
    const seat = state.seats[botId];
    if (seat === undefined) return 0;
    if (
      outcome.targetCell === SEAT_START_OFFSETS[seat] &&
      outcome.captured.length === 0
    ) {
      return SCORE.stackOwnStart;
    }
    return 0;
  }
}
