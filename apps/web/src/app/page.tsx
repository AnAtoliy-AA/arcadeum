"use client";

import Link from "next/link";
import styled from "styled-components";

import { appConfig } from "@/lib/app-config";

const Page = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(87, 195, 255, 0.35), transparent 55%),
    radial-gradient(circle at bottom right, rgba(255, 106, 247, 0.35), transparent 55%),
    #06011b;
  color: #f5f7ff;
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
  border: 1px solid rgba(245, 247, 255, 0.08);
  background: rgba(6, 1, 27, 0.58);
  box-shadow: 0 32px 80px rgba(5, 0, 40, 0.35);
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
  color: rgba(223, 230, 255, 0.7);
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 3.4rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #f7f8ff;
`;

const Tagline = styled.p`
  margin: 0;
  font-size: clamp(1.15rem, 3vw, 1.35rem);
  font-weight: 500;
  color: rgba(223, 230, 255, 0.9);
`;

const Description = styled.p`
  margin: 0;
  max-width: 600px;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(223, 230, 255, 0.82);
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
    outline: 2px solid rgba(255, 255, 255, 0.9);
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
  background: linear-gradient(135deg, #57c3ff, #8f9bff);
  color: #050316;
  box-shadow: 0 12px 30px rgba(87, 195, 255, 0.35);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 36px rgba(87, 195, 255, 0.45);
    }
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const SecondaryAction = styled(ActionLink)`
  border: 1px solid rgba(135, 152, 255, 0.45);
  color: #9fb3ff;
  background: rgba(15, 11, 46, 0.6);

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: rgba(163, 176, 255, 0.65);
      background: rgba(24, 19, 70, 0.72);
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
  color: #f7f8ff;
`;

const DownloadDescription = styled.p`
  margin: 0;
  max-width: 520px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(223, 230, 255, 0.75);
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
  border: 1px solid rgba(245, 247, 255, 0.28);
  background: rgba(15, 11, 46, 0.6);
  color: #f5f7ff;
  text-decoration: none;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
    outline-offset: 3px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      transform: translateY(-2px);
      border-color: rgba(210, 220, 255, 0.6);
      background: rgba(15, 11, 46, 0.72);
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
`;

export default function Home() {
  const { appName, kicker, tagline, description, primaryCta, supportCta, downloads } =
    appConfig;
  const hasDownloadLinks = Boolean(downloads.iosHref || downloads.androidHref);

  return (
    <Page>
      <Hero aria-labelledby="hero-heading">
        <Kicker>{kicker}</Kicker>
        <Title id="hero-heading">{appName}</Title>
        <Tagline>{tagline}</Tagline>
        <Description>{description}</Description>
        <Actions>
          <PrimaryAction href={primaryCta.href}>{primaryCta.label}</PrimaryAction>
          <SecondaryAction href={supportCta.href}>{supportCta.label}</SecondaryAction>
        </Actions>
        {hasDownloadLinks ? (
          <DownloadSection>
            <DownloadTitle>{downloads.title}</DownloadTitle>
            <DownloadDescription>{downloads.description}</DownloadDescription>
            <DownloadButtons>
              {downloads.iosHref ? (
                <DownloadButton
                  href={downloads.iosHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon aria-hidden="true">↓</DownloadIcon>
                  <span>{downloads.iosLabel}</span>
                </DownloadButton>
              ) : null}
              {downloads.androidHref ? (
                <DownloadButton
                  href={downloads.androidHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadIcon aria-hidden="true">↓</DownloadIcon>
                  <span>{downloads.androidLabel}</span>
                </DownloadButton>
              ) : null}
            </DownloadButtons>
          </DownloadSection>
        ) : null}
      </Hero>
    </Page>
  );
}
