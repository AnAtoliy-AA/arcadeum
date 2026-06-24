'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getTheme, type CascadeThemeTokens } from './theme';
import type { CascadeVariant } from '../types';

export const { Provider: CascadeThemeProvider, useTheme: useCascadeTheme } =
  createGameThemeContext<CascadeThemeTokens>(
    (variant) => getTheme((variant as CascadeVariant) ?? 'cosmic'),
    'cosmic',
  );
