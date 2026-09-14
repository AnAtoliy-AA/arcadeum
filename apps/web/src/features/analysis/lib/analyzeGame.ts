import type { PieceColor } from './types';
import { evaluateBoard } from './position-evaluator';
import { parseFenPiecePlacement } from './fen';

/**
 * Post-game analysis built from the chess `positionHistory` (a FEN per ply,
 * including the initial position) persisted in the session state. For each
 * position we run a static evaluation and then grade every move using a
 * winning-chances sigmoid formula to convert centipawn loss into
 * a classification (brilliant / great / best / excellent / good / book / inaccuracy / mistake / blunder).
 */

export type MoveQuality =
  | 'brilliant'
  | 'great'
  | 'best'
  | 'excellent'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder';

export interface AnalyzedMove {
  /** 0-indexed ply. Even = White's move, odd = Black's move. */
  ply: number;
  /** 1-indexed full move number. */
  moveNumber: number;
  color: PieceColor;
  /** Short algebraic notation of the move ("" when not provided). */
  notation: string;
  /** White-perspective evaluation after the move, in centipawns. */
  evalAfter: number;
  /** White-perspective evaluation change caused by the move. */
  delta: number;
  /** Centipawns lost from the mover's perspective (>= 0). */
  loss: number;
  quality: MoveQuality;
}

export interface GameAnalysis {
  /** White-perspective evaluation after each ply (length = positionHistory.length). */
  evals: number[];
  moves: AnalyzedMove[];
  inaccuracies: AnalyzedMove[];
  mistakes: AnalyzedMove[];
  blunders: AnalyzedMove[];
  /** Move with the largest single-ply evaluation swing, if any. */
  turningPoint: AnalyzedMove | null;
  finalEval: number;
}

/**
 * Convert centipawns to winning chances using a sigmoid formula.
 * Returns a value in [-1, 1] where 1 = certain win, -1 = certain loss.
 */
function winningChances(cp: number): number {
  return 2 / (1 + Math.exp(-0.004 * cp)) - 1;
}

/**
 * Classify move quality using winning-chance delta.
 * Uses the same thresholds as the backend Stockfish classification.
 * Note: 'best' and 'book' require engine data, so this fallback only
 * produces brilliant/great/excellent/good/inaccuracy/mistake/blunder.
 */
function qualityForLoss(
  loss: number,
  evalBefore: number,
  evalAfter: number,
): MoveQuality {
  const lossDelta = winningChances(evalBefore) - winningChances(evalAfter);

  if (loss === 0 && Math.abs(evalAfter) > 200) return 'brilliant';
  if (loss <= 5 && lossDelta < 0.05 && Math.abs(evalAfter) > 100)
    return 'great';
  if (loss <= 3 && lossDelta < 0.05) return 'excellent';
  if (lossDelta < 0.1) return 'good';
  if (lossDelta < 0.2) return 'inaccuracy';
  if (lossDelta < 0.3) return 'mistake';
  return 'blunder';
}

/**
 * Analyzes a finished chess game from its persisted FEN history.
 *
 * @param positionHistory FEN per ply, including the initial position
 *   (length = number of moves + 1). Piece-only FENs are accepted.
 * @param notations Optional short-algebraic notations per move, used only for
 *   display in the move timeline.
 */
export function analyzeGame(
  positionHistory: string[],
  notations?: string[],
): GameAnalysis {
  const evals = positionHistory.map((fen) =>
    evaluateBoard(parseFenPiecePlacement(fen)),
  );
  const moveCount = Math.max(0, evals.length - 1);

  const moves: AnalyzedMove[] = [];
  for (let ply = 0; ply < moveCount; ply++) {
    const evalBefore = evals[ply];
    const evalAfter = evals[ply + 1];
    const color: PieceColor = ply % 2 === 0 ? 'white' : 'black';
    const delta = evalAfter - evalBefore;
    const moverDelta = color === 'white' ? delta : -delta;
    const loss = Math.max(0, -moverDelta);

    moves.push({
      ply,
      moveNumber: Math.floor(ply / 2) + 1,
      color,
      notation: notations?.[ply] ?? '',
      evalAfter,
      delta,
      loss,
      quality: qualityForLoss(
        loss,
        color === 'white' ? evalBefore : -evalBefore,
        color === 'white' ? evalAfter : -evalAfter,
      ),
    });
  }

  const inaccuracies = moves.filter((m) => m.quality === 'inaccuracy');
  const mistakes = moves.filter((m) => m.quality === 'mistake');
  const blunders = moves.filter((m) => m.quality === 'blunder');

  let turningPoint: AnalyzedMove | null = null;
  let maxSwing = -1;
  for (const move of moves) {
    const swing = Math.abs(move.delta);
    if (swing > maxSwing) {
      maxSwing = swing;
      turningPoint = move;
    }
  }

  return {
    evals,
    moves,
    inaccuracies,
    mistakes,
    blunders,
    turningPoint,
    finalEval: evals[evals.length - 1] ?? 0,
  };
}
