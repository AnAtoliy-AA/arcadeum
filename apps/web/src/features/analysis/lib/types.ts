export const PIECE_COLORS = ['white', 'black'] as const;
export type PieceColor = (typeof PIECE_COLORS)[number];

export const PIECE_TYPES = [
  'pawn',
  'knight',
  'bishop',
  'rook',
  'queen',
  'king',
] as const;
export type PieceType = (typeof PIECE_TYPES)[number];

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

/** 8x8 board; board[row][col], row 0 = rank 8, col 0 = file `a`. */
export type Board = (Piece | null)[][];
