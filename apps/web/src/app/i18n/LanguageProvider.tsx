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
  LOCALE_SLUGS,
  type SlugKey,
} from '@/shared/config/locale-slugs';

import {
  LanguageContext,
  LanguageContextValue,
} from '@/shared/i18n/LanguageContext';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const LOCALIZED_SLUG_TO_KEY: Record<Locale, Record<string, SlugKey>> =
  Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [
      locale,
      Object.fromEntries(
        Object.entries(LOCALE_SLUGS[locale]).map(([key, slug]) => [
          slug,
          key as SlugKey,
        ]),
      ),
    ]),
  ) as Record<Locale, Record<string, SlugKey>>;

/**
 * Swap both the locale prefix AND the localized first slug when the
 * user changes language. `/fr/jeux/create` -> `/ru/igry/create`.
 */
function swapLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0];
  const isLocale =
    !!currentLocale &&
    (SUPPORTED_LOCALES as readonly string[]).includes(currentLocale);

  if (!isLocale) {
    return `/${nextLocale}${pathname === '/' ? '' : pathname}`;
  }

  segments[0] = nextLocale;

  // Translate the second segment if it's a recognized localized slug
  // under the current locale (`LOCALIZED_SLUG_TO_KEY['en']` is just the
  // identity map since English slugs equal their keys).
  const secondSegment = segments[1];
  if (secondSegment) {
    const key = LOCALIZED_SLUG_TO_KEY[currentLocale as Locale]?.[
      secondSegment
    ];
    if (key) {
      segments[1] = LOCALE_SLUGS[nextLocale][key];
    }
  }

  return '/' + segments.join('/');
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
