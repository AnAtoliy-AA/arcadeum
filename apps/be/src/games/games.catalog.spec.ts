import {
  GAME_CATALOG,
  getCatalogEntry,
  hasTheme,
  hasVariant,
} from './games.catalog';
import { SHARED_VISUAL_THEMES } from './common/shared-themes';

describe('GAME_CATALOG', () => {
  it('includes glimworm with its themes and modes', () => {
    const entry = getCatalogEntry('glimworm_v1');
    expect(entry).toBeDefined();
    expect(entry?.themes).toEqual([...SHARED_VISUAL_THEMES]);
    expect(entry?.modes).toEqual([
      'battle_royale',
      'time_attack',
      'lives_heats',
    ]);
    expect(entry?.variants).toEqual([
      'battle_royale',
      'time_attack',
      'lives_heats',
    ]);
  });

  it('includes texas-holdem with shared themes and standard mode', () => {
    const entry = getCatalogEntry('texas_holdem_v1');
    expect(entry?.themes).toEqual([...SHARED_VISUAL_THEMES]);
    expect(entry?.variants).toEqual(['standard']);
  });

  it('hasVariant returns true only for known game/variant pairs', () => {
    expect(hasVariant('glimworm_v1', 'time_attack')).toBe(true);
    expect(hasVariant('glimworm_v1', 'nonexistent')).toBe(false);
    expect(hasVariant('critical_v1', 'time_attack')).toBe(false);
    expect(hasVariant('unknown_game', 'time_attack')).toBe(false);
  });

  it('hasTheme returns true only for valid visual themes', () => {
    expect(hasTheme('glimworm_v1', 'cyberpunk')).toBe(true);
    expect(hasTheme('critical_v1', 'high-altitude-hike')).toBe(true);
    expect(hasTheme('glimworm_v1', 'nonexistent')).toBe(false);
  });

  it('GAME_CATALOG entries are unique by gameId', () => {
    const ids = GAME_CATALOG.map((g) => g.gameId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('GAME_CATALOG separation of themes and variants', () => {
  it('lists visual themes for critical_v1', () => {
    expect(getCatalogEntry('critical_v1')?.themes).toEqual([
      ...SHARED_VISUAL_THEMES,
    ]);
  });

  it('lists Sea Battle gameplay modes under variants', () => {
    expect(getCatalogEntry('sea_battle_v1')?.variants).toEqual([
      'classic',
      'speed',
      'battle_royale',
      'team_2v2',
    ]);
  });
});
