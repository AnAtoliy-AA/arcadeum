import Image from 'next/image';
import Link from 'next/link';
import { LinkButton, SupportIcon } from '@arcadeum/ui';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getHomeTranslations } from '@/shared/i18n/server';
import type { Locale } from '@/shared/i18n';
import { HeroBackground } from './HeroBackground';
import { HeroCardStack } from './HeroCardStack';
import { HeroPlayVsAiButton } from './HeroPlayVsAiButton';
import {
  HERO_VARIANT_BG_IMAGES,
  HERO_CARD_FAN_OFFSET,
} from '../data/heroVariants';

const HERO_CARDS = [
  {
    id: 'fantasy',
    nameKey: 'games.critical_v1.variants.fantasy.name',
    bgImage: HERO_VARIANT_BG_IMAGES[0],
  },
  {
    id: 'galaxy',
    nameKey: 'games.critical_v1.variants.galaxy.name',
    bgImage: HERO_VARIANT_BG_IMAGES[1],
  },
  {
    id: 'steampunk',
    nameKey: 'games.critical_v1.variants.steampunk.name',
    bgImage: HERO_VARIANT_BG_IMAGES[2],
  },
] as const;

const FAN_OFFSET = HERO_CARD_FAN_OFFSET;

const HERO_CARD_TRANSITION =
  'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s ease-out, box-shadow 0.3s ease';

export default async function HomeHero({ locale }: { locale: Locale }) {
  const messages = await getHomeTranslations(locale);
  const homeCopy = messages.home ?? {};
  const gamesCopy = messages.games ?? {};
  const routes = buildRoutes(locale);

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
      className="hero-section-container relative flex min-h-[90vh] w-full flex-col items-center"
      aria-labelledby="hero-heading"
      data-testid="hero-section"
    >
      <HeroBackground />

      <div className="hero-container-main mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 py-6 min-[1151px]:flex-row min-[1151px]:justify-between">
        <div className="hero-content-main relative z-[2] flex w-full max-w-[600px] flex-col items-start gap-2 min-[1151px]:gap-3">
          <div className="animate-[fadeInUp_0.6s_ease-out_both] [animation-delay:0.2s]">
            <span className="inline-flex items-center rounded-full border border-accent px-5 py-2 text-[16px] font-bold uppercase tracking-[2px] text-accent opacity-80">
              ✦ {kicker}
            </span>
          </div>

          <h1
            id="hero-heading"
            className="relative m-0 block p-0 text-center text-[140px] font-black leading-[1.1] tracking-[-4px] text-[#042f2e] [-webkit-text-fill-color:#042f2e] text-shadow-hero3d [perspective:1000px] [transform-style:preserve-3d] animate-hero-float-3d transition-transform duration-200 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] max-[1150px]:text-[clamp(48px,15vw,84px)] max-[1150px]:leading-none max-[1150px]:tracking-[-2px]"
          >
            Arcadeum
            <span className="hero-title-sub mr-[0.05em] block text-right text-[0.35em] font-black uppercase leading-none tracking-[0.12em] text-[#ccfbf1] [-webkit-text-fill-color:#ccfbf1] text-shadow-hero3dSub animate-sub-hue-shift [will-change:filter]">
              Games
            </span>
          </h1>

          <div>
            <p className="hero-tagline-main m-0 text-[32px] font-bold leading-[1.2] text-color opacity-90 max-[1150px]:text-[24px]">
              {tagline}
            </p>
          </div>

          <div>
            <p className="m-0 max-w-[500px] text-[18px] text-color opacity-75">
              {description}
            </p>
          </div>

          <div>
            <div className="mt-2 flex flex-wrap justify-start gap-4">
              <LinkButton href={routes.games} variant="victory" size="lg">
                {primaryLabel}
              </LinkButton>
              <HeroPlayVsAiButton label={playWithBotsLabel} />
              <LinkButton
                href={appConfig.supportCta.href}
                variant="secondary"
                size="lg"
                icon={<SupportIcon size={18} />}
              >
                {supportLabel}
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Server-rendered hero cards — images are in the initial HTML for LCP.
            HeroCardStack adds pointer interactivity after hydration. */}
        <div
          data-testid="hero-visual"
          className="relative z-[1] my-4 flex h-[400px] w-full max-w-[600px] items-center justify-center px-6 min-[1151px]:my-0 min-[1151px]:h-[540px]"
        >
          <HeroCardStack playLabel={playLabel}>
            {HERO_CARDS.map((card, index) => {
              const x = (index - 1) * FAN_OFFSET;
              const rotate = `${(index - 1) * 12}deg`;
              const gameName =
                (gamesCopy as Record<string, Record<string, string>>)?.[card.id]
                  ?.name ?? card.id;

              return (
                <Link
                  key={card.id}
                  href={`${routes.gameCreate}?variant=${card.id}`}
                  className="hero-card-main absolute isolate h-[380px] min-h-[48px] min-w-[48px] w-[280px] cursor-pointer touch-manipulation overflow-hidden rounded-3xl border border-white/[0.06] bg-[rgba(20,22,26,0.92)] text-inherit shadow-card no-underline [transform:var(--card-transform)]"
                  style={
                    {
                      '--card-x': `${x}px`,
                      '--card-y': '0px',
                      '--card-rotate': rotate,
                      '--card-scale': index === 1 ? 1.04 : 1,
                      transition: HERO_CARD_TRANSITION,
                    } as React.CSSProperties
                  }
                  data-testid={`hero-card-${index}`}
                >
                  <Image
                    src={card.bgImage}
                    alt={`${gameName} game card preview`}
                    fill
                    quality={55}
                    sizes="(max-width: 1150px) 240px, 280px"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjM4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjMzIzNTNkIiB3aWR0aD0iMjgwIiBoZWlnaHQ9IjM4MCIvPjwvc3ZnPg=="
                    className="hero-card-image absolute inset-0 z-0 h-full w-full select-none object-cover object-center [-webkit-user-drag:none]"
                  />
                  <div className="absolute left-0 right-0 top-0 z-[1] h-[45%] bg-scrim-top pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 z-[1] h-[50%] bg-scrim-bottom pointer-events-none" />
                  <div className="absolute left-6 right-6 top-[22px] z-[2] text-[20px] font-semibold tracking-[-0.005em] text-white text-shadow-card-text">
                    {gameName}
                  </div>
                  <div className="absolute inset-x-0 bottom-[22px] z-[2] text-center text-[12px] font-bold uppercase tracking-[0.18em] text-white/[0.78] text-shadow-card-text">
                    CRITICAL
                  </div>
                  <span
                    className="hero-card-play-cta absolute left-1/2 top-1/2 z-[4] -translate-x-1/2 -translate-y-1/2 scale-[0.92] whitespace-nowrap rounded-full bg-white/[0.92] px-7 py-3 text-[14px] font-bold uppercase tracking-[0.04em] text-[#0b0d10] opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_22px_rgba(0,0,0,0.45)] pointer-events-none"
                    style={{
                      transition: 'opacity 0.22s ease, transform 0.22s ease',
                    }}
                    data-testid={`hero-play-cta-${index}`}
                  >
                    {playLabel}
                  </span>
                  <span
                    aria-hidden
                    className="hero-card-shimmer absolute inset-0 z-[3] -translate-x-full bg-card-shimmer transition-transform ease-in-out duration-[1.6s] pointer-events-none"
                  />
                </Link>
              );
            })}
          </HeroCardStack>
        </div>
      </div>
    </section>
  );
}
