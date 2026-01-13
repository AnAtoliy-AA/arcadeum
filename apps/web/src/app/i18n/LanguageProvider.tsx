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
  const { locale, setLocale } = useLanguageStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Determine readiness (just a flag now since we persist)
    // Legacy logic waited for async storage, here persistence is likely sync enough for hydration,
    // or we can assume ready. But let's keep the flag for consistency if needed.
    // Zustand persist middleware rehydrates automatically.
    // We can use onRehydrateStorage if we need to know exactly when it finishes,
    // but for now let's just set ready.
    const t = setTimeout(() => setIsReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('lang', locale);
  }, [locale]);

  const messages = useMemo(() => getMessages(locale), [locale]);

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
