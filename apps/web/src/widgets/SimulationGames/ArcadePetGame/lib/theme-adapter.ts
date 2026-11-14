import type { GameTheme } from '@/features/games/lib/shared-themes';
import type { ArcadePetThemeTokens } from '../types';

export function sharedThemeToArcadePet(theme: GameTheme): ArcadePetThemeTokens {
  const isCyber = theme.id === 'cyberpunk';
  const isZen = theme.id === 'zen';
  const isUnderwater = theme.id === 'underwater';

  if (isCyber) {
    return {
      shellBg: '#090d16',
      shellBorder: '#00f0ff',
      screenBg: '#04161a',
      pixelColor: '#00ffcc',
      pixelDim: '#00332a',
      buttonA: '#ff007f',
      buttonB: '#00f0ff',
      buttonC: '#ffe600',
      accent: '#00ffcc',
      textColor: '#e0fbfb',
      glow: 'rgba(0, 240, 255, 0.4)',
    };
  }

  if (isZen) {
    return {
      shellBg: '#2a2b28',
      shellBorder: '#a3b18a',
      screenBg: '#dad7cd',
      pixelColor: '#344e41',
      pixelDim: '#b5c0ad',
      buttonA: '#588157',
      buttonB: '#3a5a40',
      buttonC: '#a3b18a',
      accent: '#344e41',
      textColor: '#243329',
      glow: 'rgba(163, 177, 138, 0.3)',
    };
  }

  if (isUnderwater) {
    return {
      shellBg: '#06202e',
      shellBorder: '#38bdf8',
      screenBg: '#0c3547',
      pixelColor: '#7dd3fc',
      pixelDim: '#0e4a66',
      buttonA: '#0284c7',
      buttonB: '#38bdf8',
      buttonC: '#06b6d4',
      accent: '#38bdf8',
      textColor: '#e0f2fe',
      glow: 'rgba(56, 189, 248, 0.35)',
    };
  }

  return {
    shellBg: theme.colors.surface,
    shellBorder: theme.colors.border,
    screenBg: '#8ea171',
    pixelColor: '#1d2a14',
    pixelDim: '#7d8e63',
    buttonA: theme.colors.playerPalette[0] ?? theme.colors.primary,
    buttonB: theme.colors.playerPalette[1] ?? theme.colors.accent,
    buttonC: theme.colors.highlight ?? '#eab308',
    accent: theme.colors.primary,
    textColor: theme.colors.text,
    glow: `rgba(0, 0, 0, 0.25)`,
  };
}
