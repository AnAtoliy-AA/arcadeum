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
}

/**
 * Send board-only FENs to backend — server reconstructs full FENs.
 */
export async function analyzeGameWithStockfish(
  positionHistory: string[],
  notations?: string[],
): Promise<GameAnalysisResult | null> {
  try {
    return await apiClient.post<GameAnalysisResult>(
      '/chess/engine/analyze-game',
      { positionHistory, notations, depth: 12, timeMsPerPly: 1500 },
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
