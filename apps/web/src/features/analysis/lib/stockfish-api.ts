import { resolveApiUrl } from '@/shared/lib/api-base';

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

export async function analyzeGameWithStockfish(
  positionHistory: string[],
  notations?: string[],
): Promise<GameAnalysisResult | null> {
  try {
    const url = resolveApiUrl('/chess/engine/analyze-game');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionHistory, notations, depth: 12, timeMsPerPly: 1500 }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return data as GameAnalysisResult;
  } catch {
    return null;
  }
}
