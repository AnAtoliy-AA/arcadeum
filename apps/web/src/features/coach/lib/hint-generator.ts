import {
  FILES,
  type Board,
  type BoardPosition,
  type LegalMove,
  type ChessPiece,
  type PieceColor,
  type PieceType,
} from '@/widgets/BoardGames/ChessGame/types';
import { evaluateBoard } from '@/features/analysis/lib/position-evaluator';

/**
 * Coach-mode chess hint generator (client-side).
 *
 * Reuses the static position evaluator from the post-game analysis feature
 * (ARC-882) so hints run instantly in the browser with no round-trip. For
 * each legal move we apply it to a copy of the board and evaluate the
 * resulting position, then pick the move that scores best from the mover's
 * perspective (a shallow 1-ply lookahead — fast and good enough for casual
 * coaching). Ranked matches disable hints upstream, so no server involvement
 * is needed here.
 */

export interface ChessHint {
  from: BoardPosition;
  to: BoardPosition;
  /** The piece being moved. */
  piece: ChessPiece;
  /** Captured piece, if any (includes en-passant captures). */
  captured: ChessPiece | null;
  /** Promotion piece type, when the move promotes a pawn. */
  promotion: PieceType | null;
  /** Castle side when the move is a castle, otherwise null. */
  isCastle: 'king' | 'queen' | null;
  /** Resulting evaluation from the mover's perspective, in centipawns. */
  score: number;
}

interface AppliedMove {
  board: Board;
  captured: ChessPiece | null;
}

/**
 * Applies a legal move to a copy of the board, handling captures, castling,
 * en passant and promotion. Returns null when no piece occupies the `from`
 * square.
 */
export function applyMove(
  board: Board,
  from: BoardPosition,
  to: BoardPosition,
  promotion: PieceType | null,
  enPassantTarget: BoardPosition | null,
): AppliedMove | null {
  const fromRow = 8 - from.rank;
  const fromCol = FILES.indexOf(from.file);
  const toRow = 8 - to.rank;
  const toCol = FILES.indexOf(to.file);
  const piece = board[fromRow]?.[fromCol];
  if (!piece) return null;

  const next: Board = board.map((row) => [...row]);
  const isCastle = piece.type === 'king' && Math.abs(toCol - fromCol) === 2;
  const isEnPassant =
    piece.type === 'pawn' &&
    fromCol !== toCol &&
    enPassantTarget !== null &&
    to.file === enPassantTarget.file &&
    to.rank === enPassantTarget.rank;

  let captured: ChessPiece | null = null;
  if (isEnPassant) {
    captured = next[fromRow]?.[toCol] ?? null;
    next[fromRow][toCol] = null;
  } else {
    captured = next[toRow]?.[toCol] ?? null;
  }

  next[toRow][toCol] = promotion
    ? { type: promotion, color: piece.color }
    : piece;
  next[fromRow][fromCol] = null;

  if (isCastle) {
    if (toCol === 6) {
      let rookCol = -1;
      for (let c = toCol + 1; c < 8; c++) {
        if (next[toRow][c]?.type === 'rook') {
          rookCol = c;
          break;
        }
      }
      if (rookCol >= 0) {
        next[toRow][5] = next[toRow][rookCol];
        next[toRow][rookCol] = null;
      }
    } else if (toCol === 2) {
      let rookCol = -1;
      for (let c = toCol - 1; c >= 0; c--) {
        if (next[toRow][c]?.type === 'rook') {
          rookCol = c;
          break;
        }
      }
      if (rookCol >= 0) {
        next[toRow][3] = next[toRow][rookCol];
        next[toRow][rookCol] = null;
      }
    }
  }

  return { board: next, captured };
}

/**
 * Returns the best legal move for `playerColor` in the given position, or
 * null when there are no legal moves (checkmate/stalemate).
 */
export function getChessHint(
  board: Board,
  legalMoves: LegalMove[],
  enPassantTarget: BoardPosition | null,
  playerColor: PieceColor,
): ChessHint | null {
  if (legalMoves.length === 0) return null;

  let best: ChessHint | null = null;
  for (const move of legalMoves) {
    const fromRow = 8 - move.from.rank;
    const fromCol = FILES.indexOf(move.from.file);
    const piece = board[fromRow]?.[fromCol];
    if (!piece) continue;

    const applied = applyMove(
      board,
      move.from,
      move.to,
      move.promotion,
      enPassantTarget,
    );
    if (!applied) continue;

    const evalAfter = evaluateBoard(applied.board);
    const score = playerColor === 'white' ? evalAfter : -evalAfter;
    const toCol = FILES.indexOf(move.to.file);
    const isCastle =
      piece.type === 'king' && Math.abs(toCol - fromCol) === 2
        ? toCol === 6
          ? 'king'
          : 'queen'
        : null;

    if (!best || score > best.score) {
      best = {
        from: move.from,
        to: move.to,
        piece,
        captured: applied.captured,
        promotion: move.promotion,
        isCastle,
        score,
      };
    }
  }

  return best;
}
