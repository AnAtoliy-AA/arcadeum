'use client';

import { useCallback, useMemo } from 'react';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { useThemeController } from '@/app/theme/ThemeContext';
import { useHapticsSetting } from '@/shared/hooks/useHapticsSetting';
import { useSoundSetting } from '@/shared/hooks/useSoundSetting';
import { usePWAInstallProps } from '@/features/pwa';
import { SUPPORTED_LOCALES, type Locale } from '@/shared/i18n';
import type { ThemePreference } from '@/shared/config/theme';
import { PageLayout, PageTitle, Section } from '@/shared/ui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { appConfig } from '@/shared/config/app-config';

import {
  Container,
  OptionList,
  PillGroup,
  AccountStatus,
  AccountActions,
  ToggleRow,
  ToggleLabel,
  ToggleInput,
  VersionText,
  settingsStyles,
} from './styles';

import { Button, LinkButton } from '@arcadeum/ui';
import { DownloadButtons, OptionCard } from '@/shared/ui';
import { BlockedUsersSection } from './BlockedUsersSection';
import { AppFooter } from '@/widgets/footer';

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
  {
    code: 'violetDark',
    label: 'Violet Dark',
    description: 'Deep violet-black with lavender glass and purple glow.',
  },
  {
    code: 'violetLight',
    label: 'Violet Light',
    description: 'Soft lavender-white with crisp violet accents.',
  },
  {
    code: 'tealDark',
    label: 'Teal Dark',
    description: 'Deep teal-black with mint glass and ocean glow.',
  },
  {
    code: 'tealLight',
    label: 'Teal Light',
    description: 'Fresh teal-white with clean emerald accents.',
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
  const { soundEnabled, setSoundEnabled } = useSoundSetting();
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

  const { onInstall, onShowInstructions } = usePWAInstallProps();

  return (
    <>
      <style>{settingsStyles}</style>
      <PageLayout>
        <Container data-current-locale={locale}>
          <PageTitle size="xl" gradient>
            {pageTitle}
          </PageTitle>

          <Section title={appearanceTitle} description={appearanceDescription}>
            <OptionList key={themePreference}>
              {themeOptions.map((option) => (
                <OptionCard
                  key={option.code}
                  data-testid={`theme-${option.code}`}
                  isActive={themePreference === option.code}
                  onPress={() => handleThemeSelect(option.code)}
                  label={option.label}
                  description={option.description}
                />
              ))}
            </OptionList>
          </Section>

          <Section title={languageTitle} description={languageDescription}>
            <PillGroup
              key={locale}
              role="group"
              aria-label={languageGroupLabel}
            >
              {languageOptions.map((option) => (
                <Button
                  key={option.code}
                  data-testid={`lang-btn-${option.code}`}
                  isActive={locale === option.code}
                  aria-pressed={locale === option.code ? 'true' : 'false'}
                  variant={locale === option.code ? 'primary' : 'secondary'}
                  size="md"
                  minWidth={90}
                  onPress={() => setLocale(option.code)}
                >
                  {option.label}
                </Button>
              ))}
            </PillGroup>
          </Section>

          <Section title={gameplayTitle} description={gameplayDescription}>
            <ToggleRow data-testid="sound-row">
              <ToggleLabel>{settingsCopy.soundLabel ?? 'Sound'}</ToggleLabel>
              <ToggleInput
                type="checkbox"
                checked={soundEnabled}
                onChange={() => setSoundEnabled(!soundEnabled)}
                aria-label={settingsCopy.soundLabel ?? 'Sound'}
              />
            </ToggleRow>
            <ToggleRow data-testid="haptics-row">
              <ToggleLabel>{hapticsLabel}</ToggleLabel>
              <ToggleInput
                type="checkbox"
                checked={hapticsEnabled}
                onChange={() => setHapticsEnabled(!hapticsEnabled)}
                aria-label={hapticsLabel}
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
                  size="sm"
                  onClick={handleAccountAction}
                  data-testid="account-logout-button"
                  flex={1}
                >
                  {accountPrimaryCta}
                </Button>
              ) : (
                <span style={{ flex: 1 }}>
                  <LinkButton
                    href="/auth"
                    variant="primary"
                    size="sm"
                    data-testid="account-signin-button"
                    fullWidth
                  >
                    {accountPrimaryCta}
                  </LinkButton>
                </span>
              )}
              <span style={{ flex: 1 }}>
                <LinkButton
                  href={supportCta.href}
                  variant="secondary"
                  size="sm"
                  fullWidth
                >
                  {accountSupportLabel}
                </LinkButton>
              </span>
            </AccountActions>
          </Section>

          <Section title={aboutTitle} description={aboutDescription}>
            <VersionText>
              {versionLabel}: {appVersion}
            </VersionText>
          </Section>

          <Section
            title="Downloads"
            description="Download the app for your device or install the web version."
          >
            <DownloadButtons
              iosHref={appConfig.downloads.iosHref}
              androidHref={appConfig.downloads.androidHref}
              onInstall={onInstall}
              onShowInstructions={onShowInstructions}
            />
          </Section>
        </Container>
      </PageLayout>
      <AppFooter />
    </>
  );
}
