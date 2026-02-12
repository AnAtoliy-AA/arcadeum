/**
 * Game ID utility
 * Simplified since frontend and backend use consistent IDs
 */

// Internal game type identifiers used throughout the app
export type GameType = 'critical_v1' | 'sea_battle_v1' | null;

// Valid game IDs for type checking
const VALID_GAME_IDS = ['critical_v1', 'sea_battle_v1'] as const;

/**
 * Check if a string is a valid game type
 */
function isValidGameType(gameId: string): gameId is NonNullable<GameType> {
  return (VALID_GAME_IDS as readonly string[]).includes(gameId);
}

/**
 * Convert any game ID to internal game type
 */
export function mapToGameType(gameId: string | undefined | null): GameType {
  if (!gameId) return null;
  if (gameId === 'exploding_kittens_v1') return 'critical_v1';
  return isValidGameType(gameId) ? gameId : null;
}

/**
 * Get all supported game IDs
 */
export function getAllSupportedGameIds(): string[] {
  return [...VALID_GAME_IDS];
}

/**
 * Check if a game ID is supported
 */
export function isSupportedGameId(gameId: string): boolean {
  return isValidGameType(gameId);
}
