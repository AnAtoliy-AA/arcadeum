'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getTicTacToeTheme, type TicTacToeThemeTokens } from './theme';

export const { Provider: TicTacToeThemeProvider, useTheme: useTicTacToeTheme } =
  createGameThemeContext<TicTacToeThemeTokens>(getTicTacToeTheme, 'cyberpunk');
