'use client';

import { useCallback, useMemo } from 'react';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { useThemeController } from '@/app/theme/ThemeContext';
import { useHapticsSetting } from '@/shared/hooks/useHapticsSetting';
import { usePWAOptional } from '@/features/pwa';
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n';
import type { ThemePreference } from '@/shared/config/theme';
import { PageLayout, PageTitle, Section } from '@/shared/ui';
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
  AccountStatus,
  AccountActions,
  ActionButton,
  SecondaryButton,
  ToggleRow,
  ToggleLabel,
  ToggleInput,
  VersionText,
} from './styles';

import { Button } from '@/shared/ui';
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
  supportCta,
}: SettingsContentProps) {
  const { themePreference, setThemePreference } = useThemeController();
  const { hapticsEnabled, setHapticsEnabled } = useHapticsSetting();
  const { locale, setLocale, messages } = useLanguage();

  const settingsCopy = messages.settings ?? {};
  const { snapshot } = useSessionTokens();
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

  const accountTitle = settingsCopy.accountTitle ?? ACCOUNT_TITLE_FALLBACK;
  const accountDescription =
    formatMessage(settingsCopy.accountDescription, { appName }) ??
    ACCOUNT_DESCRIPTION_FALLBACK;
  const accountStatus = snapshot.email
    ? snapshot.email
    : (settingsCopy.accountGuestStatus ?? ACCOUNT_STATUS_FALLBACK);
  const accountPrimaryCta = snapshot.email
    ? 'Logout'
    : (settingsCopy.accountPrimaryCta ?? ACCOUNT_PRIMARY_CTA_FALLBACK);
  const accountSupportLabel =
    settingsCopy.accountSupportCtaLabel ?? supportCta.label;

  const handleAccountAction = useCallback(async () => {
    if (snapshot.email) {
      const { useSessionStore } = await import(
        '@/entities/session/store/sessionStore'
      );
      useSessionStore.getState().clearTokens();
      window.location.replace('/');
    } else {
      window.location.href = '/auth';
    }
  }, [snapshot.email]);

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

  const languageGroupLabel = languageTitle;

  const languageOptions = useMemo(
    () =>
      SUPPORTED_LOCALES.map((code) => ({
        code,
        label: LANGUAGE_LABELS[code],
      })),
    [],
  );

  const pwa = usePWAOptional();
  const pwaTitle = settingsCopy.pwaTitle ?? 'Install App';
  const pwaDescription =
    settingsCopy.pwaDescription ??
    'Install Arcadeum as a native app on your device.';
  const pwaInstallLabel = settingsCopy.pwaInstallLabel ?? 'Install';

  return (
    <PageLayout>
      <Container data-current-locale={locale}>
        <PageTitle size="xl" gradient>
          {pageTitle}
        </PageTitle>

        <Section title={appearanceTitle} description={appearanceDescription}>
          <OptionList>
            {themeOptions.map((option) => (
              <OptionButton
                key={option.code}
                data-testid={`theme-${option.code}`}
                isActive={themePreference === option.code}
                onClick={() => handleThemeSelect(option.code)}
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
                data-testid={`lang-btn-${option.code}`}
                isActive={locale === option.code}
                onClick={() => setLocale(option.code)}
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
              type="checkbox"
              checked={hapticsEnabled}
              onChange={(e) => setHapticsEnabled(e.target.checked)}
            />
          </ToggleRow>
        </Section>

        <BlockedUsersSection />

        <Section title={accountTitle} description={accountDescription}>
          <AccountStatus>
            {accountStatus} {snapshot.username && `(@${snapshot.username})`}
          </AccountStatus>
          <AccountActions>
            {snapshot.email ? (
              <Button
                variant="primary"
                onClick={handleAccountAction}
                data-testid="account-logout-button"
                style={{ flex: 1, borderRadius: '999px', minWidth: '140px' }}
              >
                {accountPrimaryCta}
              </Button>
            ) : (
              <ActionButton href="/auth" data-testid="account-signin-button">
                {accountPrimaryCta}
              </ActionButton>
            )}
            <SecondaryButton
              as="a"
              href={supportCta.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {accountSupportLabel}
            </SecondaryButton>
          </AccountActions>
        </Section>

        {pwa?.canInstall && (
          <Section title={pwaTitle} description={pwaDescription}>
            <Button
              variant="primary"
              onClick={pwa.openModal}
              data-testid="pwa-install-button"
              style={{ flex: 1, borderRadius: '999px', minWidth: '140px' }}
            >
              {pwaInstallLabel}
            </Button>
          </Section>
        )}

        <Section title={aboutTitle} description={aboutDescription}>
          <VersionText>
            {versionLabel}: {appVersion}
          </VersionText>
        </Section>
      </Container>
    </PageLayout>
  );
}
