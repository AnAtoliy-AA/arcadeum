import { describe, it, expect } from 'vitest';
import { getRoleTierColor, getRoleGlyph } from './roles';

describe('PlayerAvatar roles', () => {
  it('returns tier colors for prestige roles', () => {
    expect(getRoleTierColor('premium')).toBe('#fbbf24');
    expect(getRoleTierColor('vip')).toBe('#e879f9');
    expect(getRoleTierColor('supporter')).toBe('#f472b6');
  });

  it('returns null for non-prestige or missing roles', () => {
    expect(getRoleTierColor('free')).toBeNull();
    expect(getRoleTierColor('moderator')).toBeNull();
    expect(getRoleTierColor(null)).toBeNull();
    expect(getRoleTierColor(undefined)).toBeNull();
  });

  it('returns a glyph only for prestige roles', () => {
    expect(getRoleGlyph('vip')).toBe('💎');
    expect(getRoleGlyph('premium')).toBe('👑');
    expect(getRoleGlyph('free')).toBeNull();
    expect(getRoleGlyph(null)).toBeNull();
  });
});
