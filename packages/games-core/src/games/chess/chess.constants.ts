export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export type File = (typeof FILES)[number];

export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Rank = (typeof RANKS)[number];

export const PIECE_TYPES = [
  'pawn',
  'knight',
  'bishop',
  'rook',
  'queen',
  'king',
] as const;
export type PieceType = (typeof PIECE_TYPES)[number];

export const PIECE_COLORS = ['white', 'black'] as const;
export type PieceColor = (typeof PIECE_COLORS)[number];

export const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0,
};

export const PIECE_SYMBOLS: Record<PieceType, Record<PieceColor, string>> = {
  pawn: { white: '♙', black: '♟' },
  knight: { white: '♘', black: '♞' },
  bishop: { white: '♗', black: '♝' },
  rook: { white: '♖', black: '♜' },
  queen: { white: '♕', black: '♛' },
  king: { white: '♔', black: '♚' },
};

export const CHESS_VARIANTS = [
  'standard',
  'chess960',
  'king_of_the_hill',
  'three_check',
  'crazyhouse',
  'atomic',
] as const;
export type ChessVariant = (typeof CHESS_VARIANTS)[number];

export const INITIAL_BOARD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

export const INITIAL_CASTLING_RIGHTS = {
  whiteKingSide: true,
  whiteQueenSide: true,
  blackKingSide: true,
  blackQueenSide: true,
};

export const CHESS_PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
} as const;

export const CASTLING_KING_DESTINATION: Record<
  PieceColor,
  Record<'kingSide' | 'queenSide', number>
> = {
  white: { kingSide: 6, queenSide: 2 },
  black: { kingSide: 6, queenSide: 2 },
};

export const CASTLING_ROOK_ORIGIN: Record<
  PieceColor,
  Record<'kingSide' | 'queenSide', number>
> = {
  white: { kingSide: 7, queenSide: 0 },
  black: { kingSide: 7, queenSide: 0 },
};

export const PROMOTION_PIECES: PieceType[] = [
  'queen',
  'rook',
  'bishop',
  'knight',
];
