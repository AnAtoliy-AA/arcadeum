import { describe, it, expect } from 'vitest';
import {
  VISION_MODES,
  DEFAULT_VISION_MODE,
  isVisionMode,
  isDichromacyMode,
  transformCssColors,
  applyVisionModeToGameTheme,
} from './colorblind';

const RED = '#ff0000';
const GREEN = '#00ff00';
const BLUE = '#0000ff';

function hexToRgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function euclidean(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

describe('vision mode types', () => {
  it('exposes the five supported modes with "none" as default', () => {
    expect(VISION_MODES).toEqual([
      'none',
      'deuteranopia',
      'protanopia',
      'tritanopia',
      'highContrast',
    ]);
    expect(DEFAULT_VISION_MODE).toBe('none');
  });

  it('validates vision modes', () => {
    expect(isVisionMode('tritanopia')).toBe(true);
    expect(isVisionMode('none')).toBe(true);
    expect(isVisionMode('grayscale')).toBe(false);
    expect(isVisionMode(null)).toBe(false);
    expect(isVisionMode(undefined)).toBe(false);
    expect(isVisionMode(42)).toBe(false);
  });

  it('classifies dichromacy modes', () => {
    expect(isDichromacyMode('deuteranopia')).toBe(true);
    expect(isDichromacyMode('protanopia')).toBe(true);
    expect(isDichromacyMode('tritanopia')).toBe(true);
    expect(isDichromacyMode('none')).toBe(false);
    expect(isDichromacyMode('highContrast')).toBe(false);
  });
});

describe('transformCssColors', () => {
  it.each(['none', 'highContrast'] as const)(
    'returns the value untouched for %s',
    (mode) => {
      const value =
        'linear-gradient(135deg, #ff0000 0%, rgba(0, 255, 0, 0.5) 100%)';
      expect(transformCssColors(value, mode)).toBe(value);
    },
  );

  it.each(['deuteranopia', 'protanopia', 'tritanopia'] as const)(
    'preserves grays, white, and black under %s',
    (mode) => {
      expect(transformCssColors('#808080', mode)).toBe('#808080');
      expect(transformCssColors('#ffffff', mode)).toBe('#ffffff');
      expect(transformCssColors('#000000', mode)).toBe('#000000');
      expect(transformCssColors('rgb(200, 200, 200)', mode)).toBe(
        'rgb(200, 200, 200)',
      );
    },
  );

  it('separates pure red and green under deuteranopia', () => {
    const outRed = transformCssColors(RED, 'deuteranopia');
    const outGreen = transformCssColors(GREEN, 'deuteranopia');
    expect(outRed).not.toBe(RED);
    expect(outGreen).not.toBe(GREEN);
    // Confusable inputs must land far apart in the corrected palette.
    expect(euclidean(outRed, outGreen)).toBeGreaterThan(100);
  });

  it('keeps blue distinct from red/green under deuteranopia', () => {
    const outBlue = transformCssColors(BLUE, 'deuteranopia');
    expect(
      euclidean(outBlue, transformCssColors(RED, 'deuteranopia')),
    ).toBeGreaterThan(60);
  });

  it('moves blue away from its hue under tritanopia so blue/yellow separate', () => {
    const outBlue = hexToRgb(transformCssColors(BLUE, 'tritanopia'));
    const outYellow = transformCssColors('#ffff00', 'tritanopia');
    // Blue collapses onto the teal axis (green channel rises).
    expect(outBlue[1]).toBeGreaterThan(outBlue[2]);
    expect(
      euclidean(transformCssColors(BLUE, 'tritanopia'), outYellow),
    ).toBeGreaterThan(100);
  });

  it('preserves hex format and drops nothing', () => {
    expect(transformCssColors(GREEN, 'protanopia')).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('preserves alpha for #rrggbbaa colors', () => {
    const out = transformCssColors('#ff000040', 'deuteranopia');
    expect(out).toMatch(/^#[0-9a-f]{8}$/);
    expect(out.slice(7)).toBe('40');
  });

  it('preserves the rgba() function form and its alpha', () => {
    const out = transformCssColors('rgba(255, 0, 0, 0.5)', 'deuteranopia');
    expect(out).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
    expect(out.startsWith('rgb(')).toBe(false);
  });

  it('emits rgb() without alpha for opaque function colors', () => {
    const out = transformCssColors('rgb(255, 0, 0)', 'deuteranopia');
    expect(out).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  it('supports modern space-separated rgb syntax with slash alpha', () => {
    const out = transformCssColors('rgb(255 0 0 / 0.25)', 'deuteranopia');
    expect(out).toMatch(/^rgba\(\d+, \d+, \d+, 0\.25\)$/);
  });

  it('supports percentage channels', () => {
    const out = transformCssColors('rgb(100%, 0%, 0%)', 'deuteranopia');
    expect(out).not.toBe('rgb(100%, 0%, 0%)');
  });

  it('transforms every color inside a gradient while keeping structure', () => {
    const input = 'linear-gradient(135deg, #ff0000 0%, #00ff00 100%)';
    const out = transformCssColors(input, 'deuteranopia');
    expect(out.startsWith('linear-gradient(135deg,')).toBe(true);
    expect(out.endsWith('100%)')).toBe(true);
    expect(out).not.toContain('#ff0000');
    expect(out).not.toContain('#00ff00');
  });

  it('leaves non-color strings untouched', () => {
    expect(transformCssColors('10px solid transparent', 'deuteranopia')).toBe(
      '10px solid transparent',
    );
    expect(transformCssColors('translateY(-4px)', 'protanopia')).toBe(
      'translateY(-4px)',
    );
  });
});

describe('applyVisionModeToGameTheme', () => {
  type FakeTheme = {
    background: string;
    lightSquare: string;
    darkSquare: string;
    playerPalette: string[];
    nested: { glow: string; shadow: string };
    borderRadius: string;
  };

  const theme: FakeTheme = {
    background: 'linear-gradient(135deg, #151718 0%, #1a1d20 100%)',
    lightSquare: 'rgba(236, 239, 238, 0.15)',
    darkSquare: 'rgba(3, 105, 161, 0.35)',
    playerPalette: ['#ef4444', '#22c55e'],
    nested: { glow: '#a78bfa', shadow: 'rgba(0, 0, 0, 0.6)' },
    borderRadius: '10px',
  };

  it('returns the identical theme for none and highContrast', () => {
    expect(applyVisionModeToGameTheme(theme, 'none')).toBe(theme);
    expect(applyVisionModeToGameTheme(theme, 'highContrast')).toBe(theme);
  });

  it('returns a new object and never mutates the source theme', () => {
    const snapshot = JSON.stringify(theme);
    const out = applyVisionModeToGameTheme(theme, 'deuteranopia');
    expect(out).not.toBe(theme);
    expect(JSON.stringify(theme)).toBe(snapshot);
  });

  it('recolors nested strings, arrays, and gradients only', () => {
    const out = applyVisionModeToGameTheme(theme, 'deuteranopia');
    expect(out.background).not.toBe(theme.background);
    expect(out.lightSquare).not.toBe(theme.lightSquare);
    expect(out.darkSquare).not.toBe(theme.darkSquare);
    expect(out.playerPalette[0]).not.toBe(theme.playerPalette[0]);
    expect(out.playerPalette[1]).not.toBe(theme.playerPalette[1]);
    expect(out.nested.glow).not.toBe(theme.nested.glow);
    // Achromatic colors are fixed points of the matrices — preserved exactly.
    expect(out.nested.shadow).toBe('rgba(0, 0, 0, 0.6)');
    // Non-color fields pass through verbatim.
    expect(out.borderRadius).toBe('10px');
  });

  it('keeps confusable piece colors distinguishable across the palette', () => {
    const out = applyVisionModeToGameTheme(theme, 'protanopia');
    const p0 = out.playerPalette[0];
    const p1 = out.playerPalette[1];
    expect(typeof p0).toBe('string');
    expect(typeof p1).toBe('string');
    expect(p0).not.toBe(p1);
    expect(euclidean(p0, p1)).toBeGreaterThan(60);
  });
});
