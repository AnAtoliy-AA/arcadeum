'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from '@/shared/i18n';
import { buildRoutes, type Routes } from './routes';

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/**
 * Returns a locale-aware routes object. Reads the active locale from the
 * URL via `useParams()`. Falls back to the default locale outside of a
 * `[locale]` route (e.g. `/offline`).
 */
export function useRoutes(): Routes {
  const params = useParams<{ locale?: string }>();
  const locale = isLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
  return useMemo(() => buildRoutes(locale), [locale]);
}

/**
 * Returns the active locale from the URL, or the default if none is present.
 */
export function useLocale(): Locale {
  const params = useParams<{ locale?: string }>();
  return isLocale(params?.locale) ? params.locale : DEFAULT_LOCALE;
}
