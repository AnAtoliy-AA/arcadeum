import { randomUUID } from 'crypto';
import {
  IGameEngine,
  BaseGameState,
  GameMetadata,
  GameActionResult,
  GameActionContext,
  GameLogEntry,
  GamePlayerState,
} from './game-engine.interface';

/**
 * Abstract Base Game Engine
 * Provides common functionality for all game engines
 */
export abstract class BaseGameEngine<
  TState extends BaseGameState = BaseGameState,
> implements IGameEngine<TState>
{
  /**
   * Subclasses must implement this to provide game metadata
   */
  abstract getMetadata(): GameMetadata;

  /**
   * Subclasses must implement this to initialize game state
   */
  abstract initializeState(
    playerIds: string[],
    config?: Record<string, unknown>,
  ): TState;

  /**
   * Subclasses must implement this to validate actions
   */
  abstract validateAction(
    state: TState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): boolean;

  /**
   * Subclasses must implement this to execute actions
   */
  abstract executeAction(
    state: TState,
    action: string,
    context: GameActionContext,
    payload?: unknown,
  ): GameActionResult<TState>;

  /**
   * Subclasses must implement this to check if game is over
   */
  abstract isGameOver(state: TState): boolean;

  /**
   * Subclasses must implement this to get winners
   */
  abstract getWinners(state: TState): string[];

  /**
   * Subclasses must implement this to sanitize state
   */
  abstract sanitizeStateForPlayer(
    state: TState,
    playerId: string,
  ): Partial<TState>;

  /**
   * Subclasses must implement this to get available actions
   */
  abstract getAvailableActions(state: TState, playerId: string): string[];

  /**
   * Helper: Create a log entry
   */
  protected createLogEntry(
    type: 'system' | 'action' | 'message',
    message: string,
    options: {
      scope?: 'all' | 'players' | 'private';
      senderId?: string;
      senderName?: string;
    } = {},
  ): GameLogEntry {
    return {
      id: randomUUID(),
      type,
      message,
      createdAt: new Date().toISOString(),
      scope: options.scope || 'all',
      senderId: options.senderId || null,
      senderName: options.senderName || null,
    };
  }

  /**
   * Helper: Clone state deeply
   */
  protected cloneState(state: TState): TState {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Helper: Shuffle array in place
   */
  protected shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Helper: Find player in state
   */
  protected findPlayer(
    state: TState,
    playerId: string,
  ): GamePlayerState | undefined {
    return state.players.find((p) => p.playerId === playerId);
  }

  /**
   * Helper: Get current player
   */
  protected getCurrentPlayer(state: TState): GamePlayerState | undefined {
    if (state.currentTurnIndex === undefined) {
      return undefined;
    }
    return state.players[state.currentTurnIndex];
  }

  /**
   * Helper: Check if it's a player's turn
   */
  protected isPlayerTurn(state: TState, playerId: string): boolean {
    const currentPlayer = this.getCurrentPlayer(state);
    return currentPlayer?.playerId === playerId;
  }

  /**
   * Helper: Advance turn to next player
   */
  protected advanceTurn(state: TState): void {
    if (state.currentTurnIndex === undefined) {
      return;
    }
    state.currentTurnIndex =
      (state.currentTurnIndex + 1) % state.players.length;
  }

  /**
   * Helper: Add log to state
   */
  protected addLog(state: TState, log: GameLogEntry): void {
    state.logs.push(log);
  }

  /**
   * Helper: Create success result
   */
  protected successResult(
    state: TState,
    logs?: GameLogEntry[],
  ): GameActionResult<TState> {
    return {
      success: true,
      state,
      logs,
    };
  }

  /**
   * Helper: Create error result
   */
  protected errorResult(error: string): GameActionResult<TState> {
    return {
      success: false,
      error,
    };
  }

  /**
   * Default implementation for config validation
   */
  validateConfig(config: Record<string, unknown>): boolean {
    return true;
  }

  /**
   * Default implementation for statistics
   */
  getStatistics(state: TState): Record<string, unknown> {
    return {
      playerCount: state.players.length,
      logCount: state.logs.length,
    };
  }
}
