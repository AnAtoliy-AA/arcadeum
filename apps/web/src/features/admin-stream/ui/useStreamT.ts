'use client';

import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';

const PREFIX = 'pages.adminStream.';

/**
 * Translator scoped to `pages.adminStream`. Keys here are built from
 * validated enums (difficulty, overlay parts, error codes), which the strict
 * key type cannot follow, hence the single cast below.
 */
export function useStreamT() {
  const { t } = useTranslation();
  return (key: string, params?: Record<string, string | number>): string =>
    // Keys are always under pages.adminStream and exist in all 5 locales.
    t(`${PREFIX}${key}` as TranslationKey, params);
}

export type StreamT = ReturnType<typeof useStreamT>;
