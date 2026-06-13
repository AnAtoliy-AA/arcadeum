import type { GameResult } from '../hooks/useGameResultModal';

export interface BackendGameResult {
  winnerIds: string[];
  isDraw: boolean;
}

/**
 * Computes the local player's game result from a session snapshot.
 * Returns `null` when the game is still in progress.
 *
 * If `backendResult` is provided (from `session.state.gameResult`),
 * it is used directly. Otherwise falls back to game-specific fields.
 */
export function computeGameResult(
  isGameOver: boolean,
  currentUserId: string | null | undefined,
  options: {
    winnerId?: string | null;
    isDraw?: boolean;
    isWinner?: () => boolean;
    backendResult?: BackendGameResult;
  },
): GameResult {
  if (!isGameOver || !currentUserId) return null;

  if (options.backendResult) {
    const { winnerIds, isDraw } = options.backendResult;
    if (isDraw) return 'draw';
    if (winnerIds.length === 0) return 'lost';
    return winnerIds.includes(currentUserId) ? 'won' : 'lost';
  }

  if (options.isDraw) return 'draw';
  if (options.isWinner) return options.isWinner() ? 'won' : 'lost';
  if (!options.winnerId) return 'lost';
  return options.winnerId === currentUserId ? 'won' : 'lost';
}
