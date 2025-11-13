"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styled, { css } from "styled-components";

import { useThemeController } from "@/app/theme/ThemeContext";
import { loadStoredSettings, saveStoredSettings } from "@/lib/settings-storage";
import type { ThemePreference } from "@/lib/theme";

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

type LanguagePreference = "en" | "es" | "fr";

const DEFAULT_LANGUAGE: LanguagePreference = "en";

const THEME_OPTIONS: Array<{
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

const LANGUAGE_OPTIONS: Array<{
  code: LanguagePreference;
  label: string;
}> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

function readStoredLanguage(): LanguagePreference {
  const stored = loadStoredSettings();
  if (stored.language && LANGUAGE_OPTIONS.some((option) => option.code === stored.language)) {
    return stored.language as LanguagePreference;
  }
  return DEFAULT_LANGUAGE;
}

export default function SettingsContent({
  appName,
  downloads,
  supportCta,
  description,
}: SettingsContentProps) {
  const { themePreference, setThemePreference } = useThemeController();
  const [language, setLanguage] = useState<LanguagePreference>(DEFAULT_LANGUAGE);
  const hasHydratedLanguage = useRef(false);

  useEffect(() => {
    const storedLanguage = readStoredLanguage();
    if (storedLanguage !== DEFAULT_LANGUAGE) {
      const apply = () => {
        setLanguage(storedLanguage);
      };
      if (typeof queueMicrotask === "function") {
        queueMicrotask(apply);
      } else {
        Promise.resolve().then(apply);
      }
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedLanguage.current) {
      hasHydratedLanguage.current = true;
      return;
    }
    saveStoredSettings({ language });
  }, [language]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const handleThemeSelect = useCallback(
    (code: ThemePreference) => {
      setThemePreference(code);
    },
    [setThemePreference],
  );

  const handleLanguageSelect = useCallback((code: LanguagePreference) => {
    setLanguage((current) => {
      if (current === code) {
        return current;
      }
      return code;
    });
  }, []);

  const downloadButtons = useMemo(() => {
    const buttons: Array<{ href: string; label: string }> = [];
    if (downloads.iosHref) {
      buttons.push({ href: downloads.iosHref, label: downloads.iosLabel });
    }
    if (downloads.androidHref) {
      buttons.push({ href: downloads.androidHref, label: downloads.androidLabel });
    }
    return buttons;
  }, [downloads]);

  return (
    <Page>
      <Wrapper>
        <Header>
          <Title>Settings</Title>
          <Description>{description}</Description>
        </Header>

        <Section>
          <SectionTitle>Appearance</SectionTitle>
          <SectionDescription>
            Choose a theme to use across the {appName} web experience.
          </SectionDescription>
          <OptionList>
            {THEME_OPTIONS.map((option) => (
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
          <SectionTitle>Language</SectionTitle>
          <SectionDescription>
            Interface translations are a work in progress. Save your preference for upcoming updates.
          </SectionDescription>
          <PillGroup role="group" aria-label="Language preferences">
            {LANGUAGE_OPTIONS.map((option) => (
              <PillButton
                key={option.code}
                type="button"
                $active={language === option.code}
                onClick={() => handleLanguageSelect(option.code)}
                aria-pressed={language === option.code}
              >
                {option.label}
              </PillButton>
            ))}
          </PillGroup>
        </Section>

        {downloadButtons.length > 0 ? (
          <Section>
            <SectionTitle>Mobile builds</SectionTitle>
            <SectionDescription>
              Grab the latest Expo builds to keep the mobile clients in sync with the web release.
            </SectionDescription>
            <DownloadGrid>
              {downloadButtons.map((button) => (
                <DownloadLink key={button.label} href={button.href} target="_blank" rel="noopener noreferrer">
                  <DownloadIcon aria-hidden="true">↓</DownloadIcon>
                  <span>{button.label}</span>
                </DownloadLink>
              ))}
            </DownloadGrid>
          </Section>
        ) : null}

        <Section>
          <SectionTitle>Account</SectionTitle>
          <SectionDescription>
            Web sign-in is rolling out soon. In the meantime, manage your subscriptions via the dashboard or continue in the mobile app.
          </SectionDescription>
          <AccountCard>
            <AccountStatus role="status">You are browsing as a guest.</AccountStatus>
            <AccountActions>
              <ActionButton href="/auth">Go to sign-in</ActionButton>
              <SecondaryButton href={supportCta.href}>{supportCta.label}</SecondaryButton>
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
