"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import styled, { css } from "styled-components";

import { useLanguage, formatMessage } from "@/app/i18n/LanguageProvider";
import { useThemeController } from "@/app/theme/ThemeContext";
import { SUPPORTED_LOCALES, type Locale } from "@/shared/i18n";
import type { ThemePreference } from "@/shared/config/theme";

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
const SETTINGS_TITLE_FALLBACK = "Settings";
const SETTINGS_DESCRIPTION_TEMPLATE =
  "Manage your appearance, language, and download preferences for the {appName} web experience.";
const APPEARANCE_TITLE_FALLBACK = "Appearance";
const APPEARANCE_DESCRIPTION_TEMPLATE =
  "Choose a theme to use across the {appName} web experience.";
const LANGUAGE_TITLE_FALLBACK = "Language";
const LANGUAGE_DESCRIPTION_FALLBACK =
  "Interface translations are a work in progress. Save your preference for upcoming updates.";
const DOWNLOADS_TITLE_FALLBACK = "Mobile builds";
const DOWNLOADS_DESCRIPTION_FALLBACK =
  "Grab the latest Expo builds to keep the mobile clients in sync with the web release.";
const ACCOUNT_TITLE_FALLBACK = "Account";
const ACCOUNT_DESCRIPTION_FALLBACK =
  "Web sign-in is rolling out soon. In the meantime, manage your subscriptions via the dashboard or continue in the mobile app.";
const ACCOUNT_STATUS_FALLBACK = "You are browsing as a guest.";
const ACCOUNT_PRIMARY_CTA_FALLBACK = "Go to sign-in";

const DEFAULT_THEME_OPTIONS: Array<{
  code: ThemePreference;
  label: string;
  description: string;
}> = [
  {
    code: "system",
    label: "Match system appearance",
    description: "Follow your operating system preference automatically.",
  },
  {
    code: "light",
    label: "Light",
    description: "Bright neutrals with airy surfaces and subtle gradients.",
  },
  {
    code: "dark",
    label: "Dark",
    description: "Contemporary midnight palette ideal for low-light play.",
  },
  {
    code: "neonLight",
    label: "Neon Light",
    description: "Arcade-inspired glow with luminous panels and neon edges.",
  },
  {
    code: "neonDark",
    label: "Neon Dark",
    description: "High-contrast vaporwave styling for dramatic game tables.",
  },
];

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

export function SettingsPage({
  appName,
  downloads,
  supportCta,
  description,
}: SettingsPageProps) {
  const { themePreference, setThemePreference } = useThemeController();
  const { locale, setLocale, messages } = useLanguage();
  const settingsCopy = messages.settings ?? {};

  const fallbackSettingsDescription =
    formatMessage(SETTINGS_DESCRIPTION_TEMPLATE, { appName }) ??
    SETTINGS_DESCRIPTION_TEMPLATE.replace("{appName}", appName);
  const pageTitle = settingsCopy.title ?? SETTINGS_TITLE_FALLBACK;
  const pageDescription =
    formatMessage(settingsCopy.description, { appName }) ?? description ?? fallbackSettingsDescription;

  const fallbackAppearanceDescription =
    formatMessage(APPEARANCE_DESCRIPTION_TEMPLATE, { appName }) ??
    APPEARANCE_DESCRIPTION_TEMPLATE.replace("{appName}", appName);
  const appearanceTitle = settingsCopy.appearanceTitle ?? APPEARANCE_TITLE_FALLBACK;
  const appearanceDescription =
    formatMessage(settingsCopy.appearanceDescription, { appName }) ?? fallbackAppearanceDescription;

  const themeOptions = useMemo(
    () =>
      DEFAULT_THEME_OPTIONS.map((option) => {
        const override = settingsCopy.themeOptions?.[option.code];
        const descriptionOverride =
          formatMessage(override?.description, { appName }) ?? option.description;
        return {
          ...option,
          label: override?.label ?? option.label,
          description: descriptionOverride,
        };
      }),
    [appName, settingsCopy.themeOptions],
  );

  const languageTitle = settingsCopy.languageTitle ?? LANGUAGE_TITLE_FALLBACK;
  const languageDescription = settingsCopy.languageDescription ?? LANGUAGE_DESCRIPTION_FALLBACK;

  const languageOptions = useMemo(
    () =>
      SUPPORTED_LOCALES.map((code) => ({
        code,
        label: settingsCopy.languageOptionLabels?.[code] ?? LANGUAGE_LABELS[code],
      })),
    [settingsCopy.languageOptionLabels],
  );

  const downloadsTitle = settingsCopy.downloadsTitle ?? downloads.title ?? DOWNLOADS_TITLE_FALLBACK;
  const downloadsDescription =
    formatMessage(settingsCopy.downloadsDescription, { appName }) ??
    downloads.description ??
    DOWNLOADS_DESCRIPTION_FALLBACK;

  const downloadButtons = useMemo(() => {
    const buttons: Array<{ key: string; href: string; label: string }> = [];
    if (downloads.iosHref) {
      const label = settingsCopy.downloadsIosLabel ?? downloads.iosLabel;
      buttons.push({ key: "ios", href: downloads.iosHref, label });
    }
    if (downloads.androidHref) {
      const label = settingsCopy.downloadsAndroidLabel ?? downloads.androidLabel;
      buttons.push({ key: "android", href: downloads.androidHref, label });
    }
    return buttons;
  }, [downloads.androidHref, downloads.androidLabel, downloads.iosHref, downloads.iosLabel, settingsCopy.downloadsAndroidLabel, settingsCopy.downloadsIosLabel]);

  const accountTitle = settingsCopy.accountTitle ?? ACCOUNT_TITLE_FALLBACK;
  const accountDescription =
    formatMessage(settingsCopy.accountDescription, { appName }) ?? ACCOUNT_DESCRIPTION_FALLBACK;
  const accountStatus = settingsCopy.accountGuestStatus ?? ACCOUNT_STATUS_FALLBACK;
  const accountPrimaryCta = settingsCopy.accountPrimaryCta ?? ACCOUNT_PRIMARY_CTA_FALLBACK;
  const accountSupportLabel = settingsCopy.accountSupportCtaLabel ?? supportCta.label;

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
              <SecondaryButton href={supportCta.href}>{accountSupportLabel}</SecondaryButton>
            </AccountActions>
          </AccountCard>
        </Section>
      </Wrapper>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem);
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

const Wrapper = styled.div`
  width: min(960px, 100%);
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 4vw, 3rem);
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${({ theme }) => theme.surfaces.hero.background};
  border: 1px solid ${({ theme }) => theme.surfaces.hero.border};
  border-radius: 24px;
  padding: clamp(2rem, 5vw, 3.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.hero.shadow};
  backdrop-filter: blur(18px);
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 2.8rem);
  font-weight: 700;
  color: ${({ theme }) => theme.text.secondary};
`;

const Description = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  border-radius: 24px;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
  backdrop-filter: blur(14px);
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const SectionDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

const OptionList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const activeOptionStyles = css`
  border-color: ${({ theme }) => theme.interactive.option.activeBorder};
  background: ${({ theme }) => theme.interactive.option.activeBackground};
  box-shadow: ${({ theme }) => theme.interactive.option.activeShadow};
`;

const OptionButton = styled.button<{ $active: boolean }>`
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.1rem 1.25rem;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.interactive.option.border};
  background: ${({ theme }) => theme.interactive.option.background};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  ${(props) => (props.$active ? activeOptionStyles : null)}

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.interactive.option.hoverBorder};
    }
  }
`;

const OptionLabel = styled.span`
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const OptionDescription = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text.muted};
`;

const PillGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const PillButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.interactive.pill.activeBorder : theme.interactive.pill.border)};
  background: ${({ $active, theme }) =>
    $active ? theme.interactive.pill.activeBackground : theme.interactive.pill.inactiveBackground};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;

  ${(props) =>
    props.$active
      ? css`
          box-shadow: ${props.theme.interactive.pill.activeShadow};
        `
      : null}

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-1px);
      border-color: ${({ theme }) => theme.interactive.pill.hoverBorder};
    }
  }
`;

const DownloadGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const DownloadLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.interactive.download.border};
  background: ${({ theme }) => theme.interactive.download.background};
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.interactive.download.hoverBorder};
      background: ${({ theme }) => theme.interactive.download.hoverBackground};
    }
  }
`;

const DownloadIcon = styled.span`
  font-size: 0.9rem;
  line-height: 1;
  color: ${({ theme }) => theme.text.accent};
`;

const AccountCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${({ theme }) => theme.account.cardBackground};
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.account.border};
  padding: 1.5rem;
`;

const AccountStatus = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.text.muted};
`;

const AccountActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const baseActionStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const ActionButton = styled(Link)`
  ${baseActionStyles}
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd}
  );
  color: ${({ theme }) => theme.buttons.primary.text};
  border: 1px solid transparent;
  box-shadow: ${({ theme }) => theme.buttons.primary.shadow};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      box-shadow: ${({ theme }) => theme.buttons.primary.hoverShadow};
    }
  }
`;

const SecondaryButton = styled(Link)`
  ${baseActionStyles}
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
  background: ${({ theme }) => theme.buttons.secondary.background};
  color: ${({ theme }) => theme.buttons.secondary.text};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
      background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
    }
  }
`;

export default SettingsPage;
