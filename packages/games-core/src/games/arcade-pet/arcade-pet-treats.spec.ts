import { describe, expect, it } from 'vitest';
import { GAME_TREAT_BY_GAME_ID, getGameTreat } from './arcade-pet-treats';
import { GAME_TREAT_IDS } from './arcade-pet.types';

describe('getGameTreat', () => {
  it('maps each treat game to its own treat', () => {
    expect(getGameTreat('chess_v1')).toBe('chess_cookie');
    expect(getGameTreat('sea_battle_v1')).toBe('sea_battle_fish');
    expect(getGameTreat('hearts_v1')).toBe('hearts_candy');
    expect(getGameTreat('critical_v1')).toBe('critical_pepper');
    expect(getGameTreat('pachisi_v1')).toBe('pachisi_spice');
  });

  it('never falls through to another game treat', () => {
    expect(getGameTreat('arcade_pet_v1')).toBeNull();
    expect(getGameTreat('go_v1')).toBeNull();
    expect(getGameTreat('unknown_v1')).toBeNull();
    expect(getGameTreat('')).toBeNull();
    expect(getGameTreat('constructor')).toBeNull();
    expect(getGameTreat('__proto__')).toBeNull();
  });

  it('awards every treat id from exactly one game', () => {
    const awarded = Object.values(GAME_TREAT_BY_GAME_ID).filter(
      (t): t is NonNullable<typeof t> => t !== null,
    );
    expect([...awarded].sort()).toEqual([...GAME_TREAT_IDS].sort());
  });
});
