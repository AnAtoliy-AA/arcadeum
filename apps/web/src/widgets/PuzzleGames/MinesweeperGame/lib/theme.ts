import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToMinesweeper } from './theme-adapter';
import type { MinesweeperTheme } from './theme-adapter';

export type { MinesweeperTheme };

const DEFAULT_THEME = sharedThemeToMinesweeper(SHARED_THEMES[0]);

export function getMinesweeperTheme(variant?: string): MinesweeperTheme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToMinesweeper(shared);
  return DEFAULT_THEME;
}
