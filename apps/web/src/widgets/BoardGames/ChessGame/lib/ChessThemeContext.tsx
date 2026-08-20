'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getChessTheme, type ChessTheme } from './theme';

export const { Provider: ChessThemeProvider, useTheme: useChessTheme } =
  createGameThemeContext<ChessTheme>(getChessTheme, 'cyberpunk');
