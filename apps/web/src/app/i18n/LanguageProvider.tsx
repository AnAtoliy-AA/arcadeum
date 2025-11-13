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

import { loadStoredSettings, saveStoredSettings } from "@/shared/lib/settings-storage";
import {
  DEFAULT_LOCALE,
  Locale,
  TranslationBundle,
  formatMessage,
  getMessages,
  isLocale,
} from "@/shared/i18n";

export type LanguageContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  messages: TranslationBundle;
  isReady: boolean;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = loadStoredSettings().language;
    const schedule = (fn: () => void) => {
      if (typeof queueMicrotask === "function") {
        queueMicrotask(fn);
      } else {
        Promise.resolve().then(fn);
      }
    };

    if (stored && isLocale(stored) && stored !== DEFAULT_LOCALE) {
      schedule(() => {
        setLocaleState(stored);
        setIsReady(true);
      });
      return;
    }

    schedule(() => {
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    saveStoredSettings({ language: next });
  }, []);

  const messages = useMemo(() => getMessages(locale), [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, messages, isReady }),
    [locale, setLocale, messages, isReady],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}

export { formatMessage };
