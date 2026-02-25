'use client';

import { useCallback, useMemo } from 'react';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { useThemeController } from '@/app/theme/ThemeContext';
import { useHapticsSetting } from '@/shared/hooks/useHapticsSetting';
import { usePlatform } from '@/shared/hooks/usePlatform';
import { usePWAOptional } from '@/features/pwa';
import { useTranslation } from '@/shared/lib/useTranslation';
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n';
import type { ThemePreference } from '@/shared/config/theme';
import { PageLayout, PageTitle, Section, Card } from '@/shared/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { appConfig } from '@/shared/config/app-config';

import {
  Container,
  OptionList,
  OptionButton,
  OptionLabel,
  OptionDescription,
  PillGroup,
  PillButton,
  DownloadGrid,
  DownloadLink,
  DownloadIcon,
  AccountStatus,
  AccountActions,
  ActionButton,
  SecondaryButton,
  ToggleRow,
  ToggleLabel,
  ToggleInput,
  VersionText,
} from './styles';

import { BlockedUsersSection } from './BlockedUsersSection';

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
  ru: 'Русский',
  by: 'Беларуская',
};

export default function SettingsContent({
  appName,
  downloads,
  supportCta,
  description: _description,
}: SettingsContentProps) {
  const { themePreference, setThemePreference } = useThemeController();
  const { hapticsEnabled, setHapticsEnabled } = useHapticsSetting();
  const { locale, setLocale, messages } = useLanguage();
  const pwa = usePWAOptional();
  const { t } = useTranslation();
  const settingsCopy = messages.settings ?? {};
  const { snapshot, hydrated } = useSessionTokens();
  const { appVersion } = appConfig;

  const pageTitle = settingsCopy.title ?? SETTINGS_TITLE_FALLBACK;

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

  const { isAndroid } = usePlatform();
  const downloadButtons = useMemo(() => {
    const buttons: Array<{ key: string; href: string; label: string }> = [];
    if (downloads.iosHref && !isAndroid) {
      const label = settingsCopy.downloadsIosLabel ?? downloads.iosLabel;
      buttons.push({ key: 'ios', href: downloads.iosHref, label });
    }
    // if (downloads.androidHref && !isIos) {
    //   const label =
    //     settingsCopy.downloadsAndroidLabel ?? downloads.androidLabel;
    //   buttons.push({ key: 'android', href: downloads.androidHref, label });
    // }
    return buttons;
  }, [
    downloads.iosHref,
    downloads.iosLabel,
    settingsCopy.downloadsIosLabel,
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

  const aboutTitle = settingsCopy.aboutTitle ?? 'About';
  const aboutDescription =
    settingsCopy.aboutDescription ??
    'Application information and version details.';
  const versionLabel = settingsCopy.versionLabel ?? 'Version';

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
    <PageLayout>
      <Container>
        <PageTitle size="xl" gradient>
          {pageTitle}
        </PageTitle>

        <Section title={appearanceTitle} description={appearanceDescription}>
          <OptionList>
            {themeOptions.map((option) => (
              <OptionButton
                key={option.code}
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

        <Section title={languageTitle} description={languageDescription}>
          <PillGroup role="group" aria-label={languageGroupLabel}>
            {languageOptions.map((option) => (
              <PillButton
                key={option.code}
                $active={locale === option.code}
                onClick={() => handleLanguageSelect(option.code)}
                aria-pressed={locale === option.code}
              >
                {option.label}
              </PillButton>
            ))}
          </PillGroup>
        </Section>

        <Section title={gameplayTitle} description={gameplayDescription}>
          <ToggleRow>
            <ToggleLabel>{hapticsLabel}</ToggleLabel>
            <ToggleInput
              checked={hapticsEnabled}
              onChange={(e) => setHapticsEnabled(e.target.checked)}
            />
          </ToggleRow>
        </Section>

        {downloadButtons.length > 0 || pwa?.canInstall ? (
          <Section title={downloadsTitle} description={downloadsDescription}>
            <DownloadGrid>
              {pwa?.canInstall && (
                <DownloadLink
                  as="button"
                  onClick={pwa.openModal}
                  style={{ cursor: 'pointer' }}
                  data-testid="settings-install-pwa"
                >
                  <DownloadIcon aria-hidden="true">📲</DownloadIcon>
                  <span>{t('pwa.install.button') || 'Install App'}</span>
                </DownloadLink>
              )}
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

        <BlockedUsersSection />

        <Section title={accountTitle} description={accountDescription}>
          <Card variant="elevated" padding="md">
            {hydrated && snapshot.accessToken ? (
              <>
                <AccountStatus as="div" role="status">
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {snapshot.displayName || snapshot.username || 'User'}
                  </div>
                  {snapshot.username &&
                    snapshot.username !== snapshot.displayName && (
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        @{snapshot.username}
                      </div>
                    )}
                  {snapshot.email && (
                    <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                      {snapshot.email}
                    </div>
                  )}
                </AccountStatus>

                <AccountActions>
                  <SecondaryButton href={supportCta.href}>
                    {accountSupportLabel}
                  </SecondaryButton>
                </AccountActions>
              </>
            ) : (
              <>
                <AccountStatus role="status">{accountStatus}</AccountStatus>
                <AccountActions>
                  <ActionButton href="/auth">{accountPrimaryCta}</ActionButton>
                  <SecondaryButton href={supportCta.href}>
                    {accountSupportLabel}
                  </SecondaryButton>
                </AccountActions>
              </>
            )}
          </Card>
        </Section>

        <Section title={aboutTitle} description={aboutDescription}>
          <Card variant="elevated" padding="md">
            <AccountStatus as="div" role="status" data-testid="app-version">
              {versionLabel}: <VersionText>v{appVersion}</VersionText>
            </AccountStatus>
          </Card>
        </Section>
      </Container>
    </PageLayout>
  );
}
