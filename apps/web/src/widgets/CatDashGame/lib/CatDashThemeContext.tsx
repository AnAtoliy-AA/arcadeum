'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { CatDashVariant } from '../types';
import { getTheme, type CatDashThemeTokens } from './theme';

interface CatDashThemeContextValue {
  variant: CatDashVariant;
  tokens: CatDashThemeTokens;
}

const CatDashThemeContext = createContext<CatDashThemeContextValue | null>(
  null,
);

export function CatDashThemeProvider({
  variant,
  children,
}: {
  variant: CatDashVariant;
  children: ReactNode;
}) {
  const tokens = useMemo(() => getTheme(variant), [variant]);
  const value = useMemo(() => ({ variant, tokens }), [variant, tokens]);

  return (
    <CatDashThemeContext.Provider value={value}>
      {children}
    </CatDashThemeContext.Provider>
  );
}

export function useCatDashTheme(): CatDashThemeContextValue {
  const ctx = useContext(CatDashThemeContext);
  if (!ctx) {
    return { variant: 'neon', tokens: getTheme('neon') };
  }
  return ctx;
}
