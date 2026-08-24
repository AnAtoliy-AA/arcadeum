'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getMinesweeperTheme } from './theme';
import type { MinesweeperTheme } from './theme';

export const {
  Provider: MinesweeperThemeProvider,
  useTheme: useMinesweeperTheme,
} = createGameThemeContext<MinesweeperTheme>(getMinesweeperTheme, 'zen');
