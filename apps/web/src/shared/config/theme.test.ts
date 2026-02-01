import { describe, it, expect } from 'vitest';
import {
  getThemeTokens,
  isThemeName,
  isThemePreference,
  themeTokens,
  DEFAULT_THEME_NAME,
} from './theme';

describe('theme config', () => {
  it('returns tokens for all theme names', () => {
    expect(getThemeTokens('dark')).toBe(themeTokens.dark);
    expect(getThemeTokens('light')).toBe(themeTokens.light);
    expect(getThemeTokens('neonDark')).toBe(themeTokens.neonDark);
    expect(getThemeTokens('neonLight')).toBe(themeTokens.neonLight);
  });

  it('returns default tokens for unknown theme names', () => {
    // @ts-expect-error - testing invalid input
    expect(getThemeTokens('invalid')).toBe(themeTokens[DEFAULT_THEME_NAME]);
  });

  it('identifies theme names correctly', () => {
    expect(isThemeName('dark')).toBe(true);
    expect(isThemeName('neonLight')).toBe(true);
    expect(isThemeName('system')).toBe(false);
    expect(isThemeName('red')).toBe(false);
    expect(isThemeName(null)).toBe(false);
  });

  it('identifies theme preferences correctly', () => {
    expect(isThemePreference('system')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('unknown')).toBe(false);
  });

  it('has required structure in dark theme tokens', () => {
    const tokens = themeTokens.dark;
    expect(tokens.name).toBe('dark');
    expect(tokens.background.base).toBeDefined();
    expect(tokens.text.primary).toBeDefined();
    expect(tokens.surfaces.card.background).toBeDefined();
  });
});
