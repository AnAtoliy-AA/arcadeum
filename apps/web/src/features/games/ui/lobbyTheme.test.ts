import { describe, it, expect } from 'vitest';
import { getLobbyTheme } from './lobbyTheme';

const VARIANTS = [
  { id: 'classic', lightGradient: 'gradient-classic' },
  { id: 'neon', lightGradient: 'gradient-neon' },
] as const;

const FALLBACK = 'gradient-fallback';
const BUTTON = 'gradient-button';

describe('getLobbyTheme', () => {
  it('uses the variant lightGradient when the variant exists', () => {
    expect(getLobbyTheme(VARIANTS, 'neon', FALLBACK, BUTTON)).toEqual({
      titleGradient: 'gradient-neon',
      variantGradient: 'gradient-neon',
      buttonGradient: BUTTON,
    });
  });

  it('falls back to the default gradient for unknown/undefined variants', () => {
    expect(getLobbyTheme(VARIANTS, undefined, FALLBACK, BUTTON)).toEqual({
      titleGradient: FALLBACK,
      variantGradient: FALLBACK,
      buttonGradient: BUTTON,
    });
    expect(getLobbyTheme(VARIANTS, 'missing', FALLBACK, BUTTON)).toEqual({
      titleGradient: FALLBACK,
      variantGradient: FALLBACK,
      buttonGradient: BUTTON,
    });
  });

  it('falls back when the variant has no lightGradient', () => {
    expect(getLobbyTheme([{ id: 'plain' }], 'plain', FALLBACK, BUTTON)).toEqual(
      {
        titleGradient: FALLBACK,
        variantGradient: FALLBACK,
        buttonGradient: BUTTON,
      },
    );
  });
});
