import type { PieceColor } from './chess.constants';
import type {
  Board,
  CastlingRookFiles,
  ChessMove,
  ChessState,
} from './chess.types';
import { posToBoardCoords } from './chess.board';

export type CastlingSide = 'kingSide' | 'queenSide';

const STANDARD_ROOK_FILES: CastlingRookFiles = {
  white: { kingSide: 7, queenSide: 0 },
  black: { kingSide: 7, queenSide: 0 },
};

export const CASTLE_KING_TARGET: Record<CastlingSide, number> = {
  kingSide: 6,
  queenSide: 2,
};
export const CASTLE_ROOK_TARGET: Record<CastlingSide, number> = {
  kingSide: 5,
  queenSide: 3,
};

export function backRankRow(color: PieceColor): number {
  return color === 'white' ? 7 : 0;
}

export function rightsKey(
  color: PieceColor,
  side: CastlingSide,
): keyof ChessState['castlingRights'] {
  if (color === 'white') {
    return side === 'kingSide' ? 'whiteKingSide' : 'whiteQueenSide';
  }
  return side === 'kingSide' ? 'blackKingSide' : 'blackQueenSide';
}

/** Outermost own rook on the given side of the king on the back rank. */
function outermostRookFile(
  board: Board,
  color: PieceColor,
  side: CastlingSide,
): number | null {
  const row = backRankRow(color);
  const kingFile = board[row]?.findIndex(
    (p) => p?.type === 'king' && p.color === color,
  );
  if (kingFile === undefined || kingFile < 0) return null;
  if (side === 'kingSide') {
    for (let f = 7; f > kingFile; f--) {
      const p = board[row][f];
      if (p?.type === 'rook' && p.color === color) return f;
    }
  } else {
    for (let f = 0; f < kingFile; f++) {
      const p = board[row][f];
      if (p?.type === 'rook' && p.color === color) return f;
    }
  }
  return null;
}

/** Derives the original castling rook files from a starting board. */
export function deriveCastlingRookFiles(board: Board): CastlingRookFiles {
  const pick = (color: PieceColor, side: CastlingSide) =>
    outermostRookFile(board, color, side) ?? STANDARD_ROOK_FILES[color][side];
  return {
    white: {
      kingSide: pick('white', 'kingSide'),
      queenSide: pick('white', 'queenSide'),
    },
    black: {
      kingSide: pick('black', 'kingSide'),
      queenSide: pick('black', 'queenSide'),
    },
  };
}

/**
 * File of the rook that castles on `side`. Uses the recorded origin files
 * when present (Chess960 and new games), otherwise the standard a/h files,
 * or for legacy Chess960 sessions the outermost own rook on that side.
 */
export function getCastlingRookFile(
  state: Pick<ChessState, 'board' | 'variant'> & {
    castlingRookFiles?: CastlingRookFiles;
  },
  color: PieceColor,
  side: CastlingSide,
): number | null {
  if (state.castlingRookFiles) return state.castlingRookFiles[color][side];
  if (state.variant === 'chess960') {
    return outermostRookFile(state.board, color, side);
  }
  return STANDARD_ROOK_FILES[color][side];
}

/** Which side a castling move goes to, for either move encoding. */
export function castlingSideOf(
  move: Pick<ChessMove, 'from' | 'to'>,
): CastlingSide {
  return move.to.file > move.from.file ? 'kingSide' : 'queenSide';
}

/**
 * Applies a castling move to `board` in place. Supports both the standard
 * king-two-squares encoding and the Chess960 king-takes-own-rook encoding.
 */
export function applyCastleToBoard(
  board: Board,
  state: Pick<ChessState, 'variant'> & {
    castlingRookFiles?: CastlingRookFiles;
  },
  move: Pick<ChessMove, 'from' | 'to' | 'piece'>,
): void {
  const color = move.piece.color;
  const side = castlingSideOf(move);
  const { rank: row, file: kingFile } = posToBoardCoords(move.from);
  const toFile = posToBoardCoords(move.to).file;
  const toPiece = board[row][toFile];
  let rookFile: number | null;
  if (toPiece?.type === 'rook' && toPiece.color === color) {
    rookFile = toFile;
  } else {
    rookFile = getCastlingRookFile({ ...state, board }, color, side);
  }
  const king = board[row][kingFile];
  const rook = rookFile !== null ? board[row][rookFile] : null;
  board[row][kingFile] = null;
  if (rookFile !== null) board[row][rookFile] = null;
  board[row][CASTLE_KING_TARGET[side]] = king;
  if (rook) board[row][CASTLE_ROOK_TARGET[side]] = rook;
}

export function updateCastlingRights(state: ChessState, move: ChessMove): void {
  if (move.piece.type === 'king') {
    state.castlingRights[rightsKey(move.piece.color, 'kingSide')] = false;
    state.castlingRights[rightsKey(move.piece.color, 'queenSide')] = false;
    return;
  }

  const clearIfRookSquare = (color: PieceColor, row: number, file: number) => {
    if (row !== backRankRow(color)) return;
    for (const side of ['kingSide', 'queenSide'] as const) {
      if (getCastlingRookFile(state, color, side) === file) {
        state.castlingRights[rightsKey(color, side)] = false;
      }
    }
  };

  if (move.piece.type === 'rook') {
    const from = posToBoardCoords(move.from);
    clearIfRookSquare(move.piece.color, from.rank, from.file);
  }
  if (move.captured?.type === 'rook') {
    const to = posToBoardCoords(move.to);
    clearIfRookSquare(move.captured.color, to.rank, to.file);
  }
}
