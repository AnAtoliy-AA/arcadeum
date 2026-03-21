import { describe, it, expect } from 'vitest';
import {
  getThemeTokens,
  isThemeName,
  isThemePreference,
  themeTokens,
  DEFAULT_THEME_NAME,
  THEME_OPTIONS,
  ThemeName,
  ThemeTokens,
} from './index';

const ALL_THEME_NAMES: ThemeName[] = [
  'light',
  'dark',
  'neonLight',
  'neonDark',
  'violetDark',
  'violetLight',
  'tealDark',
  'tealLight',
];

function hasValidTokenStructure(tokens: ThemeTokens): void {
  // background
  expect(tokens.background.base).toBeTruthy();
  expect(tokens.background.radialStart).toBeTruthy();
  expect(tokens.background.radialEnd).toBeTruthy();

  // text
  expect(tokens.text.primary).toBeTruthy();
  expect(tokens.text.secondary).toBeTruthy();
  expect(tokens.text.muted).toBeTruthy();
  expect(tokens.text.accent).toBeTruthy();
  expect(tokens.text.accentSoft).toBeTruthy();
  expect(tokens.text.onAccent).toBeTruthy();
  expect(tokens.text.notice).toBeTruthy();

  // surfaces
  for (const surface of [
    tokens.surfaces.hero,
    tokens.surfaces.panel,
    tokens.surfaces.card,
  ]) {
    expect(surface.background).toBeTruthy();
    expect(surface.border).toBeTruthy();
    expect(surface.shadow).toBeTruthy();
  }

  // interactive.option
  expect(tokens.interactive.option.background).toBeTruthy();
  expect(tokens.interactive.option.border).toBeTruthy();
  expect(tokens.interactive.option.hoverBorder).toBeTruthy();
  expect(tokens.interactive.option.activeBackground).toBeTruthy();
  expect(tokens.interactive.option.activeBorder).toBeTruthy();
  expect(tokens.interactive.option.activeShadow).toBeTruthy();

  // interactive.pill
  expect(tokens.interactive.pill.inactiveBackground).toBeTruthy();
  expect(tokens.interactive.pill.activeBackground).toBeTruthy();
  expect(tokens.interactive.pill.border).toBeTruthy();
  expect(tokens.interactive.pill.activeBorder).toBeTruthy();
  expect(tokens.interactive.pill.hoverBorder).toBeTruthy();
  expect(tokens.interactive.pill.activeShadow).toBeTruthy();

  // interactive.download
  expect(tokens.interactive.download.background).toBeTruthy();
  expect(tokens.interactive.download.hoverBackground).toBeTruthy();
  expect(tokens.interactive.download.border).toBeTruthy();
  expect(tokens.interactive.download.hoverBorder).toBeTruthy();

  // buttons
  expect(tokens.buttons.primary.gradientStart).toBeTruthy();
  expect(tokens.buttons.primary.gradientEnd).toBeTruthy();
  expect(tokens.buttons.primary.text).toBeTruthy();
  expect(tokens.buttons.primary.shadow).toBeTruthy();
  expect(tokens.buttons.primary.hoverShadow).toBeTruthy();

  expect(tokens.buttons.secondary.background).toBeTruthy();
  expect(tokens.buttons.secondary.hoverBackground).toBeTruthy();
  expect(tokens.buttons.secondary.border).toBeTruthy();
  expect(tokens.buttons.secondary.hoverBorder).toBeTruthy();
  expect(tokens.buttons.secondary.text).toBeTruthy();

  // misc
  expect(tokens.outlines.focus).toBeTruthy();
  expect(tokens.account.cardBackground).toBeTruthy();
  expect(tokens.account.border).toBeTruthy();
  expect(tokens.copyNotice).toBeTruthy();
}

describe('themeTokens', () => {
  it('has an entry for every theme name', () => {
    for (const name of ALL_THEME_NAMES) {
      expect(themeTokens[name]).toBeDefined();
    }
  });

  it('each token set has the correct name field', () => {
    for (const name of ALL_THEME_NAMES) {
      expect(themeTokens[name].name).toBe(name);
    }
  });

  it.each(ALL_THEME_NAMES)('%s has all required token fields', (name) => {
    hasValidTokenStructure(themeTokens[name]);
  });

  it('light and dark themes have different background base colors', () => {
    expect(themeTokens.light.background.base).not.toBe(
      themeTokens.dark.background.base,
    );
  });
});

describe('getThemeTokens', () => {
  it('returns the correct tokens for every theme', () => {
    for (const name of ALL_THEME_NAMES) {
      expect(getThemeTokens(name)).toBe(themeTokens[name]);
    }
  });

  it('falls back to the default theme for an unknown value', () => {
    expect(getThemeTokens('invalid' as ThemeName)).toBe(
      themeTokens[DEFAULT_THEME_NAME],
    );
  });

  it('returns the same object reference (no cloning)', () => {
    expect(getThemeTokens('dark')).toBe(getThemeTokens('dark'));
  });
});

describe('isThemeName', () => {
  it('returns true for every valid theme name', () => {
    for (const name of ALL_THEME_NAMES) {
      expect(isThemeName(name)).toBe(true);
    }
  });

  it('returns false for "system"', () => {
    expect(isThemeName('system')).toBe(false);
  });

  it.each([null, undefined, '', 0, false, {}, 'red', 'System', 'DARK'])(
    'returns false for %s',
    (value) => {
      expect(isThemeName(value)).toBe(false);
    },
  );
});

describe('isThemePreference', () => {
  it('returns true for every theme name', () => {
    for (const name of ALL_THEME_NAMES) {
      expect(isThemePreference(name)).toBe(true);
    }
  });

  it('returns true for "system"', () => {
    expect(isThemePreference('system')).toBe(true);
  });

  it.each([null, undefined, '', 'auto', 'default'])(
    'returns false for %s',
    (value) => {
      expect(isThemePreference(value)).toBe(false);
    },
  );
});

describe('THEME_OPTIONS', () => {
  it('starts with "system"', () => {
    expect(THEME_OPTIONS[0]).toBe('system');
  });

  it('includes every theme name', () => {
    for (const name of ALL_THEME_NAMES) {
      expect(THEME_OPTIONS).toContain(name);
    }
  });

  it('has no duplicates', () => {
    expect(new Set(THEME_OPTIONS).size).toBe(THEME_OPTIONS.length);
  });

  it('contains exactly one more entry than theme names (the "system" option)', () => {
    expect(THEME_OPTIONS).toHaveLength(ALL_THEME_NAMES.length + 1);
  });

  it('every entry is a valid theme preference', () => {
    for (const option of THEME_OPTIONS) {
      expect(isThemePreference(option)).toBe(true);
    }
  });
});

describe('DEFAULT_THEME_NAME', () => {
  it('is a valid theme name', () => {
    expect(isThemeName(DEFAULT_THEME_NAME)).toBe(true);
  });

  it('has a corresponding entry in themeTokens', () => {
    expect(themeTokens[DEFAULT_THEME_NAME]).toBeDefined();
  });
});
