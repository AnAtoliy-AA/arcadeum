/** Moved to @arcadeum/games-core (ARC-900 offline mode). Re-export shim. */
export {
  FILES,
  RANKS,
  PIECE_TYPES,
  PIECE_COLORS,
  PIECE_VALUES,
  PIECE_SYMBOLS,
  CHESS_VARIANTS,
  INITIAL_BOARD_FEN,
  INITIAL_CASTLING_RIGHTS,
  CHESS_PHASE,
  CASTLING_KING_DESTINATION,
  CASTLING_ROOK_ORIGIN,
  PROMOTION_PIECES,
} from '@arcadeum/games-core/games/chess/chess.constants';
export type {
  File,
  Rank,
  PieceType,
  PieceColor,
  ChessVariant,
} from '@arcadeum/games-core/games/chess/chess.constants';
