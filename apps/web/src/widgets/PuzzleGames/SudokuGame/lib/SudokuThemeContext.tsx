'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getSudokuTheme } from './theme';
import type { SudokuTheme } from './theme';

export const { Provider: SudokuThemeProvider, useTheme: useSudokuTheme } =
  createGameThemeContext<SudokuTheme>(getSudokuTheme, 'zen');
