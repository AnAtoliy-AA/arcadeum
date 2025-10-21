import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SecureStoreShim } from '@/lib/secureStore';

export type ThemePreference = 'system' | 'light' | 'dark';
export type LanguagePreference = 'en' | 'es' | 'fr';

export interface SettingsSnapshot {
  themePreference: ThemePreference;
  language: LanguagePreference;
}

export interface SettingsContextValue extends SettingsSnapshot {
  hydrated: boolean;
  setThemePreference: (preference: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
}

const STORAGE_KEY = 'app_settings_v1';

const defaultSettings: SettingsSnapshot = {
  themePreference: 'system',
  language: 'en',
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

async function readSettingsFromStorage(): Promise<SettingsSnapshot> {
  try {
    const raw = await SecureStoreShim.getItemAsync(STORAGE_KEY);
    if (!raw) {
      return { ...defaultSettings };
    }

    const parsed = JSON.parse(raw) as Partial<SettingsSnapshot>;
    return {
      themePreference: parsed.themePreference === 'light' || parsed.themePreference === 'dark' ? parsed.themePreference : 'system',
      language: parsed.language === 'es' || parsed.language === 'fr' ? parsed.language : 'en',
    };
  } catch {
    return { ...defaultSettings };
  }
}

async function persistSettingsSnapshot(snapshot: SettingsSnapshot) {
  try {
    await SecureStoreShim.setItemAsync(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore persistence failures for now
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsSnapshot>({ ...defaultSettings });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let canceled = false;
    (async () => {
      const stored = await readSettingsFromStorage();
      if (!canceled) {
        setSettings(stored);
        setHydrated(true);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setSettings((current) => {
      if (current.themePreference === preference) {
        return current;
      }
      const next: SettingsSnapshot = { ...current, themePreference: preference };
      void persistSettingsSnapshot(next);
      return next;
    });
    setHydrated(true);
  }, []);

  const setLanguage = useCallback((language: LanguagePreference) => {
    setSettings((current) => {
      if (current.language === language) {
        return current;
      }
      const next: SettingsSnapshot = { ...current, language };
      void persistSettingsSnapshot(next);
      return next;
    });
    setHydrated(true);
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      hydrated,
      setThemePreference,
      setLanguage,
    }),
    [settings, hydrated, setThemePreference, setLanguage],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}

export const settingsLanguages = [
  { code: 'en', labelKey: 'settings.languageOptions.en' },
  { code: 'es', labelKey: 'settings.languageOptions.es' },
  { code: 'fr', labelKey: 'settings.languageOptions.fr' },
] as const;

export const themePreferences = [
  {
    code: 'system',
    labelKey: 'settings.themeOptions.system.label',
    descriptionKey: 'settings.themeOptions.system.description',
  },
  {
    code: 'light',
    labelKey: 'settings.themeOptions.light.label',
    descriptionKey: 'settings.themeOptions.light.description',
  },
  {
    code: 'dark',
    labelKey: 'settings.themeOptions.dark.label',
    descriptionKey: 'settings.themeOptions.dark.description',
  },
] as const;
