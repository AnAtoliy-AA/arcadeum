import Link from 'next/link';
import { LinkButton, SupportIcon } from '@arcadeum/ui';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getHomeTranslations } from '@/shared/i18n/server';
import type { Locale } from '@/shared/i18n';
import { HeroBackground } from './HeroBackground';
import { HeroCardStack } from './HeroCardStack';
import { HeroPlayVsAiButton } from './HeroPlayVsAiButton';
import { HeroGameCardArt } from './HeroGameCardArt';
import { HERO_GAMES, HERO_CARD_FAN_OFFSET } from '../data/heroVariants';

const FAN_OFFSET = HERO_CARD_FAN_OFFSET;

const HERO_CARD_TRANSITION =
  'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';

export default async function HomeHero({ locale }: { locale: Locale }) {
  const messages = await getHomeTranslations(locale);
  const homeCopy = messages.home ?? {};
  const gamesCopy = messages.games ?? {};
  const routes = buildRoutes(locale);

  const kicker = homeCopy.kicker ?? 'Free online board & mini-games';
  const tagline =
    homeCopy.tagline?.replace('{{appName}}', appConfig.appName) ??
    `${appConfig.appName} is the ultimate platform to play free board games, card games, and multiplayer mini-games online with friends or solo vs AI.`;
  const description =
    homeCopy.description?.replace('{{appName}}', appConfig.appName) ??
    `Enjoy a wide variety of free board games, card games, and quick mini-games online. Challenge intelligent bots, create real-time game rooms, invite your friends, and let ${appConfig.appName} handle rules, scoring, and turns so you can focus on the fun.`;
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
            className="relative m-0 block p-0 text-center text-[140px] font-black leading-[1.1] tracking-[-4px] text-color text-shadow-hero3d [perspective:1000px] [transform-style:preserve-3d] animate-hero-float-3d transition-transform duration-200 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] max-[1150px]:text-[clamp(48px,15vw,84px)] max-[1150px]:leading-none max-[1150px]:tracking-[-2px]"
          >
            Arcadeum
            <span className="hero-title-sub mr-[0.05em] block text-right text-[0.35em] font-black uppercase leading-none tracking-[0.12em] text-accent text-shadow-hero3dSub animate-sub-hue-shift [will-change:filter]">
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

        {/* Server-rendered multi-game hero cards — inlined vector art for instant LCP with 0 KB download latency */}
        <div
          data-testid="hero-visual"
          className="relative z-[1] my-4 flex h-[400px] w-full max-w-[600px] items-center justify-center px-6 min-[1151px]:my-0 min-[1151px]:h-[540px]"
        >
          <HeroCardStack playLabel={playLabel}>
            {HERO_GAMES.map((card, index) => {
              const x = (index - 1) * FAN_OFFSET;
              const rotate = `${(index - 1) * 11}deg`;
              const gameName =
                (gamesCopy as Record<string, Record<string, string>>)?.[card.id]
                  ?.name ??
                (card.id === 'chess_v1'
                  ? 'Chess'
                  : card.id === 'cascade_v1'
                    ? 'Cascade'
                    : 'Sea Battle');

              const cardTargetUrl = `/${locale}${card.landingHref}`;

              return (
                <Link
                  className="hero-card-main group absolute isolate h-[380px] min-h-[48px] min-w-[48px] w-[280px] cursor-pointer touch-manipulation overflow-hidden rounded-3xl border border-white/10 bg-[rgba(15,18,24,0.95)] text-inherit shadow-card no-underline hover:border-white/30 [transform:var(--card-transform)]"
                  style={
                    {
                      '--card-x': `${x}px`,
                      '--card-y': '0px',
                      '--card-rotate': rotate,
                      '--card-scale': index === 1 ? 1.05 : 1,
                      transition: HERO_CARD_TRANSITION,
                    } as React.CSSProperties
                  }
                  key={card.id}
                  href={cardTargetUrl}
                  prefetch={false}
                  data-testid={`hero-card-${index}`}
                >
                  {/* Embedded vector artwork */}
                  <HeroGameCardArt gameId={card.id} />

                  {/* Gradient overlays for contrast */}
                  <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1] h-[45%] bg-scrim-top" />
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-[55%] bg-scrim-bottom" />

                  {/* Top info badge */}
                  <div className="absolute left-5 right-5 top-[20px] z-[2] flex items-center justify-between">
                    <span className="text-[20px] font-extrabold tracking-[-0.01em] text-white text-shadow-card-text">
                      {gameName}
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-sm"
                      style={{
                        backgroundColor: card.accentColor + '33',
                        borderColor: card.accentColor + '66',
                        borderWidth: 1,
                        color: card.accentColor,
                      }}
                    >
                      {card.playersKey}P
                    </span>
                  </div>

                  {/* Bottom tagline badge */}
                  <div className="absolute inset-x-0 bottom-[22px] z-[2] text-center text-[12px] font-extrabold uppercase tracking-[0.2em] text-white/80 text-shadow-card-text">
                    {card.id === 'chess_v1'
                      ? 'STRATEGY · CLASSIC'
                      : card.id === 'cascade_v1'
                        ? 'CARD · MULTIPLAYER'
                        : 'NAVAL · TACTICAL'}
                  </div>

                  {/* Hover Play CTA */}
                  <span
                    className="hero-card-play-cta pointer-events-none absolute left-1/2 top-1/2 z-[4] -translate-x-1/2 -translate-y-1/2 scale-[0.92] whitespace-nowrap rounded-full bg-white/[0.94] px-7 py-3 text-[14px] font-bold uppercase tracking-[0.05em] text-[#0b0d10] opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_25px_rgba(0,0,0,0.6)]"
                    style={{
                      transition: 'opacity 0.22s ease, transform 0.22s ease',
                    }}
                    data-testid={`hero-play-cta-${index}`}
                  >
                    {playLabel}
                  </span>

                  {/* Shimmer effect on hover */}
                  <span
                    aria-hidden
                    className="hero-card-shimmer pointer-events-none absolute inset-0 z-[3] -translate-x-full bg-card-shimmer transition-transform duration-[1.6s] ease-in-out"
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
