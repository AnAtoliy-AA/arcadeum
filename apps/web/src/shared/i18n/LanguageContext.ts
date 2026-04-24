import { createContext } from 'react';
import { Locale, TranslationBundle } from './types';

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
