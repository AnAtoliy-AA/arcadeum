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
 * Generate full FENs from a sequence of board-only FENs by replaying moves.
 * The session positionHistory only stores board parts; Stockfish needs full FENs.
 */
function buildFullFenHistory(
  boardFens: string[],
  notations?: string[],
): string[] {
  // For now, append standard FEN suffixes based on move count.
  // White moves on even indices, black on odd.
  // This is approximate — a proper solution would replay moves from the engine state.
  return boardFens.map((fen, i) => {
    if (fen.includes(' ')) return fen; // Already full FEN
    const turn = i % 2 === 0 ? 'b' : 'w'; // After white's move, it's black's turn
    return `${fen} ${turn} KQkq - 0 ${Math.floor(i / 2) + 1}`;
  });
}

export async function analyzeGameWithStockfish(
  positionHistory: string[],
  notations?: string[],
): Promise<GameAnalysisResult | null> {
  try {
    const fullFens = buildFullFenHistory(positionHistory, notations);
    return await apiClient.post<GameAnalysisResult>(
      '/chess/engine/analyze-game',
      { positionHistory: fullFens, notations, depth: 12, timeMsPerPly: 1500 },
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
