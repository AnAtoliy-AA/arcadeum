'use client';

import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import { useLanguageStore } from './store/languageStore';
import {
  DEFAULT_LOCALE,
  Locale,
  TranslationBundle,
  formatMessage,
  getMessages,
  loadMessages,
} from '@/shared/i18n';

import {
  LanguageContext,
  LanguageContextValue,
} from '@/shared/i18n/LanguageContext';

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

  // Initialize with messages for the initial locale (usually 'en' which is statically loaded)
  const [loadedMessages, setLoadedMessages] = useState<TranslationBundle>(() =>
    getMessages(initialLocale || DEFAULT_LOCALE),
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('data-hydrated', 'true');
    document.documentElement.setAttribute('data-app-ready', 'true');

    // Sync to cookie
    const cookieOptions = 'path=/; max-age=31536000; SameSite=Lax';
    document.cookie = `app-language=${locale}; ${cookieOptions}`;

    // Dynamically load the messages for the new locale
    let isMounted = true;
    loadMessages(locale).then((msgs) => {
      if (isMounted) {
        setLoadedMessages(msgs);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      messages: loadedMessages,
      isReady,
      initialLocale,
    }),
    [locale, setLocale, loadedMessages, isReady, initialLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export { formatMessage };
