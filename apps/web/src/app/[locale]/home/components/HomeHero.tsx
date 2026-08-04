import { Suspense } from 'react';
import Link from 'next/link';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { SupportIcon } from '@arcadeum/ui';
import { getTranslations } from '@/shared/i18n/server';
import { HeroBackground } from './HeroBackground';
import { HeroCardStack } from './HeroCardStack';

export default async function HomeHero() {
  const messages = await getTranslations();
  const homeCopy = messages.home ?? {};
  const routes = buildRoutes('en');

  const kicker = homeCopy.kicker ?? 'Free online board games';
  const tagline =
    homeCopy.tagline?.replace('{{appName}}', appConfig.appName) ??
    `${appConfig.appName} is the ultimate platform to play board games online with friends.`;
  const description =
    homeCopy.description?.replace('{{appName}}', appConfig.appName) ??
    `Enjoy a wide variety of board games and tabletop experiences online. Create real-time game rooms, invite your friends, and let ${appConfig.appName} handle rules, scoring, and turns so you can focus on the fun.`;
  const primaryLabel = homeCopy.primaryCtaLabel ?? 'Get started';
  const playWithBotsLabel = homeCopy.playWithBotsLabel ?? 'Play vs AI';
  const supportLabel = homeCopy.supportCtaLabel ?? 'Support the developers';
  const playLabel = homeCopy.heroCardPlayCta ?? 'Play';

  return (
    <section
      className="hero-section-container"
      aria-labelledby="hero-heading"
      data-testid="hero-section"
    >
      <HeroBackground />

      <div className="hero-container-main">
        <div className="hero-content-main">
          <div className="animate-fade-in-up hero-delay-200">
            <span className="hero-kicker-main kicker-hydration-shimmer">
              ✦ {kicker}
            </span>
          </div>

          {/*
           * Title is intentionally NOT wrapped in animate-fade-in-up so it
           * paints at full opacity at FCP and becomes the LCP element with
           * minimal latency. The kicker, tagline, description, and CTAs
           * still fade in for visual rhythm.
           */}
          <h1
            id="hero-heading"
            className="hero-title-main hero-title-shimmer"
            data-text="Arcadeum"
          >
            Arcadeum
            <span className="hero-title-sub">Games</span>
          </h1>

          <div className="animate-fade-in-up hero-delay-100">
            <p className="hero-tagline-main">{tagline}</p>
          </div>

          <div className="animate-fade-in-up hero-delay-300">
            <p className="hero-description-main">{description}</p>
          </div>

          <div className="animate-fade-in-up hero-delay-400">
            <div className="hero-actions-responsive">
              <Link
                href={routes.games}
                className="home-link-button home-link-button-primary"
              >
                {primaryLabel}
              </Link>
              <Link
                href={`${routes.games}?status=lobby,in_progress`}
                className="home-link-button home-link-button-ghost"
              >
                {playWithBotsLabel}
              </Link>
              <Link
                href={appConfig.supportCta.href}
                className="home-link-button home-link-button-ghost home-btn-gap-2"
              >
                <SupportIcon size={18} />
                {supportLabel}
              </Link>
            </div>
          </div>
        </div>

        <Suspense>
          <HeroCardStack playLabel={playLabel} />
        </Suspense>
      </div>
    </section>
  );
}
