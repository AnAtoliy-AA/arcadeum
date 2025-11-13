"use client";

import Link from "next/link";
import styled from "styled-components";

import { useLanguage, formatMessage } from "@/app/i18n/LanguageProvider";
import { appConfig } from "@/lib/app-config";

const Page = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1.5rem;
  background:
    radial-gradient(circle at top left, ${({ theme }) => theme.background.radialStart}, transparent 55%),
    radial-gradient(circle at bottom right, ${({ theme }) => theme.background.radialEnd}, transparent 55%),
    ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
  font-family: var(--font-geist-sans);

  @media (max-width: 640px) {
    padding: 2.5rem 1.25rem;
  }
`;

const Hero = styled.section`
  width: min(760px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  text-align: center;
  padding: 3rem clamp(1.5rem, 5vw, 3.5rem);
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.surfaces.hero.border};
  background: ${({ theme }) => theme.surfaces.hero.background};
  box-shadow: ${({ theme }) => theme.surfaces.hero.shadow};
  backdrop-filter: blur(18px);

  @media (max-width: 640px) {
    padding: 2.5rem 1.5rem;
    gap: 1.25rem;
  }
`;

const Kicker = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.accentSoft};
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 3.4rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.text.secondary};
`;

const Tagline = styled.p`
  margin: 0;
  font-size: clamp(1.15rem, 3vw, 1.35rem);
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

const Description = styled.p`
  margin: 0;
  max-width: 600px;
  font-size: 1.05rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.text.muted};
`;

const Actions = styled.div`
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  justify-content: center;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem 1.9rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const PrimaryAction = styled(ActionLink)`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) => theme.buttons.primary.gradientEnd}
  );
  color: ${({ theme }) => theme.buttons.primary.text};
  box-shadow: ${({ theme }) => theme.buttons.primary.shadow};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.buttons.primary.hoverShadow};
    }
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const SecondaryAction = styled(ActionLink)`
  border: 1px solid ${({ theme }) => theme.buttons.secondary.border};
  color: ${({ theme }) => theme.buttons.secondary.text};
  background: ${({ theme }) => theme.buttons.secondary.background};

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: ${({ theme }) => theme.buttons.secondary.hoverBorder};
      background: ${({ theme }) => theme.buttons.secondary.hoverBackground};
    }
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const DownloadSection = styled.div`
  margin-top: 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  text-align: center;
`;

const DownloadTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const DownloadDescription = styled.p`
  margin: 0;
  max-width: 520px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;

const DownloadButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.interactive.download.border};
  background: ${({ theme }) => theme.interactive.download.background};
  color: ${({ theme }) => theme.text.primary};
  text-decoration: none;
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

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const DownloadIcon = styled.span`
  font-size: 0.9rem;
  line-height: 1;
  color: ${({ theme }) => theme.text.accent};
`;

export default function Home() {
  const {
    appName,
    kicker: configKicker,
    tagline: configTagline,
    description: configDescription,
    primaryCta,
    supportCta,
    downloads,
  } = appConfig;
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};

  const kicker = formatMessage(homeCopy.kicker, { appName }) ?? configKicker;
  const tagline = formatMessage(homeCopy.tagline, { appName }) ?? configTagline;
  const description = formatMessage(homeCopy.description, { appName }) ?? configDescription;
  const primaryLabel = homeCopy.primaryCtaLabel ?? primaryCta.label;
  const supportLabel = homeCopy.supportCtaLabel ?? supportCta.label;
  const downloadsTitle = homeCopy.downloadsTitle ?? downloads.title;
  const downloadsDescription =
    formatMessage(homeCopy.downloadsDescription, { appName }) ?? downloads.description;
  const iosLabel = homeCopy.downloadsIosLabel ?? downloads.iosLabel;
  const androidLabel = homeCopy.downloadsAndroidLabel ?? downloads.androidLabel;
  const hasDownloadLinks = Boolean(downloads.iosHref || downloads.androidHref);

  return (
    <Page>
      <Hero aria-labelledby="hero-heading">
        <Kicker>{kicker}</Kicker>
        <Title id="hero-heading">{appName}</Title>
        <Tagline>{tagline}</Tagline>
        <Description>{description}</Description>
        <Actions>
          <PrimaryAction href={primaryCta.href}>{primaryLabel}</PrimaryAction>
          <SecondaryAction href={supportCta.href}>{supportLabel}</SecondaryAction>
        </Actions>
        {hasDownloadLinks ? (
          <DownloadSection>
            <DownloadTitle>{downloadsTitle}</DownloadTitle>
            <DownloadDescription>{downloadsDescription}</DownloadDescription>
            <DownloadButtons>
              {downloads.iosHref ? (
                <DownloadButton
                  href={downloads.iosHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon aria-hidden="true">↓</DownloadIcon>
                  <span>{iosLabel}</span>
                </DownloadButton>
              ) : null}
              {downloads.androidHref ? (
                <DownloadButton
                  href={downloads.androidHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon aria-hidden="true">↓</DownloadIcon>
                  <span>{androidLabel}</span>
                </DownloadButton>
              ) : null}
            </DownloadButtons>
          </DownloadSection>
        ) : null}
      </Hero>
    </Page>
  );
}
