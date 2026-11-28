import type { GameOptions } from '@/shared/types/games';
import type { ChessClientState } from '../types';

type DrawFlags = Pick<
  ChessClientState,
  | 'isStalemate'
  | 'isDrawByRepetition'
  | 'isDrawByFiftyMoveRule'
  | 'isInsufficientMaterial'
  | 'isDrawByAgreement'
  | 'isDrawByTimeout'
>;

/** True when the snapshot ended (or is ending) in any kind of draw. */
export function isChessDraw(snapshot: DrawFlags | null | undefined): boolean {
  return !!(
    snapshot?.isStalemate ||
    snapshot?.isDrawByRepetition ||
    snapshot?.isDrawByFiftyMoveRule ||
    snapshot?.isInsufficientMaterial ||
    snapshot?.isDrawByAgreement ||
    snapshot?.isDrawByTimeout
  );
}

/** Picks the visual theme variant for the chess widget from room options. */
export function resolveChessThemeVariant(
  options: GameOptions | undefined,
): string {
  const pick = (value: unknown) =>
    typeof value === 'string' && value ? value : undefined;
  return (
    pick(options?.theme) ??
    pick(options?.cardVariant) ??
    pick(options?.variant) ??
    'cyberpunk'
  );
}
