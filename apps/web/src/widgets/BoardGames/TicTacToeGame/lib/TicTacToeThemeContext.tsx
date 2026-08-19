'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getTicTacToeTheme, type TicTacToeTheme } from './theme';

export const { Provider: TicTacToeThemeProvider, useTheme: useTicTacToeTheme } =
  createGameThemeContext<TicTacToeTheme>(getTicTacToeTheme, 'classic');
