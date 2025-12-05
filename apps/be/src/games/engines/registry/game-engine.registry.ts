import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { IGameEngine, GameMetadata } from '../base/game-engine.interface';

/**
 * Game Engine Registry
 * Manages registration and retrieval of game engines
 */
@Injectable()
export class GameEngineRegistry {
  private readonly logger = new Logger(GameEngineRegistry.name);
  private readonly engines = new Map<string, IGameEngine>();

  /**
   * Game ID mapping from user-facing IDs to engine IDs
   */
  private readonly gameIdMapping: Record<string, string> = {
    // Exploding Cats variants
    exploding_cats_v1: 'exploding_cats_v1',
    'exploding-kittens': 'exploding_cats_v1',
    exploding_cats: 'exploding_cats_v1',
    exploding_cats_v1_beta: 'exploding_cats_v1',

    // Texas Holdem variants
    texas_holdem_v1: 'texas_holdem_v1',
    'texas-holdem': 'texas_holdem_v1',
    texas_holdem: 'texas_holdem_v1',
    texas_holdem_poker: 'texas_holdem_v1',
  };

  /**
   * Normalize game ID to engine ID
   * @param gameId User-facing or engine game ID
   * @returns Engine game ID
   */
  private normalizeGameId(gameId: string): string {
    return this.gameIdMapping[gameId] || gameId;
  }

  /**
   * Register a game engine
   * @param engine Game engine to register
   */
  register(engine: IGameEngine): void {
    const metadata = engine.getMetadata();

    if (this.engines.has(metadata.gameId)) {
      this.logger.warn(
        `Game engine "${metadata.gameId}" is already registered. Overwriting.`,
      );
    }

    this.engines.set(metadata.gameId, engine);
    this.logger.log(
      `Registered game engine: ${metadata.name} (${metadata.gameId}) v${metadata.version}`,
    );
  }

  /**
   * Get a game engine by ID
   * @param gameId Game ID (can be user-facing or engine ID)
   * @throws NotFoundException if engine not found
   */
  getEngine(gameId: string): IGameEngine {
    const normalizedId = this.normalizeGameId(gameId);
    const engine = this.engines.get(normalizedId);

    if (!engine) {
      throw new NotFoundException(
        `Game engine not found for game ID: ${gameId} (normalized: ${normalizedId})`,
      );
    }

    return engine;
  }

  /**
   * Check if a game engine is registered
   * @param gameId Game ID
   */
  hasEngine(gameId: string): boolean {
    return this.engines.has(gameId);
  }

  /**
   * Get all registered game IDs
   */
  getRegisteredGameIds(): string[] {
    return Array.from(this.engines.keys());
  }

  /**
   * Get metadata for all registered games
   */
  getAllMetadata(): GameMetadata[] {
    return Array.from(this.engines.values()).map((engine) =>
      engine.getMetadata(),
    );
  }

  /**
   * Get metadata for a specific game
   * @param gameId Game ID
   */
  getMetadata(gameId: string): GameMetadata {
    const engine = this.getEngine(gameId);
    return engine.getMetadata();
  }

  /**
   * Unregister a game engine
   * @param gameId Game ID
   */
  unregister(gameId: string): boolean {
    const deleted = this.engines.delete(gameId);

    if (deleted) {
      this.logger.log(`Unregistered game engine: ${gameId}`);
    }

    return deleted;
  }

  /**
   * Clear all registered engines
   */
  clear(): void {
    this.engines.clear();
    this.logger.log('Cleared all game engines');
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalGames: number;
    games: Array<{ gameId: string; name: string; version: string }>;
  } {
    const games = Array.from(this.engines.values()).map((engine) => {
      const metadata = engine.getMetadata();
      return {
        gameId: metadata.gameId,
        name: metadata.name,
        version: metadata.version,
      };
    });

    return {
      totalGames: games.length,
      games,
    };
  }
}
