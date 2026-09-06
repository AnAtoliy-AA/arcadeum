import type {
  EngineEval,
  EngineLine,
  GameAnalysisResult,
  AnalyzeGameRequest,
  PuzzleHint,
} from './chess-stockfish.types';

interface EngineInstance {
  process: { stdin?: { write(data: string): void } | null };
  busy: boolean;
  pending: {
    id: string;
    resolve: (eval_: EngineEval) => void;
    reject: (err: Error) => void;
    deadline: number;
    lines: EngineEval[];
  } | null;
  ready: boolean;
  buffer: string;
  gamesServed: number;
}

const MAX_TIME_MS = 30000;

/**
 * Analyze a position with multi-PV, returning all alternative lines.
 * Extracted from ChessStockfishService to keep file under 500 lines.
 */
export async function analyzePositionMultiPV(
  findFreeInstance: () => EngineInstance | null,
  fen: string,
  depth: number,
  timeMs: number,
  pvCount: number,
): Promise<EngineEval & { alternatives: Array<{ move: string; cp: number | null; mate: number | null; pv: string[] }> }> {
  const instance = findFreeInstance();
  if (!instance) {
    return { cp: 0, mate: null, pv: [], depth: 0, selDepth: 0, nodes: 0, nps: 0, timeMs: 0, alternatives: [] };
  }

  const lines: EngineEval[] = [];
  const deadline = Date.now() + Math.min(timeMs + 10000, MAX_TIME_MS + 10000);

  await new Promise<EngineEval>((resolve, reject) => {
    instance.busy = true;
    instance.pending = {
      id: `req-${Date.now()}`,
      resolve,
      reject,
      deadline,
      lines,
    };

    instance.process.stdin?.write('setoption name MultiPV value ' + pvCount + '\n');
    instance.process.stdin?.write(`position fen ${fen}\n`);
    instance.process.stdin?.write(`go depth ${depth} movetime ${timeMs}\n`);
  });

  instance.process.stdin?.write('setoption name MultiPV value 3\n');

  const lastLine = lines[lines.length - 1] ?? { cp: 0, mate: null, pv: [], depth: 0, selDepth: 0, nodes: 0, nps: 0, timeMs: 0 };

  const byDepth = new Map<number, EngineEval[]>();
  for (const l of lines) {
    const d = l.depth;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(l);
  }

  const maxDepth = Math.max(...Array.from(byDepth.keys()), 0);
  const topLines = byDepth.get(maxDepth) ?? [];

  const alternatives = topLines.slice(1).map((l) => ({
    move: l.pv[0] ?? '',
    cp: l.cp,
    mate: l.mate,
    pv: l.pv,
  }));

  return { ...lastLine, alternatives };
}

/**
 * Get a puzzle hint: best move + alternatives for the position.
 */
export async function getPuzzleHint(
  findFreeInstance: () => EngineInstance | null,
  isReady: () => boolean,
  fen: string,
): Promise<PuzzleHint | null> {
  if (!isReady()) return null;

  const result = await analyzePositionMultiPV(findFreeInstance, fen, 18, 3000, 3);
  return {
    bestMove: result.pv[0] ?? '',
    eval: {
      cp: result.cp,
      mate: result.mate,
      pv: result.pv,
      depth: result.depth,
      selDepth: result.selDepth,
      nodes: result.nodes,
      nps: result.nps,
      timeMs: result.timeMs,
    },
    pv: result.pv,
    alternatives: result.alternatives,
  };
}

export function classifyMove(
  loss: number,
  _evalBefore: number,
  evalAfter: number,
): EngineLine['quality'] {
  if (loss === 0 && Math.abs(evalAfter) > 200) return 'brilliant';
  if (loss <= 2 && Math.abs(evalAfter) > 100) return 'great';
  if (loss <= 10) return 'good';
  if (loss <= 30) return 'inaccuracy';
  if (loss <= 100) return 'mistake';
  return 'blunder';
}

export function calculateAccuracy(moves: EngineLine[]): number {
  if (moves.length === 0) return 100;
  let totalScore = 0;
  for (const move of moves) {
    switch (move.quality) {
      case 'brilliant':
      case 'great':
      case 'good':
        totalScore += 100;
        break;
      case 'inaccuracy':
        totalScore += 70;
        break;
      case 'mistake':
        totalScore += 40;
        break;
      case 'blunder':
        totalScore += 0;
        break;
    }
  }
  return Math.round(totalScore / moves.length);
}

/**
 * Analyze a full game from position history.
 * Extracted from ChessStockfishService to keep file under 500 lines.
 */
export async function analyzeGame(
  request: AnalyzeGameRequest,
  analyzePosition: (req: { fen: string; depth: number; timeMs: number }) => Promise<EngineEval>,
  analyzePositionMultiPV: (fen: string, depth: number, timeMs: number, pvCount: number) => Promise<EngineEval & { alternatives: Array<{ move: string; cp: number | null; mate: number | null; pv: string[] }> }>,
  probeTablebase: (fen: string) => Promise<{ category: string; dtz: number | null; dtm: number | null } | null>,
  depth: number,
  timeMsPerPly: number,
): Promise<GameAnalysisResult> {
  const fullFens = request.positionHistory;

  const evals: (number | null)[] = [];
  const moves: EngineLine[] = [];
  let prevEval = 0;
  let whiteEngineMatchCount = 0;
  let blackEngineMatchCount = 0;
  let whiteTotalMoves = 0;
  let blackTotalMoves = 0;

  for (let i = 0; i < fullFens.length - 1; i++) {
    const fen = fullFens[i];
    if (!fen) continue;

    const multiPVResult = await analyzePositionMultiPV(fen, depth, timeMsPerPly, 3);

    const currentEval =
      multiPVResult.mate !== null
        ? multiPVResult.mate > 0
          ? 10000
          : -10000
        : (multiPVResult.cp ?? 0);

    evals.push(currentEval);

    const moveNotation = request.notations?.[i] ?? '';
    const delta = currentEval - prevEval;
    const color = i % 2 === 0 ? 'white' : 'black';
    const moverDelta = color === 'white' ? delta : -delta;
    const loss = Math.max(0, -moverDelta);

    const bestMove = multiPVResult.pv[0] ?? '';
    const playedMove = moveNotation;
    const isEngineMove = bestMove && playedMove && bestMove === playedMove;

    if (color === 'white') {
      whiteTotalMoves++;
      if (isEngineMove) whiteEngineMatchCount++;
    } else {
      blackTotalMoves++;
      if (isEngineMove) blackEngineMatchCount++;
    }

    moves.push({
      quality: classifyMove(loss, prevEval, currentEval),
      move: moveNotation,
      evalAfter: currentEval,
      mateAfter: multiPVResult.mate,
      loss,
      bestMove,
      bestPv: multiPVResult.pv,
      alternatives: multiPVResult.alternatives,
    });

    prevEval = currentEval;
  }

  const lastFen = fullFens[fullFens.length - 1];
  if (lastFen) {
    const finalEval = await analyzePosition({ fen: lastFen, depth, timeMs: timeMsPerPly });
    evals.push(
      finalEval.mate !== null
        ? finalEval.mate > 0
          ? 10000
          : -10000
        : (finalEval.cp ?? 0),
    );
  }

  let tablebaseResult: GameAnalysisResult['tablebase'] = null;
  if (lastFen) {
    tablebaseResult = await probeTablebase(lastFen);
  }

  const whiteMoves = moves.filter((_, i) => i % 2 === 0);
  const blackMoves = moves.filter((_, i) => i % 2 === 1);

  return {
    evals,
    moves,
    whiteAccuracy: calculateAccuracy(whiteMoves),
    blackAccuracy: calculateAccuracy(blackMoves),
    summary: {
      brilliant: moves.filter((m) => m.quality === 'brilliant').length,
      great: moves.filter((m) => m.quality === 'great').length,
      good: moves.filter((m) => m.quality === 'good').length,
      inaccuracy: moves.filter((m) => m.quality === 'inaccuracy').length,
      mistake: moves.filter((m) => m.quality === 'mistake').length,
      blunder: moves.filter((m) => m.quality === 'blunder').length,
    },
    tablebase: tablebaseResult,
    antiCheat: {
      whiteEngineMatchCount,
      blackEngineMatchCount,
      whiteTotalMoves,
      blackTotalMoves,
    },
  };
}
