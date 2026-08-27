import { useCallback } from 'react';

import { useSettings, type LanguagePreference } from '@/stores/settings';

import { translations, type TranslationKey } from './i18n/messages';
import type { Replacements, TranslationTree } from './i18n/types';

export type TFunction = (
  key: TranslationKey,
  replacements?: Replacements,
) => string;

function resolveKey(
  tree: TranslationTree | string | undefined,
  segments: string[],
): string | undefined {
  if (typeof tree === 'string') {
    return tree;
  }

  if (!tree) {
    return undefined;
  }

  const segment = segments[0];
  if (typeof segment === 'undefined') {
    return undefined;
  }
  const remainingSegments = segments.slice(1);
  const nextValue = tree[segment];
  if (typeof nextValue === 'undefined') {
    return undefined;
  }

  if (remainingSegments.length === 0) {
    return typeof nextValue === 'string' ? nextValue : undefined;
  }

  return resolveKey(nextValue, remainingSegments);
}

function applyReplacements(
  template: string,
  replacements: Replacements,
): string {
  if (!replacements) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = replacements[key];
    return typeof value === 'undefined' ? match : String(value);
  });
}

export function translate(
  locale: LanguagePreference,
  key: TranslationKey,
  replacements?: Replacements,
): string {
  const segments = key.split('.');
  const localeTemplate = resolveKey(translations[locale], segments);
  const fallbackTemplate = resolveKey(translations.en, segments);
  const template = localeTemplate ?? fallbackTemplate ?? key;
  return applyReplacements(template, replacements);
}

export function useTranslation() {
  const { language } = useSettings();

  const t = useCallback(
    (key: TranslationKey, replacements?: Replacements) => {
      return translate(language, key, replacements);
    },
    [language],
  );

  return { t, locale: language };
}
