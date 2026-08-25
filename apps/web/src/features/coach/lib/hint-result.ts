import {
  FILES,
  PIECE_COLORS,
  PIECE_TYPES,
  RANKS,
  type BoardPosition,
  type ChessPiece,
  type File,
  type PieceColor,
  type PieceType,
  type Rank,
} from '@/widgets/BoardGames/ChessGame/types';
import type { ChessHint } from '@/features/coach/lib/hint-generator';

/**
 * Wire format of a hint move emitted by the backend in
 * `games.session.hint_result` (see apps/be games.gateway.hint.ts). Values are
 * unknown-typed because they arrive over the socket and must be validated
 * before they can be trusted as strict client types.
 */
export interface ServerHintMove {
  from?: { file?: unknown; rank?: unknown } | null;
  to?: { file?: unknown; rank?: unknown } | null;
  piece?: { type?: unknown; color?: unknown } | null;
  captured?: { type?: unknown; color?: unknown } | null;
  promotion?: unknown;
  isCastle?: unknown;
}

export interface ServerHintResult {
  ok?: boolean;
  move?: ServerHintMove | null;
}

function isFile(value: unknown): value is File {
  return (
    typeof value === 'string' && (FILES as readonly string[]).includes(value)
  );
}

function isRank(value: unknown): value is Rank {
  return (
    typeof value === 'number' && (RANKS as readonly number[]).includes(value)
  );
}

function isPieceType(value: unknown): value is PieceType {
  return (
    typeof value === 'string' &&
    (PIECE_TYPES as readonly string[]).includes(value)
  );
}

function isPieceColor(value: unknown): value is PieceColor {
  return (
    typeof value === 'string' &&
    (PIECE_COLORS as readonly string[]).includes(value)
  );
}

function parsePosition(pos: ServerHintMove['from']): BoardPosition | null {
  if (!pos || !isFile(pos.file) || !isRank(pos.rank)) return null;
  return { file: pos.file, rank: pos.rank };
}

function parsePiece(piece: ServerHintMove['piece']): ChessPiece | null {
  if (!piece || !isPieceType(piece.type) || !isPieceColor(piece.color)) {
    return null;
  }
  return { type: piece.type, color: piece.color };
}

/**
 * Maps a server-side hint move into the internal `ChessHint` shape used by
 * CoachControls/ChessBoardPanel. Returns null when the payload is malformed —
 * callers then fall back to the local hint computation.
 *
 * `score` defaults to 0: the server does not send an evaluation and the UI
 * doesn't display one.
 */
export function mapServerHint(
  move: ServerHintMove | null | undefined,
): ChessHint | null {
  const from = parsePosition(move?.from);
  const to = parsePosition(move?.to);
  const piece = parsePiece(move?.piece);
  if (!from || !to || !piece) return null;

  const captured = parsePiece(move?.captured);
  const rawPromotion = move?.promotion;
  const promotion = isPieceType(rawPromotion) ? rawPromotion : null;

  const fromCol = FILES.indexOf(from.file);
  const toCol = FILES.indexOf(to.file);
  const isCastle =
    piece.type === 'king' && Math.abs(toCol - fromCol) === 2
      ? toCol === 6
        ? 'king'
        : 'queen'
      : null;

  return { from, to, piece, captured, promotion, isCastle, score: 0 };
}
