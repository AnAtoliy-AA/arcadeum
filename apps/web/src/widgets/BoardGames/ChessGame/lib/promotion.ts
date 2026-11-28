import { FILES, type BoardPosition, type ChessClientState } from '../types';

type PromotionSnapshot = Pick<
  ChessClientState,
  'board' | 'legalMovesForCurrentPlayer'
>;

const same = (a: BoardPosition, b: BoardPosition) =>
  a.file === b.file && a.rank === b.rank;

/**
 * True when moving from -> to promotes a pawn. Uses the server's legal move
 * list when available (covers capture-promotions and variants) and falls
 * back to "pawn reaches the last rank" otherwise.
 */
export function isPromotionMove(
  snapshot: PromotionSnapshot,
  from: BoardPosition,
  to: BoardPosition,
): boolean {
  const legal = snapshot.legalMovesForCurrentPlayer ?? [];
  const matches = legal.filter((m) => same(m.from, from) && same(m.to, to));
  if (matches.length > 0) return matches.some((m) => m.promotion !== null);
  const piece = snapshot.board[8 - from.rank]?.[FILES.indexOf(from.file)];
  if (piece?.type !== 'pawn') return false;
  return to.rank === (piece.color === 'white' ? 8 : 1);
}
