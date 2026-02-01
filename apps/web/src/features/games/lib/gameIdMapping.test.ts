import { describe, it, expect } from 'vitest';
import {
  mapToGameType,
  getAllSupportedGameIds,
  isSupportedGameId,
} from './gameIdMapping';

describe('gameIdMapping', () => {
  it('maps valid game ids correctly', () => {
    expect(mapToGameType('critical_v1')).toBe('critical_v1');
  });

  it('maps legacy exploding_kittens_v1 to critical_v1', () => {
    expect(mapToGameType('exploding_kittens_v1')).toBe('critical_v1');
  });

  it('returns null for invalid or empty game ids', () => {
    expect(mapToGameType('')).toBeNull();
    expect(mapToGameType(null)).toBeNull();
    expect(mapToGameType('invalid_game')).toBeNull();
  });

  it('identifies supported game ids', () => {
    expect(isSupportedGameId('critical_v1')).toBe(true);
    expect(isSupportedGameId('unknown')).toBe(false);
  });

  it('returns all supported game ids', () => {
    const ids = getAllSupportedGameIds();
    expect(ids).toContain('critical_v1');
  });
});
