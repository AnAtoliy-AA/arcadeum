'use client';

import { useContext } from 'react';
import { LanguageContext, LanguageContextValue } from './LanguageContext';

/**
 * Hook to access the current language state and translations.
 * Must be used within a LanguageProvider.
 * Falls back to DEFAULT_LOCALE ('en') with empty messages if provider is not found
 * to prevent SSR 500s and breaking circular dependencies.
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    return {
      locale: 'en',
      setLocale: () => {},
      messages: {},
      isReady: false,
    };
  }

  return context;
}
