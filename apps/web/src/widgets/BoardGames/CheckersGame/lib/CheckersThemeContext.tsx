'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getCheckersTheme, type CheckersTheme } from './theme';

export const { Provider: CheckersThemeProvider, useTheme: useCheckersTheme } =
  createGameThemeContext<CheckersTheme>(getCheckersTheme, 'cyberpunk');
