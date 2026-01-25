'use client';

import styled from 'styled-components';

import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
import { PageTitle, LinkButton } from '@/shared/ui';
import { usePlatform } from '@/shared/hooks/usePlatform';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';

const Page = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1.5rem;
  background: radial-gradient(
      circle at top left,
      ${({ theme }) => theme.background.radialStart},
      transparent 55%
    ),
    radial-gradient(
      circle at bottom right,
      ${({ theme }) => theme.background.radialEnd},
      transparent 55%
    ),
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

const HeroTitle = styled(PageTitle)`
  color: ${({ theme }) => theme.text.secondary};
  letter-spacing: 0.02em;
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
    width: 100%;
  }
`;

const PrimaryAction = styled(LinkButton).attrs({
  variant: 'primary',
  size: 'lg',
})`
  border-radius: 999px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const SecondaryAction = styled(LinkButton).attrs({
  variant: 'secondary',
  size: 'lg',
})`
  border-radius: 999px;

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

const DownloadButton = styled(LinkButton).attrs({
  variant: 'secondary',
  external: true,
})`
  border-radius: 999px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export function HomePage() {
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
  const { isIos: _isIos, isAndroid } = usePlatform();
  const { snapshot, hydrated } = useSessionTokens();
  const homeCopy = messages.home ?? {};

  const kicker = formatMessage(homeCopy.kicker, { appName }) ?? configKicker;
  const tagline = formatMessage(homeCopy.tagline, { appName }) ?? configTagline;
  const description =
    formatMessage(homeCopy.description, { appName }) ?? configDescription;
  const primaryLabel = homeCopy.primaryCtaLabel ?? primaryCta.label;
  const supportLabel = homeCopy.supportCtaLabel ?? supportCta.label;
  const downloadsTitle = homeCopy.downloadsTitle ?? downloads.title;
  const downloadsDescription =
    formatMessage(homeCopy.downloadsDescription, { appName }) ??
    downloads.description;
  const iosLabel = homeCopy.downloadsIosLabel ?? downloads.iosLabel;
  const _androidLabel =
    homeCopy.downloadsAndroidLabel ?? downloads.androidLabel;
  const hasDownloadLinks = Boolean(downloads.iosHref || downloads.androidHref);

  const isAuthenticated = hydrated && !!snapshot.accessToken;
  const primaryHref = isAuthenticated ? '/games' : primaryCta.href;

  return (
    <Page>
      <Hero aria-labelledby="hero-heading">
        <Kicker>{kicker}</Kicker>
        <HeroTitle id="hero-heading" size="xl">
          {appName}
        </HeroTitle>
        <Tagline>{tagline}</Tagline>
        <Description>{description}</Description>
        <Actions>
          <PrimaryAction href={primaryHref}>{primaryLabel}</PrimaryAction>
          <SecondaryAction href={supportCta.href}>
            {supportLabel}
          </SecondaryAction>
        </Actions>
        {hasDownloadLinks ? (
          <DownloadSection>
            <DownloadTitle>{downloadsTitle}</DownloadTitle>
            <DownloadDescription>{downloadsDescription}</DownloadDescription>
            <DownloadButtons>
              {downloads.iosHref && !isAndroid ? (
                <DownloadButton href={downloads.iosHref}>
                  ↓ {iosLabel}
                </DownloadButton>
              ) : null}
              {/* {downloads.androidHref && !isIos ? (
                <DownloadButton href={downloads.androidHref}>
                  ↓ {androidLabel}
                </DownloadButton>
              ) : null} */}
            </DownloadButtons>
          </DownloadSection>
        ) : null}
      </Hero>
    </Page>
  );
}

export default HomePage;
