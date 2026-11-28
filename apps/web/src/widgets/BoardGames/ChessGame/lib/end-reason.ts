import type { ChessClientState } from '../types';

export const CHESS_END_REASONS = [
  'checkmate',
  'stalemate',
  'resignation',
  'timeout',
  'timeout_vs_insufficient',
  'repetition',
  'fifty_move',
  'insufficient_material',
  'agreement',
  'aborted',
  'variant_win',
] as const;

export type ChessEndReason = (typeof CHESS_END_REASONS)[number];

type EndReasonSnapshot = Pick<
  ChessClientState,
  | 'variant'
  | 'winnerColor'
  | 'clocks'
  | 'isCheckmate'
  | 'isStalemate'
  | 'isDrawByRepetition'
  | 'isDrawByFiftyMoveRule'
  | 'isInsufficientMaterial'
  | 'isDrawByAgreement'
> & { endReason?: unknown };

const VARIANT_WIN_VARIANTS = new Set<ChessClientState['variant']>([
  'king_of_the_hill',
  'three_check',
  'atomic',
]);

function isKnownReason(value: unknown): value is ChessEndReason {
  return (
    typeof value === 'string' &&
    (CHESS_END_REASONS as readonly string[]).includes(value)
  );
}

/**
 * Resolves why a finished chess game ended. Prefers the server-provided
 * `endReason` field when present; otherwise derives it from the legacy
 * boolean flags, clocks and variant. Returns null for games still running.
 */
export function getChessEndReason(
  snapshot: EndReasonSnapshot | null | undefined,
  isGameOver: boolean,
): ChessEndReason | null {
  if (!snapshot || !isGameOver) return null;
  if (isKnownReason(snapshot.endReason)) return snapshot.endReason;
  if (snapshot.isCheckmate) return 'checkmate';
  if (snapshot.isStalemate) return 'stalemate';
  if (snapshot.isDrawByRepetition) return 'repetition';
  if (snapshot.isDrawByFiftyMoveRule) return 'fifty_move';
  if (snapshot.isDrawByAgreement) return 'agreement';
  const flagged = (['white', 'black'] as const).some(
    (c) => (snapshot.clocks?.[c]?.remainingSeconds ?? 1) <= 0,
  );
  if (snapshot.isInsufficientMaterial) {
    return flagged ? 'timeout_vs_insufficient' : 'insufficient_material';
  }
  if (!snapshot.winnerColor) return 'aborted';
  if (flagged) return 'timeout';
  if (VARIANT_WIN_VARIANTS.has(snapshot.variant)) return 'variant_win';
  return 'resignation';
}
