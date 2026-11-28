import type { ChessClientState } from '../types';

interface EngineAidsContext {
  snapshot: Pick<ChessClientState, 'players'> | null;
  currentUserId: string | null;
  isSpectator: boolean;
  isGameOver: boolean;
}

/**
 * Fair-play gate for engine assistance (live eval, best move, candidate
 * lines, threat arrows, opening explorer).
 *
 * Engine aids are shown to spectators, after the game ends, and in practice
 * games where every opponent is a bot. A seated player facing at least one
 * human opponent never sees engine output while the game is in progress.
 */
export function canShowEngineAids({
  snapshot,
  currentUserId,
  isSpectator,
  isGameOver,
}: EngineAidsContext): boolean {
  if (isGameOver || isSpectator) return true;
  if (!snapshot) return false;
  const seated = snapshot.players.some((p) => p.playerId === currentUserId);
  if (!seated) return true;
  return snapshot.players
    .filter((p) => p.playerId !== currentUserId)
    .every((p) => p.isBot);
}
