import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useLanguageStore } from '@/app/i18n/store/languageStore';
import { SUPPORTED_LOCALES, Locale } from '@/shared/i18n';
import { Select } from '@/shared/ui';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 640px) {
    gap: 0.25rem;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 640px) {
    display: none;
  }
`;

const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const LOCALES_LABELS: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  fr: 'FR',
  ru: 'RU',
  by: 'BY',
};

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLanguageStore((state) => state.locale);
  const setLocale = useLanguageStore((state) => state.setLocale);

  const handleLanguageChange = (val: string) => {
    setLocale(val as Locale);
  };

  const options = useMemo(() => {
    return SUPPORTED_LOCALES.map((loc) => ({
      value: loc,
      label: LOCALES_LABELS[loc],
    }));
  }, []);

  return (
    <Container className={className}>
      <IconWrapper>
        <GlobeIcon />
      </IconWrapper>
      <Select
        value={locale}
        onValueChange={handleLanguageChange}
        options={options}
        aria-label="Select language"
        data-testid="header-language-switcher"
      />
    </Container>
  );
}
