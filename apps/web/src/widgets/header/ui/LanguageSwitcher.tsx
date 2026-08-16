'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { Select } from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, Locale } from '@/shared/i18n';

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

export default function LanguageSwitcher({
  className,
  'data-testid': testId,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale: storeLocale, setLocale, initialLocale } = useLanguage();

  const mounted = useIsMounted();

  const locale = mounted ? storeLocale : initialLocale || DEFAULT_LOCALE;

  const handleLocaleChange = useCallback(
    (val: string) => {
      const next = val as Locale;
      document.cookie = `app-language=${next}; path=/; max-age=31536000; SameSite=Lax`;
      setLocale(next);
      router.refresh();
    },
    [setLocale, router],
  );

  const options = useMemo(
    () =>
      SUPPORTED_LOCALES.map((loc) => ({
        value: loc,
        label: LOCALES_LABELS[loc],
      })),
    [],
  );

  return (
    <div className={`flex items-center gap-2 md:mx-5 ${className ?? ''}`}>
      <Select
        value={locale}
        onValueChange={handleLocaleChange}
        options={options}
        size="sm"
        aria-label="Select language"
        data-testid={testId}
      />
    </div>
  );
}
