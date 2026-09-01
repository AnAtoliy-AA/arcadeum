'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getTheme, type SpadesThemeTokens } from './theme';
import type { SpadesTheme } from '../types';

export const { Provider: SpadesThemeProvider, useTheme: useSpadesTheme } =
  createGameThemeContext<SpadesThemeTokens>(
    (variant) => getTheme((variant as SpadesTheme) ?? 'cyberpunk'),
    'cyberpunk',
  );
