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

  it('includes critical, sea-battle, texas-holdem without variants', () => {
    expect(getCatalogEntry('critical_v1')?.variants).toEqual([]);
    expect(getCatalogEntry('sea_battle_v1')?.variants).toEqual([]);
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
