'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { TamaguiProvider } from 'tamagui';

import { useThemeStore } from './store/themeStore';
import {
  ThemeName,
  ThemePreference,
  ThemeTokens,
  themeTokens,
} from '@/shared/config/theme';
import tamaguiConfig from '@/shared/config/tamagui.config';

type ThemeContextValue = {
  themePreference: ThemePreference;
  resolvedTheme: ThemeName;
  setThemePreference: (preference: ThemePreference) => void;
};

type SystemThemeName = Extract<ThemeName, 'light' | 'dark'>;

const SYSTEM_THEME_FALLBACK: SystemThemeName = 'dark';

const THEME_CONTEXT_SYMBOL = Symbol.for('arcadeum.themeContext');

// Use a separate type to avoid 'any'
type GlobalWithThemeContext = typeof globalThis & {
  [THEME_CONTEXT_SYMBOL]?: React.Context<ThemeContextValue | undefined>;
};

const globalWithContext = globalThis as GlobalWithThemeContext;

if (!globalWithContext[THEME_CONTEXT_SYMBOL]) {
  globalWithContext[THEME_CONTEXT_SYMBOL] = createContext<
    ThemeContextValue | undefined
  >(undefined);
}

const ThemeContext = globalWithContext[THEME_CONTEXT_SYMBOL] as React.Context<
  ThemeContextValue | undefined
>;

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

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function AppThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: ThemeName;
}) {
  const { themePreference, setThemePreference } = useThemeStore();
  const systemTheme = useSystemTheme();
  const isReady = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-app-ready', 'true');
    }
  }, []);

  const resolvedTheme: ThemeName = useMemo(() => {
    // Return initialTheme during hydration to match server exactly
    if (!isReady) return initialTheme || 'dark';

    if (themePreference === 'system') {
      return systemTheme;
    }
    return themePreference;
  }, [systemTheme, themePreference, isReady, initialTheme]);

  const theme: ThemeTokens = useMemo(
    () => themeTokens[resolvedTheme],
    [resolvedTheme],
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const doc = document.documentElement;
    const currentTheme = doc.getAttribute('data-theme');
    const currentPreference = doc.getAttribute('data-theme-preference');

    // Ensure both attributes and class are present
    if (
      currentTheme === resolvedTheme &&
      currentPreference === themePreference &&
      doc.classList.contains(`t_${resolvedTheme}`)
    ) {
      return;
    }

    doc.setAttribute('data-theme', resolvedTheme);
    doc.setAttribute('data-theme-preference', themePreference);

    // Clean up body classes (Tamagui or legacy injections)
    if (document.body) {
      const bodyClasses = Array.from(document.body.classList);
      bodyClasses.forEach((c) => {
        if (c.startsWith('t_')) document.body.classList.remove(c);
      });
    }

    // Update classes on html element only
    const currentClasses = Array.from(doc.classList);
    const themeClasses = currentClasses.filter((c) => c.startsWith('t_'));

    if (
      !doc.classList.contains(`t_${resolvedTheme}`) ||
      themeClasses.length > 1
    ) {
      themeClasses.forEach((c) => doc.classList.remove(c));
      doc.classList.add(`t_${resolvedTheme}`);
    }

    doc.style.setProperty('--background', theme.background.base);
    doc.style.setProperty('--foreground', theme.text.primary);
    doc.style.setProperty('--muted-foreground', theme.text.muted);
    doc.style.setProperty('--card-background', theme.surfaces.card.background);
    doc.style.setProperty('--card-border', theme.surfaces.card.border);
    doc.style.setProperty(
      '--surface-background',
      theme.surfaces.panel.background,
    );
    doc.style.setProperty(
      '--primary-gradient-start',
      theme.buttons.primary.gradientStart,
    );
    doc.style.setProperty('--glass-background', theme.glass.background);
    doc.style.setProperty('--glass-border', theme.glass.border);

    doc.style.backgroundColor = theme.background.base;
    doc.style.color = theme.text.primary;

    const cookieOptions = 'path=/; max-age=31536000; SameSite=Lax';
    document.cookie = `app-theme=${resolvedTheme}; ${cookieOptions}`;
    document.cookie = `app-theme-preference=${themePreference}; ${cookieOptions}`;
  }, [resolvedTheme, theme, themePreference]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ themePreference, resolvedTheme, setThemePreference }),
    [themePreference, resolvedTheme, setThemePreference],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={resolvedTheme || initialTheme || 'dark'}
        disableInjectCSS
      >
        {children}
      </TamaguiProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeController(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeController must be used within AppThemeProvider');
  }

  return context;
}
