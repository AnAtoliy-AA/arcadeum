'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useLanguageStore } from './store/languageStore';
import {
  DEFAULT_LOCALE,
  Locale,
  TranslationBundle,
  formatMessage,
  getMessages,
} from '@/shared/i18n';

export type LanguageContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  messages: TranslationBundle;
  isReady: boolean;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useLanguageStore((state) => state.locale);
  const setLocale = useLanguageStore((state) => state.setLocale);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const messages = useMemo(() => {
    // During hydration, always use default locale to match server
    if (!isReady) return getMessages(DEFAULT_LOCALE);
    return getMessages(locale);
  }, [locale, isReady]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, messages, isReady }),
    [locale, setLocale, messages, isReady],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}

export { formatMessage };
