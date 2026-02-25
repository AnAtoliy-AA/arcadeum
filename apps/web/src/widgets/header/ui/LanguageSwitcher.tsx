import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useLanguageStore } from '@/app/i18n/store/languageStore';
import { SUPPORTED_LOCALES, Locale } from '@/shared/i18n';
import { Select } from '@/shared/ui/Select';

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

const StyledSelect = styled(Select)`
  padding: 0.25rem 2rem 0.25rem 0.5rem !important;
  font-size: 0.875rem !important;
  background-position: right 0.5rem center !important;
  width: auto !important;
  min-width: 70px !important;
  height: 36px !important;

  @media (max-width: 640px) {
    padding: 0.125rem 1.25rem 0.125rem 0.375rem !important;
    font-size: 0.75rem !important;
    background-position: right 0.25rem center !important;
    min-width: 50px !important;
    height: 32px !important;
  }
`;

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLanguageStore((state) => state.locale);
  const setLocale = useLanguageStore((state) => state.setLocale);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
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
      <StyledSelect
        value={locale}
        onChange={handleLanguageChange}
        aria-label="Select language"
        data-testid="header-language-switcher"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </StyledSelect>
    </Container>
  );
}
