'use client';

import { ReactNode, useEffect, useMemo, useSyncExternalStore } from 'react';

import { useLanguageStore } from './store/languageStore';
import {
  DEFAULT_LOCALE,
  Locale,
  formatMessage,
  getMessages,
} from '@/shared/i18n';

import { LanguageContext, LanguageContextValue } from '@/shared/i18n/context';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const locale = useLanguageStore((state) => state.locale);
  const setLocale = useLanguageStore((state) => state.setLocale);
  const isReady = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('data-hydrated', 'true');

    // Sync to cookie
    const cookieOptions = 'path=/; max-age=31536000; SameSite=Lax';
    document.cookie = `app-language=${locale}; ${cookieOptions}`;
  }, [locale]);

  const messages = useMemo(() => {
    // During hydration, use initialLocale if provided, else DEFAULT_LOCALE
    // This must match what RootLayout used to render on the server
    if (!isReady) return getMessages(initialLocale || DEFAULT_LOCALE);
    return getMessages(locale);
  }, [locale, isReady, initialLocale]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, messages, isReady, initialLocale }),
    [locale, setLocale, messages, isReady, initialLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export { formatMessage };
