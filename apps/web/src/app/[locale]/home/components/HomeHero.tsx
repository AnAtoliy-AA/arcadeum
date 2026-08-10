import Image from 'next/image';
import Link from 'next/link';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { SupportIcon } from '@arcadeum/ui';
import { getTranslations } from '@/shared/i18n/server';
import { HeroBackground } from './HeroBackground';
import { HeroCardStack } from './HeroCardStack';
import { HeroPlayVsAiButton } from './HeroPlayVsAiButton';

const HERO_CARDS = [
  {
    id: 'fantasy',
    nameKey: 'games.critical_v1.variants.fantasy.name',
    bgImage: '/images/variants/fantasy_bg.webp',
  },
  {
    id: 'galaxy',
    nameKey: 'games.critical_v1.variants.galaxy.name',
    bgImage: '/images/variants/galaxy_bg.webp',
  },
  {
    id: 'steampunk',
    nameKey: 'games.critical_v1.variants.steampunk.name',
    bgImage: '/images/variants/steampunk_bg.webp',
  },
] as const;

const FAN_OFFSET = 140;

export default async function HomeHero() {
  const messages = await getTranslations();
  const homeCopy = messages.home ?? {};
  const gamesCopy = messages.games ?? {};
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
              <HeroPlayVsAiButton label={playWithBotsLabel} />
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

        {/* Server-rendered hero cards — images are in the initial HTML for LCP.
            HeroCardStack adds pointer interactivity after hydration. */}
        <div data-testid="hero-visual" className="hero-visual-main">
          <HeroCardStack playLabel={playLabel}>
            {HERO_CARDS.map((card, index) => {
              const x = (index - 1) * FAN_OFFSET;
              const rotate = `${(index - 1) * 12}deg`;
              const isLast = index === HERO_CARDS.length - 1;
              const gameName =
                (gamesCopy as Record<string, Record<string, string>>)?.[card.id]
                  ?.name ?? card.id;

              return (
                <Link
                  key={card.id}
                  href={`${routes.gameCreate}?variant=${card.id}`}
                  className="hero-card-main"
                  style={
                    {
                      '--card-x': `${x}px`,
                      '--card-y': '0px',
                      '--card-rotate': rotate,
                      '--card-scale': index === 1 ? 1.04 : 1,
                      zIndex: index,
                      opacity: isLast ? 1 : 0.8,
                    } as React.CSSProperties
                  }
                  data-testid={`hero-card-${index}`}
                >
                  <Image
                    src={card.bgImage}
                    alt={`${gameName} game card preview`}
                    fill
                    quality={70}
                    sizes="(max-width: 1150px) 240px, 280px"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjM4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMzIzNTNkIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjM4MCIvPjwvc3ZnPg=="
                    className="hero-card-image"
                  />
                  <div className="hero-card-scrim hero-card-scrim-top" />
                  <div className="hero-card-scrim hero-card-scrim-bottom" />
                  <div className="hero-card-name">{gameName}</div>
                  <div className="hero-card-brand">CRITICAL</div>
                  <span
                    className="hero-card-play-cta"
                    data-testid={`hero-play-cta-${index}`}
                  >
                    {playLabel}
                  </span>
                </Link>
              );
            })}
          </HeroCardStack>
        </div>
      </div>
    </section>
  );
}
