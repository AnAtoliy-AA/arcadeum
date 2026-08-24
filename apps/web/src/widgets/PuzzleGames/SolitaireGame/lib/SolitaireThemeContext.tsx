'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getSolitaireTheme } from './theme';
import type { SolitaireTheme } from './theme';

export const { Provider: SolitaireThemeProvider, useTheme: useSolitaireTheme } =
  createGameThemeContext<SolitaireTheme>(getSolitaireTheme, 'zen');
