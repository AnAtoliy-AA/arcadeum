'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getArcadePetTheme, type ArcadePetThemeTokens } from './theme';

export const { Provider: ArcadePetThemeProvider, useTheme: useArcadePetTheme } =
  createGameThemeContext<ArcadePetThemeTokens>(getArcadePetTheme, 'retro');
