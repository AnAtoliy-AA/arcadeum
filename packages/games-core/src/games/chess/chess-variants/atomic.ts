import type { ChessState, BoardPosition } from '../chess.types';
import type { PieceColor } from '../chess.constants';

const EXPLOSION_RADIUS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function getExplosionAffectedSquares(
  pos: BoardPosition,
): BoardPosition[] {
  const row = 8 - pos.rank;
  const col = pos.file.charCodeAt(0) - 97;
  const affected: BoardPosition[] = [];

  for (const [dr, dc] of EXPLOSION_RADIUS) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      affected.push({
        file: String.fromCharCode(97 + c) as BoardPosition['file'],
        rank: (8 - r) as BoardPosition['rank'],
      });
    }
  }
  return affected;
}

export function applyExplosion(
  state: ChessState,
  captureSquare: BoardPosition,
): ChessState {
  const newBoard = state.board.map((row) => row.map((p) => (p ? { ...p } : null)));
  const affected = getExplosionAffectedSquares(captureSquare);

  for (const square of affected) {
    const row = 8 - square.rank;
    const col = square.file.charCodeAt(0) - 97;
    const piece = newBoard[row][col];
    if (piece && piece.type !== 'king') {
      newBoard[row][col] = null;
    }
  }

  const captureRow = 8 - captureSquare.rank;
  const captureCol = captureSquare.file.charCodeAt(0) - 97;
  newBoard[captureRow][captureCol] = null;

  return { ...state, board: newBoard };
}

export function isKingCaptured(
  state: ChessState,
  color: PieceColor,
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (piece?.type === 'king' && piece.color === color) {
        return false;
      }
    }
  }
  return true;
}
