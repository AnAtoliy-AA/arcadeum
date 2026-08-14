'use client';

import { useTheme } from 'tamagui';
import { buildContactStyles, type ContactStyles } from './ContactView.styles';

type ThemeRecord = Record<string, { val?: string; get?: () => string }>;

export function useContactStyles(): ContactStyles {
  const theme = useTheme() as unknown as ThemeRecord;
  const get = (key: string, fallback: string): string => {
    const entry = theme[key];
    return entry?.val ?? entry?.get?.() ?? fallback;
  };

  return buildContactStyles({
    accent: get('accent', '#38bdf8'),
    glassBorder: get('glassBorder', 'rgba(255,255,255,0.1)'),
    glassBg: get('glassBg', 'rgba(15,17,18,0.8)'),
    background: get('background', '#151718'),
    color: get('color', '#ecefee'),
    textSecondary: get('textSecondary', '#8e9196'),
  });
}
