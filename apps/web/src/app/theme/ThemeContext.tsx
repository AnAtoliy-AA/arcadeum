'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

import { useThemeStore } from './store/themeStore';
import {
  ThemeName,
  ThemePreference,
  ThemeTokens,
  themeTokens,
} from '@/shared/config/theme';

type ThemeContextValue = {
  themePreference: ThemePreference;
  resolvedTheme: ThemeName;
  setThemePreference: (preference: ThemePreference) => void;
};

type SystemThemeName = Extract<ThemeName, 'light' | 'dark'>;

const SYSTEM_THEME_FALLBACK: SystemThemeName = 'dark';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function useSystemTheme(): SystemThemeName {
  const [systemTheme, setSystemTheme] = useState<SystemThemeName>(
    SYSTEM_THEME_FALLBACK,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = (matches: boolean) => {
      setSystemTheme(matches ? 'dark' : 'light');
    };

    apply(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      apply(event.matches);
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }

    // Safari < 14 fallback
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, []);

  return systemTheme;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { themePreference, setThemePreference } = useThemeStore();
  const systemTheme = useSystemTheme();

  const resolvedTheme: ThemeName = useMemo(() => {
    if (themePreference === 'system') {
      return systemTheme;
    }
    return themePreference;
  }, [systemTheme, themePreference]);

  const theme: ThemeTokens = useMemo(
    () => themeTokens[resolvedTheme],
    [resolvedTheme],
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-theme-preference', themePreference);
    root.style.setProperty('--background', theme.background.base);
    root.style.setProperty('--foreground', theme.text.primary);
    root.style.setProperty('--muted-foreground', theme.text.muted);
    root.style.setProperty('--card-background', theme.surfaces.card.background);
    root.style.setProperty('--card-border', theme.surfaces.card.border);
    root.style.setProperty(
      '--surface-background',
      theme.surfaces.panel.background,
    );

    if (document.body) {
      document.body.style.backgroundColor = theme.background.base;
      document.body.style.color = theme.text.primary;
    }
  }, [resolvedTheme, theme, themePreference]);

  // Sync legacy storage if needed, or just rely on store persistence.
  // The store handles persistence now.

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ themePreference, resolvedTheme, setThemePreference }),
    [themePreference, resolvedTheme, setThemePreference],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeController(): ThemeContextValue {
  // We can return store values directly or keep context.
  // Keeping context allows us to avoid refactoring all call sites that might expect a Provider content,
  // although Zustand can be used anywhere.
  // For now, let's keep the Provider wrapping but feed it from the store,
  // so consumers of useThemeController get the store values.
  // Actually, to fully migrate, we should eventually remove the Context,
  // but to be safe and incremental, feeding the context from the store is a good step.
  // However, pure Zustand usage would be: const { ... } = useThemeStore()
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeController must be used within AppThemeProvider');
  }

  return context;
}
