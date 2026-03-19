import { createContext, useContext } from 'react';
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
  return (
    <SeaBattleThemeContext.Provider value={getTheme(variant)}>
      {children}
    </SeaBattleThemeContext.Provider>
  );
}

export function useSeaBattleTheme(): SeaBattleTheme {
  return useContext(SeaBattleThemeContext);
}
