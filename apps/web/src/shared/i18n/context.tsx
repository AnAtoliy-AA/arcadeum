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

const LANGUAGE_CONTEXT_SYMBOL = Symbol.for('arcadeum.languageContext');

// Use a separate type to avoid 'any'
type GlobalWithLanguageContext = typeof globalThis & {
  [LANGUAGE_CONTEXT_SYMBOL]?: React.Context<LanguageContextValue | undefined>;
};

const globalWithContext = globalThis as GlobalWithLanguageContext;

if (!globalWithContext[LANGUAGE_CONTEXT_SYMBOL]) {
  globalWithContext[LANGUAGE_CONTEXT_SYMBOL] = createContext<
    LanguageContextValue | undefined
  >(undefined);
}

export const LanguageContext = globalWithContext[
  LANGUAGE_CONTEXT_SYMBOL
] as React.Context<LanguageContextValue | undefined>;

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
