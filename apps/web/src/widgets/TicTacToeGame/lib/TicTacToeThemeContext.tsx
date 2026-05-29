'use client';

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getTicTacToeTheme, type TicTacToeTheme } from './theme';

const TicTacToeThemeContext = createContext<TicTacToeTheme>(
  getTicTacToeTheme('classic'),
);

export function TicTacToeThemeProvider({
  variant,
  children,
}: {
  variant?: string;
  children: ReactNode;
}) {
  const value = useMemo(() => getTicTacToeTheme(variant), [variant]);
  return (
    <TicTacToeThemeContext.Provider value={value}>
      {children}
    </TicTacToeThemeContext.Provider>
  );
}

export function useTicTacToeTheme(): TicTacToeTheme {
  return useContext(TicTacToeThemeContext);
}
