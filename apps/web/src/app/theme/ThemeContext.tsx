"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";

import { loadStoredSettings, saveStoredSettings } from "@/shared/lib/settings-storage";
import {
  DEFAULT_THEME_NAME,
  ThemeName,
  ThemePreference,
  ThemeTokens,
  isThemePreference,
  isThemeName,
  themeTokens,
} from "@/shared/config/theme";

type ThemeContextValue = {
  themePreference: ThemePreference;
  resolvedTheme: ThemeName;
  setThemePreference: (preference: ThemePreference) => void;
};

type SystemThemeName = Extract<ThemeName, "light" | "dark">;

const SYSTEM_THEME_FALLBACK: SystemThemeName = "dark";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveStoredThemePreference(): ThemePreference {
  const stored = loadStoredSettings();
  if (stored.themePreference && isThemePreference(stored.themePreference)) {
    return stored.themePreference;
  }
  if (stored.themePreference && isThemeName(stored.themePreference)) {
    return stored.themePreference;
  }
  return DEFAULT_THEME_NAME;
}

function useSystemTheme(): SystemThemeName {
  const [systemTheme, setSystemTheme] = useState<SystemThemeName>(SYSTEM_THEME_FALLBACK);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = (matches: boolean) => {
      setSystemTheme(matches ? "dark" : "light");
    };

    apply(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      apply(event.matches);
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }

    // Safari < 14 fallback
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, []);

  return systemTheme;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    DEFAULT_THEME_NAME,
  );
  const systemTheme = useSystemTheme();

  useEffect(() => {
    const storedPreference = resolveStoredThemePreference();
    if (storedPreference !== DEFAULT_THEME_NAME) {
      const apply = () => {
        setThemePreferenceState(storedPreference);
      };
      if (typeof queueMicrotask === "function") {
        queueMicrotask(apply);
      } else {
        Promise.resolve().then(apply);
      }
    }
  }, []);

  const resolvedTheme: ThemeName = useMemo(() => {
    if (themePreference === "system") {
      return systemTheme;
    }
    return themePreference;
  }, [systemTheme, themePreference]);

  const theme: ThemeTokens = useMemo(() => themeTokens[resolvedTheme], [resolvedTheme]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    root.setAttribute("data-theme-preference", themePreference);
    root.style.setProperty("--background", theme.background.base);
    root.style.setProperty("--foreground", theme.text.primary);
    root.style.setProperty("--muted-foreground", theme.text.muted);
    root.style.setProperty("--card-background", theme.surfaces.card.background);
    root.style.setProperty("--card-border", theme.surfaces.card.border);
    root.style.setProperty("--surface-background", theme.surfaces.panel.background);

    if (document.body) {
      document.body.style.backgroundColor = theme.background.base;
      document.body.style.color = theme.text.primary;
    }
  }, [resolvedTheme, theme, themePreference]);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState((current) => {
      if (current === preference) {
        return current;
      }
      saveStoredSettings({ themePreference: preference });
      return preference;
    });
  }, []);

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
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeController must be used within AppThemeProvider");
  }

  return context;
}
