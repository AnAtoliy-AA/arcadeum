import type { ChessEndReason, ChessState, File, Rank } from './chess.types';
import type { PieceColor } from './chess.constants';
import { parseFen, findKing } from './chess.board';
import { isInCheck } from './chess.attacks';
import { getLegalMoves } from './chess.move-generator';
import { getCastlingRookFile } from './chess.castling';

/** Variants where FIDE dead-position (insufficient material) draws apply. */
export function insufficientMaterialApplies(state: ChessState): boolean {
  return (
    state.variant === 'standard' ||
    state.variant === 'chess960' ||
    !state.variant
  );
}

export function isChessDraw(state: ChessState): boolean {
  return (
    state.isStalemate ||
    state.isDrawByRepetition ||
    state.isDrawByFiftyMoveRule ||
    state.isInsufficientMaterial ||
    state.isDrawByAgreement ||
    state.isDrawByTimeout === true
  );
}

export function isChessGameOver(state: ChessState): boolean {
  return (
    state.isCheckmate ||
    state.winnerColor !== null ||
    state.isAborted === true ||
    isChessDraw(state)
  );
}

/** Abort is allowed until both sides have made their first move. */
export function canAbort(state: ChessState): boolean {
  return !isChessGameOver(state) && state.moveHistory.length < 2;
}

export function setEndReason(state: ChessState, reason: ChessEndReason): void {
  if (!state.endReason) state.endReason = reason;
}

export function toLegalMoveList(state: ChessState) {
  return getLegalMoves(state, state.currentTurnColor).map((m) => ({
    from: m.from,
    to: m.to,
    promotion: m.promotion,
  }));
}

/**
 * Restores every FEN-encoded field (board, side to move, castling rights,
 * en passant, move counters) from a stored position. Castling rights are
 * intersected with the rook-on-origin check so a stale FEN can never grant
 * an impossible castle.
 */
export function restoreFromFen(state: ChessState, fen: string): void {
  const [, turn, castling = '-', ep = '-', half = '0', full = '1'] = fen
    .trim()
    .split(/\s+/);
  state.board = parseFen(fen);
  if (turn === 'w' || turn === 'b') {
    state.currentTurnColor = turn === 'w' ? 'white' : 'black';
  }
  const rights = {
    whiteKingSide: castling.includes('K'),
    whiteQueenSide: castling.includes('Q'),
    blackKingSide: castling.includes('k'),
    blackQueenSide: castling.includes('q'),
  };
  const rookHome = (color: PieceColor, side: 'kingSide' | 'queenSide') => {
    const file = getCastlingRookFile(state, color, side);
    const row = color === 'white' ? 7 : 0;
    const p = file === null ? null : state.board[row][file];
    return (
      p?.type === 'rook' &&
      p.color === color &&
      findKing(state.board, color) !== null
    );
  };
  state.castlingRights = {
    whiteKingSide: rights.whiteKingSide && rookHome('white', 'kingSide'),
    whiteQueenSide: rights.whiteQueenSide && rookHome('white', 'queenSide'),
    blackKingSide: rights.blackKingSide && rookHome('black', 'kingSide'),
    blackQueenSide: rights.blackQueenSide && rookHome('black', 'queenSide'),
  };
  state.enPassantTarget =
    ep !== '-' && /^[a-h][36]$/.test(ep)
      ? {
          // Regex above guarantees a valid file letter and rank 3 or 6.
          file: ep[0] as File,
          rank: Number(ep[1]) as Rank,
        }
      : null;
  state.halfMoveClock = Number(half) || 0;
  state.fullMoveNumber = Number(full) || 1;
  state.isCheck = isInCheck(state.board, state.currentTurnColor);
}

/**
 * Recomputes variant counters (three-check checks, crazyhouse pockets) from
 * the move list so they stay consistent after a takeback.
 */
export function recomputeVariantCounters(state: ChessState): void {
  if (state.variant === 'three_check') {
    const counts = { white: 0, black: 0 };
    state.moveHistory.forEach((m) => {
      if (/[+#]$/.test(m.notation)) {
        counts[m.piece.color === 'white' ? 'black' : 'white']++;
      }
    });
    state.checkCount = counts;
  }
  if (state.variant === 'crazyhouse') {
    const pockets: NonNullable<ChessState['capturedPieces']> = {
      white: [],
      black: [],
    };
    state.moveHistory.forEach((m) => {
      if (m.captured) pockets[m.piece.color].push(m.captured.type);
    });
    state.capturedPieces = pockets;
  }
}
