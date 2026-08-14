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

import { useThemeStore } from './store/themeStore';
import {
  ThemeName,
  ThemePreference,
  ThemeTokens,
  themeTokens,
} from '@/shared/config/theme';
import { themeDefinitions } from '@arcadeum/ui/themeDefinitions';

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
    if (typeof window === 'undefined') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (matches: boolean) =>
      setSystemTheme(matches ? 'dark' : 'light');

    apply(media.matches);

    const listener = (event: MediaQueryListEvent) => apply(event.matches);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }

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
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const resolvedTheme: ThemeName = useMemo(() => {
    if (!isHydrated) return initialTheme || 'dark';

    if (themePreference === 'system') return systemTheme;
    return themePreference;
  }, [systemTheme, themePreference, isHydrated, initialTheme]);

  const themeTokensValue: ThemeTokens = useMemo(
    () => themeTokens[resolvedTheme],
    [resolvedTheme],
  );

  // Sync theme to document element — batch heavy DOM writes into idle callback
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const doc = document.documentElement;
    const currentTheme = doc.getAttribute('data-theme');
    const currentPreference = doc.getAttribute('data-theme-preference');

    if (
      currentTheme === resolvedTheme &&
      currentPreference === themePreference &&
      doc.classList.contains(`t_${resolvedTheme}`)
    ) {
      return;
    }

    // Fast synchronous writes — lightweight, needed immediately for FOUC prevention
    doc.setAttribute('data-theme', resolvedTheme);
    doc.setAttribute('data-theme-preference', themePreference);

    doc.classList.forEach((c) => {
      if (c.startsWith('t_')) doc.classList.remove(c);
    });
    doc.classList.add(`t_${resolvedTheme}`);

    // Defer expensive theme token iteration to idle time
    const applyTokenWrites = () => {
      const activeTamaguiTheme = themeDefinitions[resolvedTheme] as Record<
        string,
        { val?: string; variable?: string } | string
      >;
      if (activeTamaguiTheme) {
        Object.entries(activeTamaguiTheme).forEach(([key, value]) => {
          if (value) {
            const stringValue =
              typeof value === 'object' && value !== null
                ? value.val || value.variable || String(value)
                : String(value);

            if (
              stringValue &&
              typeof stringValue === 'string' &&
              !stringValue.includes('[object')
            ) {
              doc.style.setProperty(`--${key}`, stringValue);
              doc.style.setProperty(`--color-${key}`, stringValue);
            }
          }
        });
      }

      doc.style.setProperty('--background', themeTokensValue.background.base);
      doc.style.setProperty('--foreground', themeTokensValue.text.primary);
      doc.style.setProperty('--muted-foreground', themeTokensValue.text.muted);
      doc.style.setProperty('--primary', themeTokensValue.text.accent);
      doc.style.setProperty('--glassBg', themeTokensValue.glass.background);
      doc.style.setProperty('--glassBorder', themeTokensValue.glass.border);

      const cookieOptions = 'path=/; max-age=31536000; SameSite=Lax';
      document.cookie = `app-theme=${resolvedTheme}; ${cookieOptions}`;
      document.cookie = `app-theme-preference=${themePreference}; ${cookieOptions}`;
    };

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(applyTokenWrites, { timeout: 200 });
    } else {
      // Safari fallback
      setTimeout(applyTokenWrites, 0);
    }
  }, [resolvedTheme, themeTokensValue, themePreference]);

  useEffect(() => {
    if (isHydrated && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-app-ready', 'true');

      // Expose theme switcher to window for E2E audits to avoid full page reloads
      if (process.env.NEXT_PUBLIC_E2E === 'true') {
        (
          window as Window & {
            __SET_THEME__: (theme: string) => void;
          }
        ).__SET_THEME__ = (theme: string) => {
          setThemePreference(theme as ThemePreference);
        };
      }
    }
  }, [isHydrated, setThemePreference]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ themePreference, resolvedTheme, setThemePreference }),
    [themePreference, resolvedTheme, setThemePreference],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
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
