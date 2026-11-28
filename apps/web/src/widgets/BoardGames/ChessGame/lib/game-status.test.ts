import { describe, it, expect } from 'vitest';
import { isChessDraw, resolveChessThemeVariant } from './game-status';

const noDraw = {
  isStalemate: false,
  isDrawByRepetition: false,
  isDrawByFiftyMoveRule: false,
  isInsufficientMaterial: false,
  isDrawByAgreement: false,
};

describe('isChessDraw', () => {
  it('is false for a decisive or ongoing game', () => {
    expect(isChessDraw(noDraw)).toBe(false);
    expect(isChessDraw(null)).toBe(false);
  });

  it.each([
    'isStalemate',
    'isDrawByRepetition',
    'isDrawByFiftyMoveRule',
    'isInsufficientMaterial',
    'isDrawByAgreement',
    'isDrawByTimeout',
  ] as const)('is true when %s is set', (flag) => {
    expect(isChessDraw({ ...noDraw, [flag]: true })).toBe(true);
  });
});

describe('resolveChessThemeVariant', () => {
  it('prefers theme, then cardVariant, then variant', () => {
    expect(resolveChessThemeVariant({ theme: 'neon', variant: 'x' })).toBe(
      'neon',
    );
    expect(resolveChessThemeVariant({ cardVariant: 'horror' })).toBe('horror');
    expect(resolveChessThemeVariant({ variant: 'atomic' })).toBe('atomic');
  });

  it('falls back to cyberpunk for missing or non-string values', () => {
    expect(resolveChessThemeVariant(undefined)).toBe('cyberpunk');
    expect(resolveChessThemeVariant({ theme: 42 })).toBe('cyberpunk');
  });
});
