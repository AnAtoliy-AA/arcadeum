import type { GameMetadata, GameConfig } from "../types";
import { gameMetadata } from "../registry";

/**
 * Game configuration manager for managing game settings and metadata
 */
export class GameConfigManager {
  private static instance: GameConfigManager;
  private configs: Map<string, GameConfig> = new Map();

  public static getInstance(): GameConfigManager {
    if (!GameConfigManager.instance) {
      GameConfigManager.instance = new GameConfigManager();
    }
    return GameConfigManager.instance;
  }

  /**
   * Get game configuration by slug
   */
  public getConfig(slug: string): GameConfig | null {
    return this.configs.get(slug) || null;
  }

  /**
   * Get game metadata by slug
   */
  public getMetadata(slug: string): GameMetadata | undefined {
    return gameMetadata[slug as keyof typeof gameMetadata];
  }

  /**
   * Get all available game configurations
   */
  public getAllConfigs(): GameConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get games by category
   */
  public getGamesByCategory(category: string): GameConfig[] {
    return this.getAllConfigs().filter(config => config.category === category);
  }

  /**
   * Get games by complexity range
   */
  public getGamesByComplexity(min: number, max: number): GameConfig[] {
    return this.getAllConfigs().filter(config => 
      config.complexity && config.complexity >= min && config.complexity <= max
    );
  }

  /**
   * Get games by player count
   */
  public getGamesByPlayerCount(minPlayers: number, maxPlayers?: number): GameConfig[] {
    return this.getAllConfigs().filter(config => 
      config.minPlayers <= minPlayers && 
      (!maxPlayers || config.maxPlayers >= maxPlayers)
    );
  }

  /**
   * Search games by name, description, or tags
   */
  public searchGames(query: string): GameConfig[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllConfigs().filter(config =>
      config.name.toLowerCase().includes(lowerQuery) ||
      config.description.toLowerCase().includes(lowerQuery) ||
      config.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get recommended games based on preferences
   */
  public getRecommendedGames(preferences: {
    category?: string;
    complexity?: number;
    playerCount?: number;
    tags?: string[];
  }): GameConfig[] {
    let games = this.getAllConfigs();

    if (preferences.category) {
      games = games.filter(game => game.category === preferences.category);
    }

    if (preferences.complexity) {
      games = games.filter(game => 
        game.complexity && 
        Math.abs(game.complexity - preferences.complexity!) <= 1
      );
    }

    if (preferences.playerCount) {
      games = games.filter(game => 
        game.minPlayers <= preferences.playerCount! && 
        game.maxPlayers >= preferences.playerCount!
      );
    }

    if (preferences.tags && preferences.tags.length > 0) {
      games = games.filter(game => 
        game.tags?.some(tag => preferences.tags!.includes(tag))
      );
    }

    return games.slice(0, 10); // Return top 10 recommendations
  }

  /**
   * Check if a game supports AI players
   */
  public supportsAI(slug: string): boolean {
    const config = this.getConfig(slug);
    return config?.supportsAI || false;
  }

  /**
   * Get game duration estimate
   */
  public getDurationEstimate(slug: string): number | null {
    const config = this.getConfig(slug);
    return config?.estimatedDuration || null;
  }

  /**
   * Validate player count for a game
   */
  public isValidPlayerCount(slug: string, playerCount: number): boolean {
    const config = this.getConfig(slug);
    return config ? 
      playerCount >= config.minPlayers && playerCount <= config.maxPlayers : 
      false;
  }

  /**
   * Register a new game configuration
   */
  public registerConfig(config: GameConfig): void {
    this.configs.set(config.slug, config);
  }

  /**
   * Update an existing game configuration
   */
  public updateConfig(slug: string, updates: Partial<GameConfig>): void {
    const existing = this.configs.get(slug);
    if (existing) {
      this.configs.set(slug, { ...existing, ...updates });
    }
  }

  /**
   * Get game statistics
   */
  public getGameStats(): {
    totalGames: number;
    gamesByCategory: Record<string, number>;
    averageComplexity: number;
    mostComplexGame: GameConfig | null;
    simplestGame: GameConfig | null;
  } {
    const configs = this.getAllConfigs();
    
    const gamesByCategory: Record<string, number> = {};
    let totalComplexity = 0;
    let complexityCount = 0;
    let mostComplex: GameConfig | null = null;
    let simplest: GameConfig | null = null;

    for (const config of configs) {
      // Count by category
      gamesByCategory[config.category] = (gamesByCategory[config.category] || 0) + 1;

      // Track complexity
      if (config.complexity) {
        totalComplexity += config.complexity;
        complexityCount++;
        
        if (!mostComplex || config.complexity > mostComplex.complexity!) {
          mostComplex = config;
        }
        
        if (!simplest || config.complexity < simplest.complexity!) {
          simplest = config;
        }
      }
    }

    return {
      totalGames: configs.length,
      gamesByCategory,
      averageComplexity: complexityCount > 0 ? totalComplexity / complexityCount : 0,
      mostComplexGame: mostComplex,
      simplestGame: simplest
    };
  }
}

/**
 * Global game config manager instance
 */
export const gameConfigManager = GameConfigManager.getInstance();

/**
 * Hook for using game config manager in components
 */
export function useGameConfig() {
  return gameConfigManager;
}