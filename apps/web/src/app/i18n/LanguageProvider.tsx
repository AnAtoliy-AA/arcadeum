'use client';

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
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

function swapLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split('/');
  if (
    segments.length > 1 &&
    (SUPPORTED_LOCALES as readonly string[]).includes(segments[1])
  ) {
    segments[1] = nextLocale;
    return segments.join('/') || `/${nextLocale}`;
  }
  return `/${nextLocale}${pathname === '/' ? '' : pathname}`;
}

export function LanguageProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isReady = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const [loadedMessages, setLoadedMessages] = useState<TranslationBundle>(() =>
    getMessages(locale ?? DEFAULT_LOCALE),
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('data-hydrated', 'true');
    document.documentElement.setAttribute('data-app-ready', 'true');

    document.cookie = `app-language=${locale}; path=/; max-age=31536000; SameSite=Lax`;

    let mounted = true;
    loadMessages(locale).then((msgs) => {
      if (mounted) setLoadedMessages(msgs);
    });
    return () => {
      mounted = false;
    };
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      const nextPath = swapLocaleInPath(pathname ?? `/${locale}`, next);
      const query = searchParams?.toString();
      router.replace(query ? `${nextPath}?${query}` : nextPath);
    },
    [locale, pathname, searchParams, router],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      messages: loadedMessages,
      isReady,
      initialLocale: locale,
    }),
    [locale, setLocale, loadedMessages, isReady],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export { formatMessage };
