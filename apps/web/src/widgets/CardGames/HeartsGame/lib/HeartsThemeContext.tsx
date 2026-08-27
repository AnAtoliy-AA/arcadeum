'use client';

import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getTheme, type HeartsThemeTokens } from './theme';
import type { HeartsVariant } from '../types';

export const { Provider: HeartsThemeProvider, useTheme: useHeartsTheme } =
  createGameThemeContext<HeartsThemeTokens>(
    (variant) => getTheme((variant as HeartsVariant) ?? 'cyberpunk'),
    'cyberpunk',
  );
