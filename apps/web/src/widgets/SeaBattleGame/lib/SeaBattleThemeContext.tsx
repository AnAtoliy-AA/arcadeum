import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { getTheme, type SeaBattleTheme } from './theme';

const SeaBattleThemeContext = createContext<SeaBattleTheme>(getTheme('classic'));

export function SeaBattleThemeProvider({
  variant,
  children,
}: {
  variant?: string;
  children: ReactNode;
}) {
  const value = useMemo(() => getTheme(variant), [variant]);
  return (
    <SeaBattleThemeContext.Provider value={value}>
      {children}
    </SeaBattleThemeContext.Provider>
  );
}

export function useSeaBattleTheme(): SeaBattleTheme {
  return useContext(SeaBattleThemeContext);
}
