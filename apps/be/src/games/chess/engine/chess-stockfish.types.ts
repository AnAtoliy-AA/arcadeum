/**
 * Stockfish 19 engine integration types.
 *
 * Stockfish 19 was released 2026-09-05 (latest stable).
 * npm package: stockfish (WASM build, tracks Stockfish releases).
 * When Stockfish 19 lands on npm, bump the version — no API changes expected.
 */

/** Centipawn evaluation from White's perspective (positive = White better). */
export interface EngineEval {
  /** Evaluation in centipawns. null when mate is detected. */
  cp: number | null;
  /** Mate in N plies. null when not a mate. */
  mate: number | null;
  /** Principal variation as UCI move strings. */
  pv: string[];
  /** Search depth reached. */
  depth: number;
  /** Selective depth. */
  selDepth: number;
  /** Nodes searched. */
  nodes: number;
  /** Nodes per second. */
  nps: number;
  /** Time spent thinking in milliseconds. */
  timeMs: number;
}

/** A single move analysis line. */
export interface EngineLine {
  /** Move quality classification. */
  quality:
    'brilliant' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  /** The move played (UCI format). */
  move: string;
  /** Centipawn evaluation after this move. */
  evalAfter: number | null;
  /** Mate score after this move. */
  mateAfter: number | null;
  /** Centipawn loss from the mover's perspective (>= 0). */
  loss: number;
  /** Best move according to engine. */
  bestMove: string;
  /** Principal variation of the best line. */
  bestPv: string[];
  /** Alternative lines (2nd and 3rd best moves from multi-PV search). */
  alternatives?: Array<{
    move: string;
    cp: number | null;
    mate: number | null;
    pv: string[];
  }>;
}

/** Full game analysis result. */
export interface GameAnalysisResult {
  /** Evaluation after each ply (length = positionHistory.length). */
  evals: (number | null)[];
  /** Per-move analysis. */
  moves: EngineLine[];
  /** White accuracy percentage (0-100). */
  whiteAccuracy: number;
  /** Black accuracy percentage (0-100). */
  blackAccuracy: number;
  /** Number of brilliances, great moves, etc. */
  summary: {
    brilliant: number;
    great: number;
    good: number;
    inaccuracy: number;
    mistake: number;
    blunder: number;
  };
  /** Tablebase result for the final position (if <= 7 pieces). */
  tablebase?: {
    category: string;
    dtz: number | null;
    dtm: number | null;
  } | null;
  /** Engine match counts per player for anti-cheat (best-move matches). */
  antiCheat?: {
    whiteEngineMatchCount: number;
    blackEngineMatchCount: number;
    whiteTotalMoves: number;
    blackTotalMoves: number;
  };
}

/** Request to analyze a single position. */
export interface AnalyzePositionRequest {
  fen: string;
  depth?: number;
  timeMs?: number;
  lines?: number;
}

/** Request to analyze a full game. */
export interface AnalyzeGameRequest {
  positionHistory: string[];
  notations?: string[];
  depth?: number;
  timeMsPerPly?: number;
}

/** Response for live eval during a game. */
export interface LiveEvalResponse {
  roomId: string;
  ply: number;
  eval: EngineEval;
}

/** Hint for a puzzle position. */
export interface PuzzleHint {
  /** Best move for the position (UCI). */
  bestMove: string;
  /** Engine evaluation of the position. */
  eval: EngineEval;
  /** Principle variation line. */
  pv: string[];
  /** Alternative moves with their evaluations. */
  alternatives: Array<{ move: string; cp: number | null; mate: number | null }>;
}
