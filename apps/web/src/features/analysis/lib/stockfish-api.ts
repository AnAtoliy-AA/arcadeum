import { apiClient } from '@/shared/lib/api-client';

export interface EngineLine {
  quality:
    | 'brilliant'
    | 'great'
    | 'good'
    | 'inaccuracy'
    | 'mistake'
    | 'blunder';
  move: string;
  evalAfter: number | null;
  mateAfter: number | null;
  loss: number;
  bestMove: string;
  bestPv: string[];
  alternatives?: Array<{
    move: string;
    cp: number | null;
    mate: number | null;
    pv: string[];
  }>;
}

export interface GameAnalysisResult {
  evals: (number | null)[];
  moves: EngineLine[];
  whiteAccuracy: number;
  blackAccuracy: number;
  summary: {
    brilliant: number;
    great: number;
    good: number;
    inaccuracy: number;
    mistake: number;
    blunder: number;
  };
  tablebase?: {
    category: string;
    dtz: number | null;
    dtm: number | null;
  } | null;
  antiCheat?: {
    whiteEngineMatchCount: number;
    blackEngineMatchCount: number;
    whiteTotalMoves: number;
    blackTotalMoves: number;
  };
}

export interface PuzzleHint {
  bestMove: string;
  eval: { cp: number | null; mate: number | null; pv: string[] };
  alternatives: Array<{ move: string; cp: number | null; mate: number | null }>;
}

export async function analyzeGameWithStockfish(
  positionHistory: string[],
  notations?: string[],
): Promise<GameAnalysisResult | null> {
  try {
    return await apiClient.post<GameAnalysisResult>(
      '/chess/engine/analyze-game',
      { positionHistory, notations, depth: 18, timeMsPerPly: 3000 },
    );
  } catch {
    return null;
  }
}

export async function analyzePositionWithStockfish(
  fen: string,
  depth = 12,
  timeMs = 1500,
): Promise<{ cp: number | null; mate: number | null; pv: string[] } | null> {
  try {
    return await apiClient.post<{ cp: number | null; mate: number | null; pv: string[] }>(
      '/chess/engine/analyze',
      { fen, depth, timeMs },
    );
  } catch {
    return null;
  }
}

export async function getPuzzleHint(fen: string): Promise<PuzzleHint | null> {
  try {
    return await apiClient.post<PuzzleHint>(
      '/chess/engine/puzzle-hint',
      { fen },
    );
  } catch {
    return null;
  }
}

export interface OpeningClassification {
  opening: string;
  eco: string;
  family: string;
  moveIndex: number;
}

export async function classifyOpening(
  moves: string[],
): Promise<OpeningClassification | null> {
  try {
    return await apiClient.post<OpeningClassification>(
      '/chess/openings/classify',
      { moves },
    );
  } catch {
    return null;
  }
}
