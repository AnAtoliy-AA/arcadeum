import type { GameResult } from '../hooks/useGameResultModal';

/**
 * Computes the local player's game result from a session snapshot.
 * Returns `null` when the game is still in progress.
 *
 * Handles the common case (winnerId === userId). Pass `isDraw` from the
 * snapshot for games that support draws. For team-mode games, pass a custom
 * `isWinner` predicate.
 */
export function computeGameResult(
  isGameOver: boolean,
  currentUserId: string | null | undefined,
  options: {
    winnerId?: string | null;
    isDraw?: boolean;
    isWinner?: () => boolean;
  },
): GameResult {
  if (!isGameOver || !currentUserId) return null;
  if (options.isDraw) return 'draw';
  if (options.isWinner) return options.isWinner() ? 'won' : 'lost';
  if (!options.winnerId) return 'lost';
  return options.winnerId === currentUserId ? 'won' : 'lost';
}
