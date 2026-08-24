'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getPachisiTheme, type PachisiTheme } from './theme';

export const { Provider: PachisiThemeProvider, useTheme: usePachisiTheme } =
  createGameThemeContext<PachisiTheme>(getPachisiTheme, 'adventure');
