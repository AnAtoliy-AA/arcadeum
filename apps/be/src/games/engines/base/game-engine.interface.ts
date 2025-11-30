/**
 * Base Game Engine Interface
 * All game implementations must implement this interface
 */

export interface GameMetadata {
  gameId: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  version: string;
  description?: string;
  category?: string;
}

export interface GamePlayerState {
  playerId: string;
  [key: string]: any;
}

export interface GameLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players' | 'private';
  senderId?: string | null;
  senderName?: string | null;
}

export interface BaseGameState {
  players: GamePlayerState[];
  logs: GameLogEntry[];
  currentTurnIndex?: number;
  [key: string]: any;
}

export interface GameActionResult<TState = any> {
  success: boolean;
  state?: TState;
  error?: string;
  logs?: GameLogEntry[];
}

export interface GameActionContext {
  userId: string;
  roomId: string;
  sessionId: string;
  timestamp: Date;
}

/**
 * Core Game Engine Interface
 * Defines the contract that all game engines must implement
 */
export interface IGameEngine<TState extends BaseGameState = BaseGameState> {
  /**
   * Get game metadata
   */
  getMetadata(): GameMetadata;

  /**
   * Initialize a new game state
   * @param playerIds Array of player IDs
   * @param config Optional game configuration
   */
  initializeState(playerIds: string[], config?: Record<string, any>): TState;

  /**
   * Validate a player action
   * @param state Current game state
   * @param action Action to validate
   * @param context Action context (userId, roomId, etc.)
   */
  validateAction(
    state: TState,
    action: string,
    context: GameActionContext,
    payload?: any,
  ): boolean;

  /**
   * Execute a player action
   * @param state Current game state
   * @param action Action to execute
   * @param context Action context
   * @param payload Action payload
   */
  executeAction(
    state: TState,
    action: string,
    context: GameActionContext,
    payload?: any,
  ): GameActionResult<TState>;

  /**
   * Check if the game is over
   * @param state Current game state
   */
  isGameOver(state: TState): boolean;

  /**
   * Get winners if game is over
   * @param state Current game state
   */
  getWinners(state: TState): string[];

  /**
   * Sanitize state for a specific player (hide private information)
   * @param state Current game state
   * @param playerId Player ID to sanitize for
   */
  sanitizeStateForPlayer(state: TState, playerId: string): Partial<TState>;

  /**
   * Get available actions for a player
   * @param state Current game state
   * @param playerId Player ID
   */
  getAvailableActions(state: TState, playerId: string): string[];

  /**
   * Add a player to an ongoing game (if supported)
   * @param state Current game state
   * @param playerId Player ID to add
   */
  addPlayer?(state: TState, playerId: string): GameActionResult<TState>;

  /**
   * Remove a player from an ongoing game
   * @param state Current game state
   * @param playerId Player ID to remove
   */
  removePlayer?(state: TState, playerId: string): GameActionResult<TState>;

  /**
   * Validate game configuration
   * @param config Game configuration
   */
  validateConfig?(config: Record<string, any>): boolean;

  /**
   * Get game statistics
   * @param state Current game state
   */
  getStatistics?(state: TState): Record<string, any>;
}
