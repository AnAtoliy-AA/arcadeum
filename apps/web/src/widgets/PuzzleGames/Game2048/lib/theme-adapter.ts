import type { GameTheme } from '@/features/games/lib/shared-themes';

export interface Game2048Theme {
  /** Page backdrop behind the whole board. */
  background: string;
  /** Panel the grid sits on. */
  boardBackground: string;
  boardBorder: string;
  /** Empty cell slot fill. */
  emptyCell: string;
  /** Tile fills from low to high values (index = exponent of 2, capped). */
  tileColors: readonly string[];
  tileTextLight: string;
  tileTextDark: string;
  /** Accent for the newly spawned/highest tile glow. */
  glow: string;
  textColor: string;
  borderRadius: string;
  bgImage?: string;
}

/**
 * Classic-feel tile ladder. Low tiles are warm creams with dark text;
 * higher tiles shift through golds into deep oranges/reds with light text.
 * Static palette by design (see AGENTS.md — static palettes are literals).
 */
const TILE_COLORS = [
  '#eee4da', // 2
  '#ede0c8', // 4
  '#f2b179', // 8
  '#f59563', // 16
  '#f67c5f', // 32
  '#f65e3b', // 64
  '#edcf72', // 128
  '#edcc61', // 256
  '#edc850', // 512
  '#edc53f', // 1024
  '#edc22e', // 2048+
] as const;

/** Tiles at or above this value render with light text. */
const LIGHT_TEXT_FROM = 8;

export function tileColor(value: number): string {
  if (value <= 0) return 'transparent';
  const index = Math.min(
    Math.log2(value) - 1,
    TILE_COLORS.length - 1,
  );
  return TILE_COLORS[Math.max(index, 0)];
}

export function tileTextColor(value: number): string {
  return value >= LIGHT_TEXT_FROM ? '#f9f6f2' : '#776e65';
}

export function sharedThemeToGame2048(theme: GameTheme): Game2048Theme {
  return {
    background: `linear-gradient(160deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    boardBackground: `rgba(${hexToRgb(theme.colors.surface)}, 0.85)`,
    boardBorder: theme.colors.border,
    emptyCell: `rgba(${hexToRgb(theme.colors.text)}, 0.08)`,
    tileColors: TILE_COLORS,
    tileTextLight: '#f9f6f2',
    tileTextDark: '#776e65',
    glow: theme.colors.glow,
    textColor: theme.colors.text,
    borderRadius: '8px',
    bgImage: theme.bgImage,
  };
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const value =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = Number.parseInt(value, 16);
  if (Number.isNaN(num)) return '99, 102, 241';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
