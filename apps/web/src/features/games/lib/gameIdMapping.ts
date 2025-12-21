/**
 * Game ID utility
 * Simplified since frontend and backend use consistent IDs
 */

// Internal game type identifiers used throughout the app
export type GameType = "exploding_kittens_v1" | "texas_holdem_v1" | null;

// Valid game IDs for type checking
const VALID_GAME_IDS = ["exploding_kittens_v1", "texas_holdem_v1"] as const;

/**
 * Check if a string is a valid game type
 */
function isValidGameType(gameId: string): gameId is NonNullable<GameType> {
  return VALID_GAME_IDS.includes(gameId as any);
}

/**
 * Convert any game ID to internal game type
 */
export function mapToGameType(gameId: string | undefined | null): GameType {
  if (!gameId) return null;
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