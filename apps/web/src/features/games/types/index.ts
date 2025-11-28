// Re-export all types for easier importing
export * from "./base";

// Import and re-export game-specific types
export type { 
  GameRoomSummary, 
  GameSessionSummary,
  ExplodingCatsSnapshot,
  ExplodingCatsPlayerState,
  ExplodingCatsCard,
  TexasHoldemSnapshot
} from "@/shared/types/games";