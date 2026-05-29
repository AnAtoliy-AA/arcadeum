import type { ActiveColor, CardColor, CascadeVariant } from '../types';

export interface CardPalette {
  R: string;
  Y: string;
  G: string;
  B: string;
  W: string;
}

export interface CascadeThemeTokens {
  variant: CascadeVariant;
  emoji: string;
  /** Outer background gradient used inside the widget container. */
  background: string;
  /** Surface color for the discard pile / draw pile platform. */
  surface: string;
  /** Border color for cards. */
  cardBorder: string;
  /** Text color on cards. */
  cardText: string;
  /** Per-color card backgrounds. */
  palette: CardPalette;
  /** Localized symbol per action card kind. */
  symbols: {
    SKIP: string;
    REVERSE: string;
    DRAW_TWO: string;
    WILD: string;
    WILD_DRAW_FOUR: string;
  };
}

const SHARED_SYMBOLS = {
  cosmic: {
    SKIP: '◐',
    REVERSE: '↻',
    DRAW_TWO: '+2',
    WILD: '★',
    WILD_DRAW_FOUR: '+4',
  },
  arcane: {
    SKIP: '⊘',
    REVERSE: '↺',
    DRAW_TWO: '+2',
    WILD: '✦',
    WILD_DRAW_FOUR: '+4',
  },
  cyberpunk: {
    SKIP: '⛔',
    REVERSE: '↔',
    DRAW_TWO: '+2',
    WILD: '◆',
    WILD_DRAW_FOUR: '+4',
  },
  elemental: {
    SKIP: '🛑',
    REVERSE: '↻',
    DRAW_TWO: '+2',
    WILD: '✺',
    WILD_DRAW_FOUR: '+4',
  },
} as const;

export const THEMES: Record<CascadeVariant, CascadeThemeTokens> = {
  cosmic: {
    variant: 'cosmic',
    emoji: '🌌',
    background:
      'radial-gradient(circle at 20% 20%, #312e81 0%, #0c0a1e 60%, #050314 100%)',
    surface: 'rgba(124, 58, 237, 0.16)',
    cardBorder: 'rgba(255, 255, 255, 0.18)',
    cardText: '#f8fafc',
    palette: {
      R: '#ef4444', // Red Giant
      Y: '#fbbf24', // Solar Flare
      G: '#10b981', // Nebula
      B: '#3b82f6', // Pulsar
      W: '#1f1b3d', // Singularity
    },
    symbols: SHARED_SYMBOLS.cosmic,
  },
  arcane: {
    variant: 'arcane',
    emoji: '✨',
    background:
      'radial-gradient(circle at 30% 30%, #581c87 0%, #1e293b 60%, #0f172a 100%)',
    surface: 'rgba(217, 70, 239, 0.18)',
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    cardText: '#fef3c7',
    palette: {
      R: '#dc2626', // Pyromancy
      Y: '#fcd34d', // Lumen
      G: '#22c55e', // Druidic
      B: '#0ea5e9', // Hydromancy
      W: '#1a0826', // Polymorph
    },
    symbols: SHARED_SYMBOLS.arcane,
  },
  cyberpunk: {
    variant: 'cyberpunk',
    emoji: '💾',
    background:
      'radial-gradient(circle at 80% 20%, #be185d 0%, #0f172a 60%, #020617 100%)',
    surface: 'rgba(8, 145, 178, 0.22)',
    cardBorder: 'rgba(34, 211, 238, 0.6)',
    cardText: '#ecfeff',
    palette: {
      R: '#f43f5e', // Crimson
      Y: '#fde047', // Voltage
      G: '#22d3ee', // Matrix (cyan-green hybrid)
      B: '#6366f1', // Cobalt
      W: '#0b1020', // Glitch
    },
    symbols: SHARED_SYMBOLS.cyberpunk,
  },
  elemental: {
    variant: 'elemental',
    emoji: '🍃',
    background:
      'radial-gradient(circle at 50% 30%, #166534 0%, #1e3a8a 60%, #0c0a09 100%)',
    surface: 'rgba(202, 138, 4, 0.16)',
    cardBorder: 'rgba(255, 247, 237, 0.25)',
    cardText: '#f8fafc',
    palette: {
      R: '#dc2626', // Fire
      Y: '#a16207', // Stone
      G: '#16a34a', // Leaf
      B: '#2563eb', // Tide
      W: '#1c1917', // Storm
    },
    symbols: SHARED_SYMBOLS.elemental,
  },
};

export function getTheme(variant: CascadeVariant): CascadeThemeTokens {
  return THEMES[variant] ?? THEMES.cosmic;
}

export function colorHex(
  variant: CascadeVariant,
  color: CardColor | ActiveColor,
): string {
  return getTheme(variant).palette[color as CardColor];
}
