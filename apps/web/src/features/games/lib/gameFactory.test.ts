import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameFactory } from './gameFactory';
import type { GameMetadata } from '../types';
import * as registry from '../registry';

// Mock gameLoaders
vi.mock('../registry', () => ({
  gameLoaders: {
    test_game: vi.fn(() => Promise.resolve({ default: () => null })),
    invalid_game: vi.fn(() => Promise.resolve({})),
  },
}));

describe('GameFactory', () => {
  let factory: GameFactory;

  beforeEach(() => {
    factory = GameFactory.getInstance();
    factory.clearCache();
  });

  it('is a singleton', () => {
    const instance1 = GameFactory.getInstance();
    const instance2 = GameFactory.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('registers and retrieves metadata', () => {
    const metadata = {
      slug: 'test_game',
      name: 'Test',
      category: 'Testing',
      tags: ['t1'],
      minPlayers: 1,
      maxPlayers: 2,
    } as GameMetadata;
    factory.registerGameMetadata(metadata);
    expect(factory.getGameMetadata('test_game')).toBe(metadata);
    expect(factory.getAvailableGames()).toContain(metadata);
  });

  it('loads and caches game components', async () => {
    const GameComponent = await factory.loadGame('test_game');
    expect(GameComponent).toBeDefined();
    expect(registry.gameLoaders['test_game']).toHaveBeenCalledTimes(1);
    expect(factory.isGameLoaded('test_game')).toBe(true);

    // Second call should hit cache
    await factory.loadGame('test_game');
    expect(registry.gameLoaders['test_game']).toHaveBeenCalledTimes(1);
  });

  it('throws error for invalid game components', async () => {
    await expect(factory.loadGame('invalid_game')).rejects.toThrow(
      /has no default export/,
    );
  });

  it('filters games by category', () => {
    factory.registerGameMetadata({
      slug: 'g1',
      category: 'Cat1',
      name: 'N1',
    } as GameMetadata);
    factory.registerGameMetadata({
      slug: 'g2',
      category: 'Cat2',
      name: 'N2',
    } as GameMetadata);

    const cat1Games = factory.getGamesByCategory('Cat1');
    expect(cat1Games).toHaveLength(1);
    expect(cat1Games[0].slug).toBe('g1');
  });

  it('searches games correctly', () => {
    factory.registerGameMetadata({
      slug: 'poker',
      name: 'Poker Holdem',
      description: 'desc',
    } as GameMetadata);
    factory.registerGameMetadata({
      slug: 'chess',
      name: 'Chess',
      description: 'strategy',
    } as GameMetadata);

    expect(factory.searchGames('poker')).toHaveLength(1);
    expect(factory.searchGames('strategy')).toHaveLength(1);
    expect(factory.searchGames('CHESS')).toHaveLength(1);
  });
});
