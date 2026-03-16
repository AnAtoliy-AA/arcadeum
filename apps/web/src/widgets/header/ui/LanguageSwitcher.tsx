'use client';

import { useMemo } from 'react';
import { XStack, GlobeIcon } from '@arcadeum/ui';
import { useLanguageStore } from '@/app/i18n/store/languageStore';
import { SUPPORTED_LOCALES, Locale } from '@/shared/i18n';
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
  const locale = useLanguageStore((state) => state.locale);
  const setLocale = useLanguageStore((state) => state.setLocale);

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
      marginHorizontal="$5"
      className={className}
      data-testid={testId}
    >
      <XStack alignItems="center" justifyContent="center">
        <GlobeIcon size={18} />
      </XStack>
      <Select
        value={locale}
        onValueChange={(val) => setLocale(val as Locale)}
        options={options}
        aria-label="Select language"
      />
    </XStack>
  );
}
