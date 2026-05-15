'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { XStack, GlobeIcon } from '@arcadeum/ui';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { useLanguage } from '@/shared/i18n/context';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, Locale } from '@/shared/i18n';

const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  ru: 'RU',
  by: 'BY',
};

interface LanguagePillsProps {
  'data-testid'?: string;
}

// Inline locale picker rendered as a row of chip buttons. Used inside the
// mobile menu drawer where a portaled Select dropdown is awkward and
// fights the menu's outside-click handling.
export default function LanguagePills({
  'data-testid': testId,
}: LanguagePillsProps) {
  const router = useRouter();
  const { locale: storeLocale, setLocale, initialLocale } = useLanguage();
  const mounted = useIsMounted();
  const locale = mounted ? storeLocale : initialLocale || DEFAULT_LOCALE;

  const handlePick = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      document.cookie = `app-language=${next}; path=/; max-age=31536000; SameSite=Lax`;
      setLocale(next);
      router.refresh();
    },
    [locale, setLocale, router],
  );

  return (
    <XStack alignItems="center" gap="$2" flexWrap="wrap" data-testid={testId}>
      <GlobeIcon size={18} />
      {SUPPORTED_LOCALES.map((loc) => (
        <Button
          key={loc}
          variant="chip"
          size="sm"
          isActive={locale === loc}
          onClick={() => handlePick(loc)}
          aria-pressed={locale === loc}
          aria-label={`Switch language to ${LOCALE_LABEL[loc]}`}
          data-testid={`mobile-language-${loc}`}
        >
          {LOCALE_LABEL[loc]}
        </Button>
      ))}
    </XStack>
  );
}
