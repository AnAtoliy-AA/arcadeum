import type { GameMetadata, BaseGameProps } from "./types";
import type { GameSlug } from "./registry.types";

export { GameSlug };

export const gameLoaders: Record<string, () => Promise<{ default: React.ComponentType<BaseGameProps> }>> = {
  exploding_cats_v1: () => import("@/widgets/ExplodingCatsGame"),
  texas_holdem_v1: () => import("@/widgets/TexasHoldemGame"),
  // Future game implementations will be added here
  // chess_v1: () => import("@/widgets/ChessGame"),
  // checkers_v1: () => import("@/widgets/CheckersGame"),
  // Add more games as they are implemented
} as const;

// Game metadata registry
export const gameMetadata: Partial<Record<GameSlug, GameMetadata>> = {
  exploding_cats_v1: {
    slug: "exploding_cats_v1",
    name: "Exploding Kittens",
    description: "A kitty-powered version of Russian Roulette",
    category: "Card Game",
    minPlayers: 2,
    maxPlayers: 5,
    estimatedDuration: 15,
    complexity: 2,
    ageRating: "PG-13",
    thumbnail: "/games/exploding-cats.jpg",
    version: "1.0.0",
    supportsAI: true,
    tags: ["cards", "party", "fun", "strategy"],
    implementationPath: "@/widgets/ExplodingCatsGame",
    lastUpdated: "2024-01-01",
    status: "active"
  },
  texas_holdem_v1: {
    slug: "texas_holdem_v1", 
    name: "Texas Hold'em Poker",
    description: "Classic poker game with Texas Hold'em rules",
    category: "Card Game",
    minPlayers: 2,
    maxPlayers: 9,
    estimatedDuration: 60,
    complexity: 4,
    ageRating: "PG-16",
    thumbnail: "/games/texas-holdem.jpg",
    version: "1.0.0",
    supportsAI: true,
    tags: ["cards", "poker", "strategy", "betting"],
    implementationPath: "@/widgets/TexasHoldemGame",
    lastUpdated: "2024-01-01",
    status: "active"
  },
  // Sample metadata for other games (can be expanded)
  chess_v1: {
    slug: "chess_v1",
    name: "Chess",
    description: "The classic strategy board game",
    category: "Board Game",
    minPlayers: 2,
    maxPlayers: 2,
    estimatedDuration: 30,
    complexity: 5,
    ageRating: "G",
    thumbnail: "/games/chess.jpg",
    version: "1.0.0",
    supportsAI: true,
    tags: ["board", "strategy", "classic"],
    implementationPath: "@/widgets/ChessGame",
    lastUpdated: "2024-01-01",
    status: "experimental"
  },
  checkers_v1: {
    slug: "checkers_v1",
    name: "Checkers",
    description: "Classic board game of strategic piece movement",
    category: "Board Game",
    minPlayers: 2,
    maxPlayers: 2,
    estimatedDuration: 20,
    complexity: 3,
    ageRating: "G",
    thumbnail: "/games/checkers.jpg",
    version: "1.0.0",
    supportsAI: true,
    tags: ["board", "strategy", "classic"],
    implementationPath: "@/widgets/CheckersGame",
    lastUpdated: "2024-01-01",
    status: "experimental"
  },
  tic_tac_toe_v1: {
    slug: "tic_tac_toe_v1",
    name: "Tic Tac Toe",
    description: "Classic paper-and-pencil game",
    category: "Board Game",
    minPlayers: 2,
    maxPlayers: 2,
    estimatedDuration: 5,
    complexity: 1,
    ageRating: "G",
    thumbnail: "/games/tic-tac-toe.jpg",
    version: "1.0.0",
    supportsAI: true,
    tags: ["board", "casual", "quick"],
    implementationPath: "@/widgets/TicTacToeGame",
    lastUpdated: "2024-01-01",
    status: "beta"
  }
  // ... additional game metadata can be added here
};
