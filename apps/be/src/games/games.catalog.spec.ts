import { GAME_CATALOG, getCatalogEntry, hasVariant } from './games.catalog';

describe('GAME_CATALOG', () => {
  it('includes glimworm with its three variants', () => {
    const entry = getCatalogEntry('glimworm_v1');
    expect(entry).toBeDefined();
    expect(entry?.variants).toEqual([
      'battle_royale',
      'time_attack',
      'lives_heats',
    ]);
  });

  it('includes texas-holdem without variants', () => {
    expect(getCatalogEntry('texas_holdem_v1')?.variants).toEqual([]);
  });

  it('hasVariant returns true only for known game/variant pairs', () => {
    expect(hasVariant('glimworm_v1', 'time_attack')).toBe(true);
    expect(hasVariant('glimworm_v1', 'nonexistent')).toBe(false);
    expect(hasVariant('critical_v1', 'time_attack')).toBe(false);
    expect(hasVariant('unknown_game', 'time_attack')).toBe(false);
  });

  it('GAME_CATALOG entries are unique by gameId', () => {
    const ids = GAME_CATALOG.map((g) => g.gameId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('GAME_CATALOG color variants', () => {
  it('lists all 13 Critical card-back themes including high-altitude-hike and random', () => {
    expect(getCatalogEntry('critical_v1')?.variants).toEqual([
      'cyberpunk',
      'underwater',
      'crime',
      'horror',
      'adventure',
      'high-altitude-hike',
      'galaxy',
      'fantasy',
      'western',
      'egypt',
      'steampunk',
      'zen',
      'random',
    ]);
  });

  it('lists all 10 Sea Battle visual themes', () => {
    expect(getCatalogEntry('sea_battle_v1')?.variants).toEqual([
      'classic',
      'modern',
      'pixel',
      'cartoon',
      'cyber',
      'vintage',
      'nebula',
      'forest',
      'sunset',
      'monochrome',
    ]);
  });

  it('hasVariant accepts hyphenated ids', () => {
    expect(hasVariant('critical_v1', 'high-altitude-hike')).toBe(true);
  });
});
