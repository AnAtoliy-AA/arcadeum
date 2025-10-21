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

export const settingsLanguages: { code: LanguagePreference; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];

export const themePreferences: { code: ThemePreference; label: string; description: string }[] = [
  {
    code: 'system',
    label: 'System default',
    description: 'Follow your device appearance settings.',
  },
  {
    code: 'light',
    label: 'Light',
    description: 'Always use the light interface.',
  },
  {
    code: 'dark',
    label: 'Dark',
    description: 'Always use the dark interface.',
  },
];
