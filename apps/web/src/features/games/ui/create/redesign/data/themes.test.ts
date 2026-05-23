import { describe, it, expect } from 'vitest';
import {
  CRITICAL_THEMES,
  SEA_BATTLE_THEMES,
  GAMES,
  themesFor,
  findCriticalTheme,
  findSeaBattleTheme,
} from './themes';

describe('themes registry', () => {
  it('GAMES enumerates the three visible games with correct expansion/theme flags', () => {
    expect(GAMES.critical_v1.hasExpansion).toBe(true);
    expect(GAMES.critical_v1.hasThemes).toBe(true);
    expect(GAMES.sea_battle_v1.hasExpansion).toBe(false);
    expect(GAMES.sea_battle_v1.hasThemes).toBe(true);
    expect(GAMES.glimworm_v1.hasExpansion).toBe(false);
    expect(GAMES.glimworm_v1.hasThemes).toBe(false);
  });

  it('Critical theme IDs match the canonical CARD_VARIANTS slugs so the API call stays compatible', () => {
    const ids = CRITICAL_THEMES.map((t) => t.id);
    expect(ids).toContain('cyberpunk');
    expect(ids).toContain('underwater');
    expect(ids).toContain('crime');
    expect(ids).toContain('horror');
    expect(ids).toContain('adventure');
    expect(ids).toContain('high-altitude-hike');
  });

  it('Sea Battle theme IDs match the canonical SeaBattleVariant slugs', () => {
    const ids = SEA_BATTLE_THEMES.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it('themesFor returns the correct list per game', () => {
    expect(themesFor('critical_v1')).toBe(CRITICAL_THEMES);
    expect(themesFor('sea_battle_v1')).toBe(SEA_BATTLE_THEMES);
    expect(themesFor('glimworm_v1')).toEqual([]);
  });

  it('findCriticalTheme falls back to the first entry when the id is unknown', () => {
    expect(findCriticalTheme('nope').id).toBe(CRITICAL_THEMES[0].id);
    expect(findCriticalTheme(undefined).id).toBe(CRITICAL_THEMES[0].id);
    expect(findCriticalTheme('horror').id).toBe('horror');
  });

  it('findSeaBattleTheme falls back to the first entry when the id is unknown', () => {
    expect(findSeaBattleTheme('nope').id).toBe(SEA_BATTLE_THEMES[0].id);
    expect(findSeaBattleTheme(undefined).id).toBe(SEA_BATTLE_THEMES[0].id);
    expect(findSeaBattleTheme('nebula').id).toBe('nebula');
  });
});
