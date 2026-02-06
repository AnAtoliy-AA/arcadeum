'use client';

import { useCallback } from 'react';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useThemeController } from '@/app/theme/ThemeContext';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useHapticsSetting } from '@/shared/hooks/useHapticsSetting';
import {
  DEFAULT_LOCALE,
  getMessages,
  SUPPORTED_LOCALES,
  type Locale,
} from '@/shared/i18n';
import type { ThemePreference } from '@/shared/config/theme';
import { BlockedUsersSection } from './BlockedUsersSection';
import { usePWAOptional } from '@/features/pwa';

type DownloadConfig = {
  title: string;
  description: string;
  iosLabel: string;
  androidLabel: string;
  iosHref?: string;
  androidHref?: string;
};

export type SettingsPageProps = {
  appName: string;
  downloads: DownloadConfig;
  supportCta: {
    href: string;
    label: string;
  };
  description: string;
};
const DEFAULT_TRANSLATIONS = getMessages(DEFAULT_LOCALE);
const DEFAULT_SETTINGS_COPY = DEFAULT_TRANSLATIONS.settings ?? {};
const THEME_OPTION_ORDER: ThemePreference[] = [
  'system',
  'light',
  'dark',
  'neonLight',
  'neonDark',
];

export function SettingsPage({
  appName,
  downloads,
  supportCta,
  description,
}: SettingsPageProps) {
  const { themePreference, setThemePreference } = useThemeController();
  const { hapticsEnabled, setHapticsEnabled } = useHapticsSetting();
  const { snapshot } = useSessionTokens();
  const isAuthenticated = !!snapshot.accessToken;
  const { t } = useTranslation();
  const { locale, setLocale, messages } = useLanguage();
  const pwa = usePWAOptional();
  const settingsCopy = messages.settings ?? {};
  const defaultSettings = DEFAULT_SETTINGS_COPY;
  const defaultThemeOptions = defaultSettings.themeOptions ?? {};
  const defaultLanguageLabels = defaultSettings.languageOptionLabels ?? {};

  const pageTitle = settingsCopy.title ?? defaultSettings.title ?? '';
  const pageDescription =
    formatMessage(settingsCopy.description, { appName }) ??
    formatMessage(defaultSettings.description, { appName }) ??
    description;

  const appearanceTitle =
    settingsCopy.appearanceTitle ?? defaultSettings.appearanceTitle ?? '';
  const appearanceDescription =
    formatMessage(settingsCopy.appearanceDescription, { appName }) ??
    formatMessage(defaultSettings.appearanceDescription, { appName }) ??
    '';

  const themeOptions = THEME_OPTION_ORDER.map((code) => {
    const base = defaultThemeOptions[code] ?? {};
    const override = settingsCopy.themeOptions?.[code];
    const label = override?.label ?? base.label ?? code;
    const descriptionText =
      formatMessage(override?.description, { appName }) ??
      formatMessage(base.description, { appName }) ??
      '';

    return {
      code,
      label,
      description: descriptionText,
    };
  });

  const languageTitle =
    settingsCopy.languageTitle ?? defaultSettings.languageTitle ?? '';
  const languageDescription =
    formatMessage(settingsCopy.languageDescription, { appName }) ??
    formatMessage(defaultSettings.languageDescription, { appName }) ??
    '';

  const languageOptions = SUPPORTED_LOCALES.map((code) => ({
    code,
    label:
      settingsCopy.languageOptionLabels?.[code] ??
      defaultLanguageLabels[code] ??
      code.toUpperCase(),
  }));

  const downloadsTitle =
    settingsCopy.downloadsTitle ??
    defaultSettings.downloadsTitle ??
    downloads.title;
  const downloadsDescription =
    formatMessage(settingsCopy.downloadsDescription, { appName }) ??
    formatMessage(defaultSettings.downloadsDescription, { appName }) ??
    downloads.description;

  const downloadButtons: Array<{ key: string; href: string; label: string }> =
    [];
  if (downloads.iosHref) {
    const label =
      settingsCopy.downloadsIosLabel ??
      defaultSettings.downloadsIosLabel ??
      downloads.iosLabel;
    downloadButtons.push({ key: 'ios', href: downloads.iosHref, label });
  }
  // if (downloads.androidHref) {
  //   const label =
  //     settingsCopy.downloadsAndroidLabel ??
  //     defaultSettings.downloadsAndroidLabel ??
  //     downloads.androidLabel;
  //   downloadButtons.push({
  //     key: 'android',
  //     href: downloads.androidHref,
  //     label,
  //   });
  // }

  const accountTitle =
    settingsCopy.accountTitle ?? defaultSettings.accountTitle ?? '';
  const accountDescription =
    formatMessage(settingsCopy.accountDescription, { appName }) ??
    formatMessage(defaultSettings.accountDescription, { appName }) ??
    '';
  const accountStatus =
    settingsCopy.accountGuestStatus ?? defaultSettings.accountGuestStatus ?? '';
  const accountPrimaryCta =
    settingsCopy.accountPrimaryCta ?? defaultSettings.accountPrimaryCta ?? '';
  const accountSupportLabel =
    settingsCopy.accountSupportCtaLabel ??
    defaultSettings.accountSupportCtaLabel ??
    supportCta.label;

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
          <SectionTitle>
            {settingsCopy.gameplayTitle ??
              defaultSettings.gameplayTitle ??
              'Gameplay'}
          </SectionTitle>
          <SectionDescription>
            {settingsCopy.gameplayDescription ??
              defaultSettings.gameplayDescription ??
              'Customize your in-game experience.'}
          </SectionDescription>
          <OptionList>
            <ToggleRow>
              <ToggleLabelWrapper>
                <ToggleLabel>
                  {settingsCopy.hapticsLabel ??
                    defaultSettings.hapticsLabel ??
                    'Haptic Feedback'}
                </ToggleLabel>
                <ToggleDescription>
                  {settingsCopy.hapticsDescription ??
                    defaultSettings.hapticsDescription ??
                    "Vibrate when it's your turn to play (mobile devices only)."}
                </ToggleDescription>
              </ToggleLabelWrapper>
              <ToggleInput
                checked={hapticsEnabled}
                onChange={(e) => setHapticsEnabled(e.target.checked)}
              />
            </ToggleRow>
          </OptionList>
        </Section>

        {downloadButtons.length > 0 || pwa?.canInstall ? (
          <Section>
            <SectionTitle>{downloadsTitle}</SectionTitle>
            <SectionDescription>{downloadsDescription}</SectionDescription>
            <DownloadGrid>
              {pwa?.canInstall && (
                <DownloadLink
                  as="button"
                  onClick={pwa.openModal}
                  style={{ cursor: 'pointer' }}
                  data-testid="settings-install-pwa"
                >
                  <DownloadIcon aria-hidden="true">📲</DownloadIcon>
                  <span>{t('pwa.install.button')}</span>
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

        <Section>
          <SectionTitle>{accountTitle}</SectionTitle>
          <SectionDescription>{accountDescription}</SectionDescription>
          <AccountCard>
            <AccountStatus role="status">
              {isAuthenticated ? (
                <>
                  {t('common.actions.loggedInAs') || 'Logged in as'}:{' '}
                  <strong data-testid="settings-username">
                    {snapshot.username || snapshot.displayName}
                  </strong>
                  <br />
                  <span
                    data-testid="settings-email"
                    style={{ opacity: 0.7, fontSize: '0.9em' }}
                  >
                    {snapshot.email}
                  </span>
                </>
              ) : (
                accountStatus
              )}
            </AccountStatus>
            <AccountActions>
              <ActionButton href="/auth">
                {isAuthenticated
                  ? t('common.actions.changeAccount') || 'Change Account'
                  : accountPrimaryCta}
              </ActionButton>
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
  ToggleLabelWrapper,
  ToggleLabel,
  ToggleDescription,
  ToggleInput,
} from './styles';

export default SettingsPage;
