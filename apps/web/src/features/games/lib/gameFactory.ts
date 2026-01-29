import type { GameMetadata, BaseGameProps } from '../types';
import { gameLoaders } from '../registry';

/**
 * Game factory for creating and managing game instances
 */
export class GameFactory {
  private static instance: GameFactory;
  private loadedGames: Map<string, React.ComponentType<BaseGameProps>> =
    new Map();
  private gameMetadata: Map<string, GameMetadata> = new Map();

  /**
   * Get singleton instance
   */
  public static getInstance(): GameFactory {
    if (!GameFactory.instance) {
      GameFactory.instance = new GameFactory();
    }
    return GameFactory.instance;
  }

  /**
   * Load a game component by slug
   */
  public async loadGame(
    slug: string,
  ): Promise<React.ComponentType<BaseGameProps>> {
    // Return cached component if already loaded
    if (this.loadedGames.has(slug)) {
      return this.loadedGames.get(slug)!;
    }

    try {
      // Load the game module
      const gameModule = await gameLoaders[slug]();

      const GameComponent =
        gameModule.default as React.ComponentType<BaseGameProps>;

      if (!GameComponent) {
        throw new Error(`Game ${slug} has no default export`);
      }

      if (
        typeof GameComponent !== 'function' &&
        typeof GameComponent !== 'object'
      ) {
        throw new Error(
          `Game ${slug} default export is not a valid React component`,
        );
      }

      // Cache the loaded component
      this.loadedGames.set(slug, GameComponent);

      return GameComponent;
    } catch (error) {
      throw new Error(`Game ${slug} could not be loaded: ${error}`);
    }
  }

  /**
   * Get game metadata by slug
   */
  public getGameMetadata(slug: string): GameMetadata | undefined {
    return this.gameMetadata.get(slug);
  }

  /**
   * Register game metadata
   */
  public registerGameMetadata(metadata: GameMetadata): void {
    this.gameMetadata.set(metadata.slug, metadata);
  }

  /**
   * Get all available games
   */
  public getAvailableGames(): GameMetadata[] {
    return Array.from(this.gameMetadata.values());
  }

  /**
   * Get games by category
   */
  public getGamesByCategory(category: string): GameMetadata[] {
    return this.getAvailableGames().filter(
      (game) => game.category === category,
    );
  }

  /**
   * Get games by tags
   */
  public getGamesByTags(tags: string[]): GameMetadata[] {
    return this.getAvailableGames().filter((game) =>
      tags.some((tag) => game.tags?.includes(tag)),
    );
  }

  /**
   * Search games by name or description
   */
  public searchGames(query: string): GameMetadata[] {
    const lowerQuery = query.toLowerCase();
    return this.getAvailableGames().filter(
      (game) =>
        game.name.toLowerCase().includes(lowerQuery) ||
        game.description.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Check if a game is loaded
   */
  public isGameLoaded(slug: string): boolean {
    return this.loadedGames.has(slug);
  }

  /**
   * Get a loaded game component from cache
   */
  public getLoadedGame(
    slug: string,
  ): React.ComponentType<BaseGameProps> | null {
    return this.loadedGames.get(slug) || null;
  }

  /**
   * Clear cached game components and metadata (useful for memory management and tests)
   */
  public clearCache(): void {
    this.loadedGames.clear();
    this.gameMetadata.clear();
  }

  /**
   * Get game statistics
   */
  public getGameStats(): Record<string, number> {
    return {
      totalGames: this.gameMetadata.size,
      loadedGames: this.loadedGames.size,
      cacheHitRate: this.loadedGames.size / Math.max(this.gameMetadata.size, 1),
    };
  }
}

/**
 * Global game factory instance
 */
export const gameFactory = GameFactory.getInstance();

/**
 * Hook for using game factory in components
 */
export function useGameFactory() {
  return gameFactory;
}
