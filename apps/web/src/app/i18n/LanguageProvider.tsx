'use client';

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

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

import { usePathname, useRouter } from 'next/navigation';
import { swapLocaleInPath } from './locale-utils';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}

function useLazyMessages(locale: Locale, initialMessages?: TranslationBundle) {
  const [messages, setMessages] = useState<TranslationBundle>(
    () => initialMessages ?? getMessages(locale ?? DEFAULT_LOCALE),
  );

  const hasFullBundle = useRef(
    !!(
      initialMessages?.settings &&
      Object.keys(initialMessages.settings).length > 0
    ),
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('data-hydrated', 'true');
    document.documentElement.setAttribute('data-app-ready', 'true');
    document.cookie = `app-language=${locale}; path=/; max-age=31536000; SameSite=Lax`;

    if (hasFullBundle.current) return;

    let mounted = true;

    const load = () => {
      loadMessages(locale).then((msgs) => {
        if (mounted) {
          setMessages(msgs);
          hasFullBundle.current = true;
        }
      });
    };

    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(load, { timeout: 2000 });
    } else {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [locale]);

  return messages;
}

export function LanguageProvider({
  children,
  locale,
  initialMessages,
}: {
  children: ReactNode;
  locale: Locale;
  initialMessages?: TranslationBundle;
}) {
  const messages = useLazyMessages(locale, initialMessages);
  const isReady = useIsHydrated();
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      const currentPath =
        pathname ||
        (typeof window !== 'undefined'
          ? window.location.pathname
          : `/${locale}`);
      const nextPath = swapLocaleInPath(currentPath, next);
      const query = typeof window !== 'undefined' ? window.location.search : '';
      const cookieOptions = 'path=/; max-age=31536000; SameSite=Lax';
      if (typeof document !== 'undefined') {
        document.cookie = `app-language=${next}; ${cookieOptions}`;
      }
      const target = query ? `${nextPath}${query}` : nextPath;
      router.replace(target);
      router.refresh();
    },
    [locale, pathname, router],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, messages, isReady, initialLocale: locale }),
    [locale, setLocale, messages, isReady],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export { formatMessage };
