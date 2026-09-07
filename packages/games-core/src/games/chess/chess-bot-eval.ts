import { PIECE_VALUES } from './chess.constants';
import type { PieceType } from './chess.constants';
import type { ChessState } from './chess.types';
import { oppositeColor } from './chess.board';

export const CHECKMATE = 100000;

export const MG_PST: Record<PieceType, number[][]> = {
  pawn: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  knight: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  bishop: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  rook: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  queen: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  king: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

export const EG_PST: Record<PieceType, number[][]> = {
  pawn: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [80, 80, 80, 80, 80, 80, 80, 80],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [30, 30, 30, 30, 30, 30, 30, 30],
    [20, 20, 20, 20, 20, 20, 20, 20],
    [10, 10, 10, 10, 10, 10, 10, 10],
    [5, 5, 5, 5, 5, 5, 5, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  knight: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  bishop: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  rook: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  queen: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  king: [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
  ],
};

const PHASE_VALUES: Record<PieceType, number> = {
  pawn: 0,
  knight: 1,
  bishop: 1,
  rook: 2,
  queen: 4,
  king: 0,
};

export interface EvalModifiers {
  attackWeight: number;
  safetyWeight: number;
  materialWeight: number;
}

const DEFAULT_MODIFIERS: EvalModifiers = {
  attackWeight: 1.0,
  safetyWeight: 1.0,
  materialWeight: 1.0,
};

export function evaluate(
  state: ChessState,
  modifiers?: EvalModifiers,
): number {
  const m = modifiers ?? DEFAULT_MODIFIERS;
  if (state.isCheckmate)
    return state.currentTurnColor === 'white' ? -CHECKMATE : CHECKMATE;
  if (
    state.isStalemate ||
    state.isDrawByRepetition ||
    state.isDrawByFiftyMoveRule ||
    state.isInsufficientMaterial
  )
    return 0;

  let mgScore = 0;
  let egScore = 0;
  let gamePhase = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = state.board[r][f];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] * 100 * m.materialWeight;
      const pstRow = piece.color === 'white' ? r : 7 - r;
      const mg = val + MG_PST[piece.type][pstRow][f];
      const eg = val + EG_PST[piece.type][pstRow][f];
      if (piece.color === 'white') {
        mgScore += mg;
        egScore += eg;
      } else {
        mgScore -= mg;
        egScore -= eg;
      }
      gamePhase += PHASE_VALUES[piece.type];
    }
  }

  gamePhase = Math.min(gamePhase, 24);
  let score = (mgScore * gamePhase + egScore * (24 - gamePhase)) / 24;
  score +=
    (evalKingSafety(state, 'white') - evalKingSafety(state, 'black')) *
    m.safetyWeight;
  score +=
    (evalPawnStructure(state, 'white') - evalPawnStructure(state, 'black')) *
    m.materialWeight;

  return state.currentTurnColor === 'white' ? score : -score;
}

function evalKingSafety(state: ChessState, color: 'white' | 'black'): number {
  let safety = 0;
  const kingRow = color === 'white' ? 7 : 0;
  const pawnRow = color === 'white' ? 6 : 1;

  for (let f = 0; f < 8; f++) {
    if (
      state.board[kingRow][f]?.type === 'king' &&
      state.board[kingRow][f]?.color === color
    ) {
      for (let df = -1; df <= 1; df++) {
        const pf = f + df;
        if (
          pf >= 0 &&
          pf < 8 &&
          state.board[pawnRow][pf]?.type === 'pawn' &&
          state.board[pawnRow][pf]?.color === color
        ) {
          safety += 15;
        }
      }
      for (let df = -1; df <= 1; df++) {
        const cf = f + df;
        if (cf < 0 || cf >= 8) continue;
        let openFile = true;
        for (let r = 0; r < 8; r++) {
          if (state.board[r][cf]?.type === 'pawn') {
            openFile = false;
            break;
          }
        }
        if (openFile) safety -= 20;
      }
      const oppColor = oppositeColor(color);
      for (let dr = -1; dr <= 1; dr++) {
        for (let df = -1; df <= 1; df++) {
          const ar = kingRow + dr;
          const af = f + df;
          if (ar < 0 || ar > 7 || af < 0 || af > 7) continue;
          const att = state.board[ar][af];
          if (
            att &&
            att.color === oppColor &&
            att.type !== 'pawn' &&
            att.type !== 'king'
          ) {
            safety -= 10;
          }
        }
      }
      break;
    }
  }
  return safety;
}

function evalPawnStructure(
  state: ChessState,
  color: 'white' | 'black',
): number {
  let score = 0;
  const fileCounts = new Array(8).fill(0);
  const pawns: number[] = [];

  for (let f = 0; f < 8; f++) {
    for (let r = 0; r < 8; r++) {
      if (
        state.board[r][f]?.type === 'pawn' &&
        state.board[r][f]?.color === color
      ) {
        pawns.push(f);
        fileCounts[f]++;
        break;
      }
    }
  }

  for (const f of pawns) {
    if (fileCounts[f] > 1) score -= 15;
    let hasNeighbor = false;
    for (let df = -1; df <= 1; df++) {
      if (df === 0) continue;
      const nf = f + df;
      if (nf >= 0 && nf < 8 && fileCounts[nf] > 0) {
        hasNeighbor = true;
        break;
      }
    }
    if (!hasNeighbor) score -= 12;
  }

  return score;
}
