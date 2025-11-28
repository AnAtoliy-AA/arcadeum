/**
 * Game ID mapping utility to handle inconsistencies between
 * backend game IDs, form IDs, and internal game type identifiers
 */

// Internal game type identifiers used throughout the app
export type GameType = "exploding_cats_v1" | "texas_holdem_v1" | null;

// Mapping from form/backend IDs to internal game types
export const GAME_ID_MAPPING: Record<string, GameType> = {
  // Exploding Cats variants
  "exploding_cats_v1": "exploding_cats_v1",
  "exploding-kittens": "exploding_cats_v1",
  "exploding_cats": "exploding_cats_v1",
  "exploding_cats_v1_beta": "exploding_cats_v1",
  
  // Texas Holdem variants
  "texas_holdem_v1": "texas_holdem_v1",
  "texas-holdem": "texas_holdem_v1",
  "texas_holdem": "texas_holdem_v1",
  "texas_holdem_poker": "texas_holdem_v1",
  
  // Additional mappings can be added here
} as const;

// Reverse mapping to get form/backend IDs from internal types
export const INTERNAL_TO_FORM_ID: Record<string, string> = {
  "exploding_cats_v1": "exploding-kittens",
  "texas_holdem_v1": "texas-holdem",
} as const;

/**
 * Convert any game ID to internal game type
 */
export function mapToGameType(gameId: string | undefined | null): GameType {
  if (!gameId) return null;
  
  return GAME_ID_MAPPING[gameId] || null;
}

/**
 * Convert internal game type to form/backend ID
 */
export function mapToFormId(gameType: GameType): string {
  if (gameType === null) return "";
  return INTERNAL_TO_FORM_ID[gameType] || "";
}

/**
 * Get all supported game IDs (both form and internal)
 */
export function getAllSupportedGameIds(): string[] {
  return Object.keys(GAME_ID_MAPPING);
}

/**
 * Check if a game ID is supported
 */
export function isSupportedGameId(gameId: string): boolean {
  return gameId in GAME_ID_MAPPING;
}

/**
 * Get the canonical internal game type for any game ID
 */
export function getCanonicalGameType(gameId: string): GameType {
  return mapToGameType(gameId);
}