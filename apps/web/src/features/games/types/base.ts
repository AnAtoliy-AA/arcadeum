import type { GameRoomSummary, GameSessionSummary } from "@/shared/types/games";

/**
 * Base game configuration interface
 */
export interface GameConfig {
  /** Unique game identifier */
  slug: string;
  /** Display name for the game */
  name: string;
  /** Short description of the game */
  description: string;
  /** Game category/genre */
  category: string;
  /** Minimum number of players */
  minPlayers: number;
  /** Maximum number of players */
  maxPlayers: number;
  /** Estimated game duration in minutes */
  estimatedDuration?: number;
  /** Game complexity rating (1-5) */
  complexity?: number;
  /** Age rating */
  ageRating?: string;
  /** Game thumbnail/cover image URL */
  thumbnail?: string;
  /** Game version */
  version: string;
  /** Whether the game supports AI players */
  supportsAI?: boolean;
  /** Game tags for filtering */
  tags?: string[];
}

/**
 * Base game metadata interface
 */
export interface GameMetadata extends GameConfig {
  /** Game implementation file path */
  implementationPath: string;
  /** Last updated timestamp */
  lastUpdated: string;
  /** Game status */
  status: "active" | "beta" | "experimental" | "deprecated";
}

/**
 * Standardized game props interface that all games should implement
 */
export interface BaseGameProps {
  /** Current game room */
  room: GameRoomSummary;
  /** Current game session (null if not started) */
  session: GameSessionSummary | null;
  /** Current user ID */
  currentUserId: string | null;
  /** Whether current user is the host */
  isHost: boolean;
  /** Callback to post history note */
  onPostHistoryNote: (message: string, scope: "all" | "players") => void;
  /** Optional callback for custom actions */
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
  /** Game configuration */
  config?: GameConfig;
}

/**
 * Game state interface for saving/loading game state
 */
export interface GameState {
  /** Game session ID */
  sessionId: string;
  /** Current game state data */
  state: Record<string, unknown>;
  /** Players in the game */
  players: Array<{
    playerId: string;
    name: string;
    isHost: boolean;
  }>;
  /** Game metadata */
  metadata: {
    startedAt: string;
    lastActivity: string;
    gameSlug: string;
  };
}

/**
 * Game action interface for standardized game interactions
 */
export interface GameAction {
  /** Action type identifier */
  type: string;
  /** Action payload */
  payload?: Record<string, unknown>;
  /** Player who performed the action */
  playerId: string;
  /** Timestamp of the action */
  timestamp: string;
}

/**
 * Game event interface for game lifecycle events
 */
export interface GameEvent {
  /** Event type */
  type: "game_started" | "game_ended" | "player_joined" | "player_left" | "action_performed" | "custom";
  /** Event data */
  data: Record<string, unknown>;
  /** Timestamp */
  timestamp: string;
  /** Source player (if applicable) */
  playerId?: string;
}

/**
 * Game statistics interface
 */
export interface GameStatistics {
  /** Total games played */
  totalGames: number;
  /** Average game duration */
  averageDuration: number;
  /** Win rates by player position */
  winRates: Record<string, number>;
  /** Most common actions */
  popularActions: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  /** Player engagement metrics */
  engagement: {
    averageSessionTime: number;
    retentionRate: number;
  };
}

/**
 * Game achievement interface
 */
export interface GameAchievement {
  /** Achievement ID */
  id: string;
  /** Achievement name */
  name: string;
  /** Achievement description */
  description: string;
  /** Achievement icon */
  icon: string;
  /** Achievement rarity */
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  /** Achievement points */
  points: number;
  /** Unlock conditions */
  conditions: {
    type: "games_won" | "actions_performed" | "score_reached" | "time_played";
    value: number;
  };
}

/**
 * Game analytics interface for tracking game performance
 */
export interface GameAnalytics {
  /** Game performance metrics */
  performance: {
    loadTime: number;
    frameRate: number;
    memoryUsage: number;
  };
  /** Player behavior analytics */
  behavior: {
    averageDecisionTime: number;
    actionSuccessRate: number;
    errorRate: number;
  };
  /** Game balance metrics */
  balance: {
    winRateDistribution: number[];
    averageGameLength: number;
    playerRetention: number;
  };
}