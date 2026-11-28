import { ChessEngine } from './chess.engine';
import type { ChessState, MovePayload } from './chess.types';
import { getLegalMoves } from './chess.move-generator';
import { restoreFromFen } from '@arcadeum/games-core/games/chess/chess-engine-rules';

/**
 * Perft node counts from https://www.chessprogramming.org/Perft_Results.
 * They exercise castling, en passant (incl. pinned captures), promotions
 * and checks through the real engine move pipeline.
 */
const engine = new ChessEngine();
const ctxFor = (state: ChessState) => ({
  userId: state.currentTurnColor === 'white' ? 'w' : 'b',
  roomId: 'r',
  sessionId: 's',
  timestamp: new Date(),
});

function fromFen(fen: string): ChessState {
  const state = engine.initializeState(['w', 'b']);
  restoreFromFen(state, fen);
  state.positionHistory = [fen];
  return state;
}

function perft(state: ChessState, depth: number): number {
  const moves = getLegalMoves(state, state.currentTurnColor);
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const m of moves) {
    const payload: MovePayload = {
      fromFile: m.from.file,
      fromRank: m.from.rank,
      toFile: m.to.file,
      toRank: m.to.rank,
      promotion: m.promotion ?? undefined,
    };
    const res = engine.executeAction(state, 'move', ctxFor(state), payload);
    if (!res.success || !res.state) throw new Error('perft move failed');
    nodes += perft(res.state, depth - 1);
  }
  return nodes;
}

describe('Chess perft', () => {
  it.each([
    [
      'start',
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      3,
      8902,
    ],
    [
      'kiwipete',
      'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
      3,
      97862,
    ],
    ['position 3', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', 4, 43238],
    [
      'position 4',
      'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
      3,
      9467,
    ],
    [
      'position 5',
      'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
      3,
      62379,
    ],
  ])('%s: %s at depth %i', (_name, fen, depth, expected) => {
    expect(perft(fromFen(fen), depth)).toBe(expected);
  });

  it('Chess960 castling position at depth 3', () => {
    // bqnb1rkr/pp3ppp/3ppn2/2p5/5P2/P2P4/NPP1P1PP/BQ1BNRKR w HFhf - 2 9
    const state = engine.initializeState(['w', 'b'], { variant: 'chess960' });
    restoreFromFen(
      state,
      'bqnb1rkr/pp3ppp/3ppn2/2p5/5P2/P2P4/NPP1P1PP/BQ1BNRKR w - - 2 9',
    );
    state.castlingRookFiles = {
      white: { kingSide: 7, queenSide: 5 },
      black: { kingSide: 7, queenSide: 5 },
    };
    state.castlingRights = {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    };
    expect(perft(state, 1)).toBe(21);
    expect(perft(state, 2)).toBe(528);
    expect(perft(state, 3)).toBe(12189);
  });
});
