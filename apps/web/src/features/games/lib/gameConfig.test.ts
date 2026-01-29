import { describe, it, expect, beforeEach } from 'vitest';
import { GameConfigManager } from './gameConfig';
import type { GameConfig } from '../types';

describe('GameConfigManager', () => {
  let manager: GameConfigManager;

  beforeEach(() => {
    manager = GameConfigManager.getInstance();
    // Clear internal state for tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (manager as any).configs.clear();
  });

  it('registers and retrieves config', () => {
    const config = {
      slug: 'g1',
      name: 'Game 1',
      minPlayers: 1,
      maxPlayers: 2,
      category: 'Cat',
    } as GameConfig;
    manager.registerConfig(config);
    expect(manager.getConfig('g1')).toBe(config);
  });

  it('updates config correctly', () => {
    manager.registerConfig({ slug: 'g1', name: 'Old Name' } as GameConfig);
    manager.updateConfig('g1', { name: 'New Name' });
    expect(manager.getConfig('g1')?.name).toBe('New Name');
  });

  it('filters games by player count', () => {
    manager.registerConfig({
      slug: 'g1',
      minPlayers: 2,
      maxPlayers: 4,
    } as GameConfig);
    manager.registerConfig({
      slug: 'g2',
      minPlayers: 1,
      maxPlayers: 2,
    } as GameConfig);

    expect(manager.getGamesByPlayerCount(3)).toHaveLength(1);
    expect(manager.getGamesByPlayerCount(1)).toHaveLength(1);
  });

  it('searches games by tags', () => {
    manager.registerConfig({
      slug: 'g1',
      name: 'N1',
      description: 'D1',
      tags: ['strategy'],
    } as GameConfig);
    expect(manager.searchGames('STRATEGY')).toHaveLength(1);
  });

  it('provides recommendations based on preferences', () => {
    manager.registerConfig({
      slug: 'g1',
      category: 'Card',
      complexity: 2,
      minPlayers: 2,
      maxPlayers: 4,
      tags: ['fun'],
    } as GameConfig);
    manager.registerConfig({
      slug: 'g2',
      category: 'Board',
      complexity: 4,
      minPlayers: 2,
      maxPlayers: 4,
      tags: ['serious'],
    } as GameConfig);

    const recs = manager.getRecommendedGames({ category: 'Card' });
    expect(recs).toHaveLength(1);
    expect(recs[0].slug).toBe('g1');

    const recsByComplexity = manager.getRecommendedGames({ complexity: 2 });
    expect(recsByComplexity).toHaveLength(1);
    expect(recsByComplexity[0].slug).toBe('g1');
  });

  it('calculates statistics correctly', () => {
    manager.registerConfig({
      slug: 'g1',
      category: 'C1',
      complexity: 1,
    } as GameConfig);
    manager.registerConfig({
      slug: 'g2',
      category: 'C1',
      complexity: 5,
    } as GameConfig);

    const stats = manager.getGameStats();
    expect(stats.totalGames).toBe(2);
    expect(stats.averageComplexity).toBe(3);
    expect(stats.mostComplexGame?.slug).toBe('g2');
    expect(stats.simplestGame?.slug).toBe('g1');
    expect(stats.gamesByCategory['C1']).toBe(2);
  });
});
