import type { GameTheme } from '@/features/games/lib/shared-themes';

export interface GoTheme {
  background: string;
  boardBackground: string;
  gridLine: string;
  cellBg: string;
  cellHoverBg: string;
  blackStone: string;
  whiteStone: string;
  stoneBorder: string;
  lastMoveMarker: string;
  textColor: string;
  borderRadius: string;
  bgImage?: string;
}

export function sharedThemeToGo(theme: GameTheme): GoTheme {
  return {
    background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
    boardBackground: theme.colors.surface,
    gridLine: theme.colors.border,
    cellBg: 'transparent',
    cellHoverBg: `${theme.colors.glow}55`,
    blackStone: '#111318',
    whiteStone: '#f4f5f7',
    stoneBorder: 'rgba(0, 0, 0, 0.55)',
    lastMoveMarker: theme.colors.highlight,
    textColor: theme.colors.text,
    borderRadius: '12px',
    bgImage: theme.bgImage,
  };
}
