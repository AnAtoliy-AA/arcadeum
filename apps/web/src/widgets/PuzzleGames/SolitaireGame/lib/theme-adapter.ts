import type { GameTheme } from '@/features/games/lib/shared-themes';

export interface SolitaireTheme {
  /** Page backdrop behind the whole table. */
  background: string;
  /** Felt surface the piles sit on. */
  tableBackground: string;
  tableBorder: string;
  /** Empty stock/waste/foundation slot fill. */
  emptySlot: string;
  emptySlotBorder: string;
  cardFace: string;
  cardFaceBorder: string;
  cardBack: string;
  cardBackBorder: string;
  redSuit: string;
  blackSuit: string;
  selectedRing: string;
  movableHint: string;
  textColor: string;
  borderRadius: string;
  bgImage?: string;
}

export function sharedThemeToSolitaire(theme: GameTheme): SolitaireTheme {
  return {
    background: `linear-gradient(160deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    tableBackground: `rgba(${hexToRgb(theme.colors.surface)}, 0.96)`,
    tableBorder: theme.colors.border,
    emptySlot: `rgba(${hexToRgb(theme.colors.background)}, 0.65)`,
    emptySlotBorder: `rgba(${hexToRgb(theme.colors.border)}, 0.55)`,
    cardFace: '#fdfdfb',
    cardFaceBorder: theme.colors.border,
    cardBack: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.glow} 100%)`,
    cardBackBorder: `rgba(${hexToRgb(theme.colors.text)}, 0.35)`,
    redSuit: '#dc2626',
    blackSuit: '#1f2937',
    selectedRing: theme.colors.glow,
    movableHint: `rgba(${hexToRgb(theme.colors.highlight)}, 0.55)`,
    textColor: theme.colors.text,
    borderRadius: '16px',
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
