'use client';

import { createContext, useContext } from 'react';
import { Locale, TranslationBundle } from './types';
export { formatMessage } from './index';

export type LanguageContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  messages: TranslationBundle;
  isReady: boolean;
  initialLocale?: Locale;
};

export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

/**
 * Hook to access the current language state and translations.
 * Must be used within a LanguageProvider.
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
