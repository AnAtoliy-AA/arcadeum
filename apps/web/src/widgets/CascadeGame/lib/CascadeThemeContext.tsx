'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getTheme, type CascadeThemeTokens } from './theme';
import type { CascadeVariant } from '../types';

const CascadeThemeContext = createContext<CascadeThemeTokens>(
  getTheme('cosmic'),
);

export function CascadeThemeProvider({
  variant,
  children,
}: {
  variant?: CascadeVariant | string;
  children: ReactNode;
}) {
  const value = useMemo(
    () => getTheme((variant as CascadeVariant) ?? 'cosmic'),
    [variant],
  );
  return (
    <CascadeThemeContext.Provider value={value}>
      {children}
    </CascadeThemeContext.Provider>
  );
}

export function useCascadeTheme(): CascadeThemeTokens {
  return useContext(CascadeThemeContext);
}
