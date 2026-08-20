'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface HeroThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  variant: string;
  setVariant: (variant: string) => void;
}

const HeroThemeContext = createContext<HeroThemeContextValue>({
  theme: 'cyberpunk',
  setTheme: () => {},
  variant: 'cyberpunk',
  setVariant: () => {},
});

export function HeroThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<string>('cyberpunk');
  return (
    <HeroThemeContext.Provider
      value={{
        theme,
        setTheme,
        variant: theme,
        setVariant: setTheme,
      }}
    >
      {children}
    </HeroThemeContext.Provider>
  );
}

export function useHeroTheme() {
  return useContext(HeroThemeContext);
}

export const HeroVariantProvider = HeroThemeProvider;
export const useHeroVariant = useHeroTheme;
