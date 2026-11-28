import { ChessEngine } from '../../engines/chess/chess.engine';
import type { ChessState, MovePayload } from '../../engines/chess/chess.types';
import type { PieceType } from '../../engines/chess/chess.constants';
import { restoreFromFen } from '@arcadeum/games-core/games/chess/chess-engine-rules';
import { toFen } from '@arcadeum/games-core/games/chess/chess-fen';

const engine = new ChessEngine();
const UCI_RE = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
const PROMOTION: Record<string, PieceType> = {
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
};

function stateFromFen(fen: string): ChessState | null {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 2 || parts[0].split('/').length !== 8) return null;
  const state = engine.initializeState(['w', 'b']);
  restoreFromFen(state, fen);
  state.positionHistory = [toFen(state)];
  return state;
}

function toPayload(uci: string): MovePayload | null {
  if (!UCI_RE.test(uci)) return null;
  return {
    fromFile: uci[0] as MovePayload['fromFile'],
    fromRank: Number(uci[1]) as MovePayload['fromRank'],
    toFile: uci[2] as MovePayload['toFile'],
    toRank: Number(uci[3]) as MovePayload['toRank'],
    promotion: uci[4] ? PROMOTION[uci[4]] : undefined,
  };
}

/** Plays a UCI move; returns the new state or null when illegal. */
function play(state: ChessState, uci: string): ChessState | null {
  const payload = toPayload(uci);
  if (!payload) return null;
  const userId = state.currentTurnColor === 'white' ? 'w' : 'b';
  const res = engine.executeAction(
    state,
    'move',
    { userId, roomId: 'puzzle', sessionId: 'puzzle', timestamp: new Date() },
    payload,
  );
  return res.success && res.state ? res.state : null;
}

const norm = (m: string) => m.trim().toLowerCase();

/** Same move, tolerating a missing promotion letter (auto-queen). */
function sameMove(a: string, b: string): boolean {
  return a === b || (a.length === 4 && b.startsWith(a) && b[4] === 'q');
}

/** True when every move of the line is legal from the FEN. */
export function isLegalPuzzleLine(fen: string, moves: string[]): boolean {
  let state = stateFromFen(fen);
  if (!state || moves.length === 0) return false;
  for (const m of moves) {
    state = play(state, norm(m));
    if (!state) return false;
  }
  return true;
}

/**
 * Server-side puzzle check. The solver's moves are the player's moves only
 * (what the web sends) or the full line including opponent replies. Each
 * player move must match the solution, except that any legal move that
 * delivers checkmate is accepted as an alternative solution (a puzzle never
 * has a "wrong" mate).
 */
export function isPuzzleSolved(
  fen: string,
  solution: string[],
  submitted: string[],
): boolean {
  const expected = solution.map(norm);
  const given = submitted.map(norm);
  const playerMoveCount = Math.ceil(expected.length / 2);
  let playerMoves: string[];
  if (given.length === expected.length && expected.length > 1) {
    playerMoves = given.filter((_, i) => i % 2 === 0);
  } else if (given.length === playerMoveCount) {
    playerMoves = given;
  } else if (given.length > 0 && given.length < playerMoveCount) {
    // Only an early mate can end the line before the last player move.
    playerMoves = given;
  } else {
    return false;
  }

  let state = stateFromFen(fen);
  if (!state) return false;
  for (let k = 0; k < playerMoves.length; k++) {
    const want = expected[2 * k];
    const got = playerMoves[k];
    if (!want) return false;
    if (sameMove(got, want)) {
      state = play(state, want);
      if (!state) return false;
      const reply = expected[2 * k + 1];
      if (reply) {
        state = play(state, reply);
        if (!state) return false;
      }
      continue;
    }
    const alt = play(state, got);
    return !!alt?.isCheckmate;
  }
  return playerMoves.length === playerMoveCount;
}
