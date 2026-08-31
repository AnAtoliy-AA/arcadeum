'use client';

import {
  ReactNode,
  Suspense,
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

import { SearchParamsSyncer } from './SearchParamsSyncer';

type SetLocaleFn = (next: Locale) => void;

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

  const setLocaleRef = useRef<SetLocaleFn>(() => {});
  const setLocale = useCallback(
    (next: Locale) => setLocaleRef.current(next),
    [],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, messages, isReady, initialLocale: locale }),
    [locale, setLocale, messages, isReady],
  );

  return (
    <LanguageContext.Provider value={value}>
      <Suspense>
        <SearchParamsSyncer locale={locale} setLocaleRef={setLocaleRef} />
      </Suspense>
      {children}
    </LanguageContext.Provider>
  );
}

export { formatMessage };
