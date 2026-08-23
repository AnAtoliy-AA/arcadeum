'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getGoTheme } from './theme';
import type { GoTheme } from './theme-adapter';

export const { Provider: GoThemeProvider, useTheme: useGoTheme } =
  createGameThemeContext<GoTheme>(getGoTheme, 'adventure');
