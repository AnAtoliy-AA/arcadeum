import { describe, it, expect } from 'vitest';
import { buildComingSoonMaps, isCreateBlocked } from './createPageState';
import type { CatalogResponse } from '@/features/games/api';

describe('buildComingSoonMaps', () => {
  it('returns empty maps when catalog is null', () => {
    const { gameComingSoon, variantComingSoon } = buildComingSoonMaps(null);
    expect(gameComingSoon.size).toBe(0);
    expect(variantComingSoon.size).toBe(0);
  });

  it('returns empty maps when catalog has no games', () => {
    const catalog: CatalogResponse = { games: [] };
    const { gameComingSoon, variantComingSoon } = buildComingSoonMaps(catalog);
    expect(gameComingSoon.size).toBe(0);
    expect(variantComingSoon.size).toBe(0);
  });

  it('maps game comingSoon flags correctly', () => {
    const catalog: CatalogResponse = {
      games: [
        { gameId: 'critical_v1', comingSoon: true, variants: [] },
        { gameId: 'sea_battle_v1', comingSoon: false, variants: [] },
      ],
    };
    const { gameComingSoon } = buildComingSoonMaps(catalog);
    expect(gameComingSoon.get('critical_v1')).toBe(true);
    expect(gameComingSoon.get('sea_battle_v1')).toBe(false);
  });

  it('maps variant comingSoon flags with composite key', () => {
    const catalog: CatalogResponse = {
      games: [
        {
          gameId: 'critical_v1',
          comingSoon: false,
          variants: [
            { id: 'standard', comingSoon: false },
            { id: 'premium', comingSoon: true },
          ],
        },
      ],
    };
    const { variantComingSoon } = buildComingSoonMaps(catalog);
    expect(variantComingSoon.get('critical_v1::standard')).toBe(false);
    expect(variantComingSoon.get('critical_v1::premium')).toBe(true);
  });

  it('handles multiple games with variants without key collisions', () => {
    const catalog: CatalogResponse = {
      games: [
        {
          gameId: 'game_a',
          comingSoon: false,
          variants: [{ id: 'v1', comingSoon: true }],
        },
        {
          gameId: 'game_b',
          comingSoon: false,
          variants: [{ id: 'v1', comingSoon: false }],
        },
      ],
    };
    const { variantComingSoon } = buildComingSoonMaps(catalog);
    expect(variantComingSoon.get('game_a::v1')).toBe(true);
    expect(variantComingSoon.get('game_b::v1')).toBe(false);
  });
});

describe('isCreateBlocked', () => {
  it('returns false when both maps are empty', () => {
    const g = new Map<string, boolean>();
    const v = new Map<string, boolean>();
    expect(isCreateBlocked(g, v, 'critical_v1', null)).toBe(false);
  });

  it('returns true when the selected game is comingSoon', () => {
    const g = new Map<string, boolean>([['critical_v1', true]]);
    const v = new Map<string, boolean>();
    expect(isCreateBlocked(g, v, 'critical_v1', null)).toBe(true);
  });

  it('returns false when the selected game is not comingSoon', () => {
    const g = new Map<string, boolean>([['critical_v1', false]]);
    const v = new Map<string, boolean>();
    expect(isCreateBlocked(g, v, 'critical_v1', 'standard')).toBe(false);
  });

  it('returns true when the selected variant is comingSoon', () => {
    const g = new Map<string, boolean>([['critical_v1', false]]);
    const v = new Map<string, boolean>([['critical_v1::premium', true]]);
    expect(isCreateBlocked(g, v, 'critical_v1', 'premium')).toBe(true);
  });

  it('returns false when a different variant is comingSoon but not the selected one', () => {
    const g = new Map<string, boolean>([['critical_v1', false]]);
    const v = new Map<string, boolean>([
      ['critical_v1::premium', true],
      ['critical_v1::standard', false],
    ]);
    expect(isCreateBlocked(g, v, 'critical_v1', 'standard')).toBe(false);
  });

  it('returns true when game is comingSoon even if variant is not', () => {
    const g = new Map<string, boolean>([['critical_v1', true]]);
    const v = new Map<string, boolean>([['critical_v1::standard', false]]);
    expect(isCreateBlocked(g, v, 'critical_v1', 'standard')).toBe(true);
  });

  it('returns false when variantId is undefined', () => {
    const g = new Map<string, boolean>([['critical_v1', false]]);
    const v = new Map<string, boolean>([['critical_v1::premium', true]]);
    expect(isCreateBlocked(g, v, 'critical_v1', undefined)).toBe(false);
  });

  it('returns false when game is not found in the map', () => {
    const g = new Map<string, boolean>([['other_game', true]]);
    const v = new Map<string, boolean>();
    expect(isCreateBlocked(g, v, 'critical_v1', null)).toBe(false);
  });
});
