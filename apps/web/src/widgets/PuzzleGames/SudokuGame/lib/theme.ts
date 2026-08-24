import {
  getThemeById,
  SHARED_THEMES,
} from '@/features/games/lib/shared-themes';
import { sharedThemeToSudoku } from './theme-adapter';
import type { SudokuTheme } from './theme-adapter';

export type { SudokuTheme };

const DEFAULT_THEME = sharedThemeToSudoku(SHARED_THEMES[0]);

export function getSudokuTheme(variant?: string): SudokuTheme {
  if (!variant) return DEFAULT_THEME;
  const shared = getThemeById(variant);
  if (shared) return sharedThemeToSudoku(shared);
  return DEFAULT_THEME;
}
