'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getBackgammonTheme, type BackgammonTheme } from './theme';

export const {
  Provider: BackgammonThemeProvider,
  useTheme: useBackgammonTheme,
} = createGameThemeContext<BackgammonTheme>(getBackgammonTheme, 'cyberpunk');
