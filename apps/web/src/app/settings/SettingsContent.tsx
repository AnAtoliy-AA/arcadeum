"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styled, { css } from "styled-components";

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

type ThemePreference = "system" | "light" | "dark" | "neonLight" | "neonDark";
type LanguagePreference = "en" | "es" | "fr";

type SettingsSnapshot = {
  themePreference: ThemePreference;
  language: LanguagePreference;
};

const STORAGE_KEY = "aicoapp_web_settings_v1";

const DEFAULT_SETTINGS: SettingsSnapshot = {
  themePreference: "system",
  language: "en",
};

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
    description: "Crisp whites with subtle gradients and light chrome.",
  },
  {
    code: "dark",
    label: "Dark",
    description: "Deep midnight palette ideal for low light play sessions.",
  },
  {
    code: "neonLight",
    label: "Neon Light",
    description: "Arcade-inspired glow with brighter panels and neon edges.",
  },
  {
    code: "neonDark",
    label: "Neon Dark",
    description: "High contrast vaporwave styling for dramatic tables.",
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

function readSettingsFromStorage(): SettingsSnapshot {
  if (typeof window === "undefined") {
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Partial<SettingsSnapshot>;
    const theme = THEME_OPTIONS.some((option) => option.code === parsed.themePreference)
      ? (parsed.themePreference as ThemePreference)
      : DEFAULT_SETTINGS.themePreference;
    const language = LANGUAGE_OPTIONS.some((option) => option.code === parsed.language)
      ? (parsed.language as LanguagePreference)
      : DEFAULT_SETTINGS.language;
    return {
      themePreference: theme,
      language,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function persistSettingsSnapshot(snapshot: SettingsSnapshot) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore persistence failures
  }
}

export default function SettingsContent({
  appName,
  downloads,
  supportCta,
  description,
}: SettingsContentProps) {
  const [settings, setSettings] = useState<SettingsSnapshot>(() =>
    readSettingsFromStorage(),
  );

  useEffect(() => {
    persistSettingsSnapshot(settings);
  }, [settings]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    if (settings.themePreference === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", settings.themePreference);
    }
  }, [settings.themePreference]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.setAttribute("lang", settings.language);
  }, [settings.language]);

  const handleThemeSelect = useCallback((code: ThemePreference) => {
    setSettings((current) => {
      if (current.themePreference === code) {
        return current;
      }
      return { ...current, themePreference: code };
    });
  }, []);

  const handleLanguageSelect = useCallback((code: LanguagePreference) => {
    setSettings((current) => {
      if (current.language === code) {
        return current;
      }
      return { ...current, language: code };
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
                $active={settings.themePreference === option.code}
                onClick={() => handleThemeSelect(option.code)}
                aria-pressed={settings.themePreference === option.code}
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
                $active={settings.language === option.code}
                onClick={() => handleLanguageSelect(option.code)}
                aria-pressed={settings.language === option.code}
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
  background-color: var(--background);
  color: var(--foreground);
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
  background: var(--card-background);
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: clamp(2rem, 5vw, 3.5rem);
  box-shadow: 0 32px 80px rgba(5, 0, 40, 0.35);
  backdrop-filter: blur(18px);
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 2.8rem);
  font-weight: 700;
`;

const Description = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--muted-foreground);
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--surface-background);
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: clamp(1.75rem, 4vw, 2.5rem);
  box-shadow: 0 22px 60px rgba(5, 0, 40, 0.32);
  backdrop-filter: blur(14px);
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
`;

const SectionDescription = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--muted-foreground);
`;

const OptionList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const activeOptionStyles = css`
  border-color: rgba(143, 155, 255, 0.6);
  background: rgba(15, 11, 46, 0.75);
  box-shadow: 0 18px 56px rgba(87, 195, 255, 0.25);
`;

const OptionButton = styled.button<{ $active: boolean }>`
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1.1rem 1.25rem;
  border-radius: 18px;
  border: 1px solid var(--card-border);
  background: rgba(10, 7, 36, 0.4);
  color: var(--foreground);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
    outline-offset: 3px;
  }

  ${(props) => (props.$active ? activeOptionStyles : null)}

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: rgba(163, 176, 255, 0.65);
    }
  }
`;

const OptionLabel = styled.span`
  font-size: 1.05rem;
  font-weight: 600;
`;

const OptionDescription = styled.span`
  font-size: 0.9rem;
  color: var(--muted-foreground);
`;

const PillGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const PillButton = styled.button<{ $active: boolean }>`
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: ${(props) => (props.$active ? "rgba(143, 155, 255, 0.25)" : "rgba(10, 7, 36, 0.25)")};
  color: var(--foreground);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

  ${(props) =>
    props.$active
      ? css`
          border-color: rgba(143, 155, 255, 0.6);
          box-shadow: 0 12px 32px rgba(87, 195, 255, 0.2);
        `
      : null}

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-1px);
      border-color: rgba(163, 176, 255, 0.55);
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
  border: 1px solid var(--card-border);
  background: rgba(15, 11, 46, 0.6);
  color: var(--foreground);
  font-weight: 600;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: rgba(210, 220, 255, 0.6);
    }
  }
`;

const DownloadIcon = styled.span`
  font-size: 0.9rem;
  line-height: 1;
`;

const AccountCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: rgba(10, 7, 36, 0.35);
  border-radius: 18px;
  border: 1px solid var(--card-border);
  padding: 1.5rem;
`;

const AccountStatus = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: var(--muted-foreground);
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
  transition: transform 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease;
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
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
  background: linear-gradient(135deg, #57c3ff, #8f9bff);
  color: #050316;
  border: 1px solid transparent;
`;

const SecondaryButton = styled(Link)`
  ${baseActionStyles}
  border: 1px solid rgba(143, 155, 255, 0.45);
  background: rgba(15, 11, 46, 0.6);
  color: var(--foreground);
`;
