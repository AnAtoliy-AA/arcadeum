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
  /** Variant accent — drives the playable-card glow and hover ring. */
  accent: string;
  /** Same accent as an "r,g,b" triplet for rgba() composition. */
  accentRGB: string;
  /** Per-color card backgrounds. */
  palette: CardPalette;
  /** Per-color flavour name shown on the wild picker (e.g. "Red Giant"). */
  colorNames: CardPalette;
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
  classic: {
    SKIP: '⊘',
    REVERSE: '↻',
    DRAW_TWO: '+2',
    WILD: '★',
    WILD_DRAW_FOUR: '+4',
  },
  neon: {
    SKIP: '⚡',
    REVERSE: '↔',
    DRAW_TWO: '+2',
    WILD: '✦',
    WILD_DRAW_FOUR: '+4',
  },
  tropical: {
    SKIP: '🌺',
    REVERSE: '🔄',
    DRAW_TWO: '+2',
    WILD: '🌴',
    WILD_DRAW_FOUR: '+4',
  },
  steampunk: {
    SKIP: '⚙',
    REVERSE: '⇌',
    DRAW_TWO: '+2',
    WILD: '⚜',
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
    accent: '#a78bfa',
    accentRGB: '167,139,250',
    palette: {
      R: '#ef4444', // Red Giant
      Y: '#fbbf24', // Solar Flare
      G: '#10b981', // Nebula
      B: '#3b82f6', // Pulsar
      W: '#1f1b3d', // Singularity
    },
    colorNames: {
      R: 'Red Giant',
      Y: 'Solar Flare',
      G: 'Nebula',
      B: 'Pulsar',
      W: 'Singularity',
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
    accent: '#e879f9',
    accentRGB: '232,121,249',
    palette: {
      R: '#dc2626', // Pyromancy
      Y: '#fcd34d', // Lumen
      G: '#22c55e', // Druidic
      B: '#0ea5e9', // Hydromancy
      W: '#1a0826', // Polymorph
    },
    colorNames: {
      R: 'Pyromancy',
      Y: 'Lumen',
      G: 'Druidic',
      B: 'Hydromancy',
      W: 'Polymorph',
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
    accent: '#22d3ee',
    accentRGB: '34,211,238',
    palette: {
      R: '#f43f5e', // Crimson
      Y: '#fde047', // Voltage
      G: '#22d3ee', // Matrix (cyan-green hybrid)
      B: '#6366f1', // Cobalt
      W: '#0b1020', // Glitch
    },
    colorNames: {
      R: 'Crimson',
      Y: 'Voltage',
      G: 'Matrix',
      B: 'Cobalt',
      W: 'Glitch',
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
    accent: '#fbbf24',
    accentRGB: '251,191,36',
    palette: {
      R: '#dc2626', // Fire
      Y: '#a16207', // Stone
      G: '#16a34a', // Leaf
      B: '#2563eb', // Tide
      W: '#1c1917', // Storm
    },
    colorNames: {
      R: 'Fire',
      Y: 'Stone',
      G: 'Leaf',
      B: 'Tide',
      W: 'Storm',
    },
    symbols: SHARED_SYMBOLS.elemental,
  },
  classic: {
    variant: 'classic',
    emoji: '🃏',
    background:
      'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #172554 100%)',
    surface: 'rgba(59, 130, 246, 0.18)',
    cardBorder: 'rgba(255, 255, 255, 0.3)',
    cardText: '#f8fafc',
    accent: '#60a5fa',
    accentRGB: '96,165,250',
    palette: {
      R: '#dc2626',
      Y: '#eab308',
      G: '#16a34a',
      B: '#2563eb',
      W: '#1e293b',
    },
    colorNames: {
      R: 'Red',
      Y: 'Yellow',
      G: 'Green',
      B: 'Blue',
      W: 'Wild',
    },
    symbols: SHARED_SYMBOLS.classic,
  },
  neon: {
    variant: 'neon',
    emoji: '💜',
    background:
      'radial-gradient(circle at 50% 50%, #2e1065 0%, #0f0a1e 60%, #050214 100%)',
    surface: 'rgba(168, 85, 247, 0.2)',
    cardBorder: 'rgba(168, 85, 247, 0.5)',
    cardText: '#f5f3ff',
    accent: '#a855f7',
    accentRGB: '168,85,247',
    palette: {
      R: '#f43f5e',
      Y: '#facc15',
      G: '#22d3ee',
      B: '#818cf8',
      W: '#1a0533',
    },
    colorNames: {
      R: 'Hot Pink',
      Y: 'Laser',
      G: 'Cyan',
      B: 'Indigo',
      W: 'Void',
    },
    symbols: SHARED_SYMBOLS.neon,
  },
  tropical: {
    variant: 'tropical',
    emoji: '🏖️',
    background:
      'radial-gradient(circle at 30% 70%, #065f46 0%, #0e7490 50%, #164e63 100%)',
    surface: 'rgba(20, 184, 166, 0.18)',
    cardBorder: 'rgba(255, 255, 255, 0.25)',
    cardText: '#f0fdfa',
    accent: '#14b8a6',
    accentRGB: '20,184,166',
    palette: {
      R: '#ef4444',
      Y: '#f59e0b',
      G: '#22c55e',
      B: '#0ea5e9',
      W: '#134e4a',
    },
    colorNames: {
      R: 'Hibiscus',
      Y: 'Sunshine',
      G: 'Palm',
      B: 'Ocean',
      W: 'Tide',
    },
    symbols: SHARED_SYMBOLS.tropical,
  },
  steampunk: {
    variant: 'steampunk',
    emoji: '⚙️',
    background:
      'radial-gradient(circle at 40% 40%, #78350f 0%, #451a03 60%, #1c1917 100%)',
    surface: 'rgba(180, 83, 9, 0.2)',
    cardBorder: 'rgba(217, 119, 6, 0.45)',
    cardText: '#fef3c7',
    accent: '#d97706',
    accentRGB: '217,119,6',
    palette: {
      R: '#b91c1c',
      Y: '#ca8a04',
      G: '#15803d',
      B: '#1d4ed8',
      W: '#292524',
    },
    colorNames: {
      R: 'Boiler',
      Y: 'Brass',
      G: 'Verdigris',
      B: 'Cobalt',
      W: 'Iron',
    },
    symbols: SHARED_SYMBOLS.steampunk,
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
