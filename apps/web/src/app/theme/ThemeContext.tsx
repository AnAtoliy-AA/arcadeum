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
  DEFAULT_THEME_NAME,
  ThemeName,
  ThemePreference,
  ThemeTokens,
  themeTokens,
} from '@/shared/config/theme';
import { themeDefinitions } from '@arcadeum/ui/themeDefinitions';
import {
  useVisionModeSetting,
  useVisionModeDocumentAttribute,
} from '@/shared/hooks/useVisionModeSetting';
import { VisionFilters } from '@/shared/ui/VisionFilters';

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
  // Field-level selectors: this provider wraps the entire app, so a
  // whole-store subscription would re-render the tree on any themeStore
  // write. Actions are stable references.
  const themePreference = useThemeStore((s) => s.themePreference);
  const setThemePreference = useThemeStore((s) => s.setThemePreference);
  const { visionMode } = useVisionModeSetting();
  const systemTheme = useSystemTheme();
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const resolvedTheme: ThemeName = useMemo(() => {
    if (!isHydrated) return initialTheme || DEFAULT_THEME_NAME;

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

    // Fast synchronous writes — lightweight, needed immediately for FOUC prevention.
    // NOTE: these must NOT be skipped when the attributes already match — the
    // effect is the only place that mints the theme CSS variables, and SSR sets
    // the attributes from cookies, so an early return here would leave
    // var(--primary) etc. undefined and every themed background transparent
    // (e.g. buttons) on reloads after the first visit.
    doc.setAttribute('data-theme', resolvedTheme);
    doc.setAttribute('data-theme-preference', themePreference);

    // Defer expensive theme token iteration to idle time
    const applyTokenWrites = () => {
      const activeTheme = themeDefinitions[resolvedTheme];
      if (activeTheme) {
        Object.entries(activeTheme).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            doc.style.setProperty(`--${key}`, value);
            doc.style.setProperty(`--color-${key}`, value);
          }
        });
      }

      doc.style.setProperty('--background', themeTokensValue.background.base);
      doc.style.setProperty('--foreground', themeTokensValue.text.primary);
      doc.style.setProperty('--muted-foreground', themeTokensValue.text.muted);
      // NOTE: `--primary` is deliberately NOT overridden here — it comes from
      // themeDefinitions, which darkens it to #0369a1 for WCAG AA 4.5:1
      // contrast with white button text (see themeDefinitions.ts).
      doc.style.setProperty('--glassBg', themeTokensValue.glass.background);
      doc.style.setProperty('--glassBorder', themeTokensValue.glass.border);
      doc.style.setProperty(
        '--glassBorderStrong',
        themeTokensValue.glass.borderStrong,
      );

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

  // Color-vision accessibility mode — mirrors the persisted setting onto
  // `<html data-vision-mode>` for CSS-side effects (ARC-896).
  useVisionModeDocumentAttribute(visionMode);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({ themePreference, resolvedTheme, setThemePreference }),
    [themePreference, resolvedTheme, setThemePreference],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <VisionFilters />
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
