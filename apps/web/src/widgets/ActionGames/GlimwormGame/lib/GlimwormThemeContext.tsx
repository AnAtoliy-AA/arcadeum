'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getGlimwormTheme, type GlimwormTheme } from './theme';

export const { Provider: GlimwormThemeProvider, useTheme: useGlimwormTheme } =
  createGameThemeContext<GlimwormTheme>(getGlimwormTheme, 'cyberpunk');
