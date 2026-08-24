'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getGame2048Theme } from './theme';
import type { Game2048Theme } from './theme';

export const {
  Provider: Game2048ThemeProvider,
  useTheme: useGame2048Theme,
} = createGameThemeContext<Game2048Theme>(getGame2048Theme, 'zen');
