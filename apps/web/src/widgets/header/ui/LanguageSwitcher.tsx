'use client';

import { useMemo } from 'react';
import { XStack, GlobeIcon } from '@arcadeum/ui';
import { useLanguage } from '@/app/i18n/LanguageProvider';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, Locale } from '@/shared/i18n';
import { Select } from '@/shared/ui';

const LOCALES_LABELS: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  ru: 'RU',
  by: 'BY',
};

interface LanguageSwitcherProps {
  className?: string;
  'data-testid'?: string;
}

export function LanguageSwitcher({
  className,
  'data-testid': testId,
}: LanguageSwitcherProps) {
  const {
    locale: storeLocale,
    setLocale,
    isReady,
    initialLocale,
  } = useLanguage();

  const locale = isReady ? storeLocale : initialLocale || DEFAULT_LOCALE;

  const options = useMemo(
    () =>
      SUPPORTED_LOCALES.map((loc) => ({
        value: loc,
        label: LOCALES_LABELS[loc],
      })),
    [],
  );

  return (
    <XStack
      alignItems="center"
      gap="$2"
      marginHorizontal="$3"
      $md={{ marginHorizontal: '$5' }}
      className={className}
    >
      <XStack alignItems="center" justifyContent="center">
        <GlobeIcon size={18} />
      </XStack>
      <Select
        value={locale}
        onValueChange={(val) => setLocale(val as Locale)}
        options={options}
        aria-label="Select language"
        data-testid={testId}
      />
    </XStack>
  );
}
