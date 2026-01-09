'use client';

import { useCallback, useMemo } from 'react';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { useThemeController } from '@/app/theme/ThemeContext';
import { useHapticsSetting } from '@/shared/hooks/useHapticsSetting';
import { usePlatform } from '@/shared/hooks/usePlatform';
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n';
import type { ThemePreference } from '@/shared/config/theme';

type DownloadConfig = {
  title: string;
  description: string;
  iosLabel: string;
  androidLabel: string;
  iosHref?: string;
  androidHref?: string;
};

export type SettingsContentProps = {
  appName: string;
  downloads: DownloadConfig;
  supportCta: {
    href: string;
    label: string;
  };
  description: string;
};
const SETTINGS_TITLE_FALLBACK = 'Settings';
const SETTINGS_DESCRIPTION_TEMPLATE =
  'Manage your appearance, language, and download preferences for the {appName} web experience.';
const APPEARANCE_TITLE_FALLBACK = 'Appearance';
const APPEARANCE_DESCRIPTION_TEMPLATE =
  'Choose a theme to use across the {appName} web experience.';
const LANGUAGE_TITLE_FALLBACK = 'Language';
const LANGUAGE_DESCRIPTION_FALLBACK =
  'Interface translations are a work in progress. Save your preference for upcoming updates.';
const DOWNLOADS_TITLE_FALLBACK = 'Mobile builds';
const DOWNLOADS_DESCRIPTION_FALLBACK =
  'Grab the latest Expo builds to keep the mobile clients in sync with the web release.';
const ACCOUNT_TITLE_FALLBACK = 'Account';
const ACCOUNT_DESCRIPTION_FALLBACK =
  'Web sign-in is rolling out soon. In the meantime, manage your subscriptions via the dashboard or continue in the mobile app.';
const ACCOUNT_STATUS_FALLBACK = 'You are browsing as a guest.';
const ACCOUNT_PRIMARY_CTA_FALLBACK = 'Go to sign-in';

const DEFAULT_THEME_OPTIONS: Array<{
  code: ThemePreference;
  label: string;
  description: string;
}> = [
  {
    code: 'system',
    label: 'Match system appearance',
    description: 'Follow your operating system preference automatically.',
  },
  {
    code: 'light',
    label: 'Light',
    description: 'Bright neutrals with airy surfaces and subtle gradients.',
  },
  {
    code: 'dark',
    label: 'Dark',
    description: 'Contemporary midnight palette ideal for low-light play.',
  },
  {
    code: 'neonLight',
    label: 'Neon Light',
    description: 'Arcade-inspired glow with luminous panels and neon edges.',
  },
  {
    code: 'neonDark',
    label: 'Neon Dark',
    description: 'High-contrast vaporwave styling for dramatic game tables.',
  },
];

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

export default function SettingsContent({
  appName,
  downloads,
  supportCta,
  description,
}: SettingsContentProps) {
  const { themePreference, setThemePreference } = useThemeController();
  const { hapticsEnabled, setHapticsEnabled } = useHapticsSetting();
  const { locale, setLocale, messages } = useLanguage();
  const settingsCopy = messages.settings ?? {};

  const fallbackSettingsDescription =
    formatMessage(SETTINGS_DESCRIPTION_TEMPLATE, { appName }) ??
    SETTINGS_DESCRIPTION_TEMPLATE.replace('{appName}', appName);
  const pageTitle = settingsCopy.title ?? SETTINGS_TITLE_FALLBACK;
  const pageDescription =
    formatMessage(settingsCopy.description, { appName }) ??
    description ??
    fallbackSettingsDescription;

  const fallbackAppearanceDescription =
    formatMessage(APPEARANCE_DESCRIPTION_TEMPLATE, { appName }) ??
    APPEARANCE_DESCRIPTION_TEMPLATE.replace('{appName}', appName);
  const appearanceTitle =
    settingsCopy.appearanceTitle ?? APPEARANCE_TITLE_FALLBACK;
  const appearanceDescription =
    formatMessage(settingsCopy.appearanceDescription, { appName }) ??
    fallbackAppearanceDescription;

  const themeOptions = useMemo(
    () =>
      DEFAULT_THEME_OPTIONS.map((option) => {
        const override = settingsCopy.themeOptions?.[option.code];
        const descriptionOverride =
          formatMessage(override?.description, { appName }) ??
          option.description;
        return {
          ...option,
          label: override?.label ?? option.label,
          description: descriptionOverride,
        };
      }),
    [appName, settingsCopy.themeOptions],
  );

  const languageTitle = settingsCopy.languageTitle ?? LANGUAGE_TITLE_FALLBACK;
  const languageDescription =
    settingsCopy.languageDescription ?? LANGUAGE_DESCRIPTION_FALLBACK;

  const languageOptions = useMemo(
    () =>
      SUPPORTED_LOCALES.map((code) => ({
        code,
        label:
          settingsCopy.languageOptionLabels?.[code] ?? LANGUAGE_LABELS[code],
      })),
    [settingsCopy.languageOptionLabels],
  );

  const downloadsTitle =
    settingsCopy.downloadsTitle ?? downloads.title ?? DOWNLOADS_TITLE_FALLBACK;
  const downloadsDescription =
    formatMessage(settingsCopy.downloadsDescription, { appName }) ??
    downloads.description ??
    DOWNLOADS_DESCRIPTION_FALLBACK;

  const { isIos, isAndroid } = usePlatform();
  const downloadButtons = useMemo(() => {
    const buttons: Array<{ key: string; href: string; label: string }> = [];
    if (downloads.iosHref && !isAndroid) {
      const label = settingsCopy.downloadsIosLabel ?? downloads.iosLabel;
      buttons.push({ key: 'ios', href: downloads.iosHref, label });
    }
    if (downloads.androidHref && !isIos) {
      const label =
        settingsCopy.downloadsAndroidLabel ?? downloads.androidLabel;
      buttons.push({ key: 'android', href: downloads.androidHref, label });
    }
    return buttons;
  }, [
    downloads.androidHref,
    downloads.androidLabel,
    downloads.iosHref,
    downloads.iosLabel,
    settingsCopy.downloadsAndroidLabel,
    settingsCopy.downloadsIosLabel,
    isIos,
    isAndroid,
  ]);

  const accountTitle = settingsCopy.accountTitle ?? ACCOUNT_TITLE_FALLBACK;
  const accountDescription =
    formatMessage(settingsCopy.accountDescription, { appName }) ??
    ACCOUNT_DESCRIPTION_FALLBACK;
  const accountStatus =
    settingsCopy.accountGuestStatus ?? ACCOUNT_STATUS_FALLBACK;
  const accountPrimaryCta =
    settingsCopy.accountPrimaryCta ?? ACCOUNT_PRIMARY_CTA_FALLBACK;
  const accountSupportLabel =
    settingsCopy.accountSupportCtaLabel ?? supportCta.label;

  const gameplayTitle = settingsCopy.gameplayTitle ?? 'Gameplay';
  const gameplayDescription =
    settingsCopy.gameplayDescription ?? 'Customize your in-game experience.';
  const hapticsLabel = settingsCopy.hapticsLabel ?? 'Haptic Feedback';

  const handleThemeSelect = useCallback(
    (code: ThemePreference) => {
      setThemePreference(code);
    },
    [setThemePreference],
  );

  const handleLanguageSelect = useCallback(
    (code: Locale) => {
      if (locale === code) {
        return;
      }
      setLocale(code);
    },
    [locale, setLocale],
  );

  const languageGroupLabel = languageTitle;

  return (
    <Page>
      <Wrapper>
        <Header>
          <Title>{pageTitle}</Title>
          <Description>{pageDescription}</Description>
        </Header>

        <Section>
          <SectionTitle>{appearanceTitle}</SectionTitle>
          <SectionDescription>{appearanceDescription}</SectionDescription>
          <OptionList>
            {themeOptions.map((option) => (
              <OptionButton
                key={option.code}
                type="button"
                $active={themePreference === option.code}
                onClick={() => handleThemeSelect(option.code)}
                aria-pressed={themePreference === option.code}
              >
                <OptionLabel>{option.label}</OptionLabel>
                <OptionDescription>{option.description}</OptionDescription>
              </OptionButton>
            ))}
          </OptionList>
        </Section>

        <Section>
          <SectionTitle>{languageTitle}</SectionTitle>
          <SectionDescription>{languageDescription}</SectionDescription>
          <PillGroup role="group" aria-label={languageGroupLabel}>
            {languageOptions.map((option) => (
              <PillButton
                key={option.code}
                type="button"
                $active={locale === option.code}
                onClick={() => handleLanguageSelect(option.code)}
                aria-pressed={locale === option.code}
              >
                {option.label}
              </PillButton>
            ))}
          </PillGroup>
        </Section>

        <Section>
          <SectionTitle>{gameplayTitle}</SectionTitle>
          <SectionDescription>{gameplayDescription}</SectionDescription>
          <OptionList>
            <ToggleRow>
              <ToggleLabel>{hapticsLabel}</ToggleLabel>
              <ToggleInput
                checked={hapticsEnabled}
                onChange={(e) => setHapticsEnabled(e.target.checked)}
              />
            </ToggleRow>
          </OptionList>
        </Section>

        {downloadButtons.length > 0 ? (
          <Section>
            <SectionTitle>{downloadsTitle}</SectionTitle>
            <SectionDescription>{downloadsDescription}</SectionDescription>
            <DownloadGrid>
              {downloadButtons.map((button) => (
                <DownloadLink
                  key={button.key}
                  href={button.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon aria-hidden="true">↓</DownloadIcon>
                  <span>{button.label}</span>
                </DownloadLink>
              ))}
            </DownloadGrid>
          </Section>
        ) : null}

        <Section>
          <SectionTitle>{accountTitle}</SectionTitle>
          <SectionDescription>{accountDescription}</SectionDescription>
          <AccountCard>
            <AccountStatus role="status">{accountStatus}</AccountStatus>
            <AccountActions>
              <ActionButton href="/auth">{accountPrimaryCta}</ActionButton>
              <SecondaryButton href={supportCta.href}>
                {accountSupportLabel}
              </SecondaryButton>
            </AccountActions>
          </AccountCard>
        </Section>
      </Wrapper>
    </Page>
  );
}

import {
  Page,
  Wrapper,
  Header,
  Title,
  Description,
  Section,
  SectionTitle,
  SectionDescription,
  OptionList,
  OptionButton,
  OptionLabel,
  OptionDescription,
  PillGroup,
  PillButton,
  DownloadGrid,
  DownloadLink,
  DownloadIcon,
  AccountCard,
  AccountStatus,
  AccountActions,
  ActionButton,
  SecondaryButton,
  ToggleRow,
  ToggleLabel,
  ToggleInput,
} from './styles';
