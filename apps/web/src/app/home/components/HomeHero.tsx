'use client';
import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  HeroSection,
  HeroBackground,
  HeroContent,
  Kicker,
  HeroTitle,
  Tagline,
  HeroDescription,
  HeroActions,
  PrimaryAction,
  SecondaryAction,
  HeroVisual,
  CardStack,
  HeroCard,
} from './styles/Hero.styles';
import { CARD_VARIANTS } from '@/app/games/create/constants';

// Define fixed cards for the hero visual to ensure consistency and avoid hydration/purity issues
const HERO_CARDS = [...CARD_VARIANTS]
  .sort(() => 0.5 - Math.random())
  .slice(0, 3)
  .map((v) => ({
    name: v.name,
    icon: v.emoji,
    // Extract the first color from the gradient string for the glow effect
    color: v.gradient.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? '#FF4D4D',
  }));

export function HomeHero() {
  const { messages } = useLanguage();
  const { snapshot, hydrated } = useSessionTokens();
  const homeCopy = messages.home ?? {};

  const { appName, primaryCta, supportCta } = appConfig;

  const kicker = homeCopy.kicker ?? 'The future of table games';
  const tagline =
    formatMessage(homeCopy.tagline, { appName }) ??
    `${appName} is your online platform to play board games with friends.`;
  const description =
    formatMessage(homeCopy.description, { appName }) ??
    `Create real-time game rooms, invite your friends, and let ${appName} handle rules, scoring, and turns so you can focus on the fun.`;
  const primaryLabel = homeCopy.primaryCtaLabel ?? 'Get started';
  const supportLabel = homeCopy.supportCtaLabel ?? 'Support the developers';

  const isAuthenticated = hydrated && !!snapshot.accessToken;
  const primaryHref = isAuthenticated ? routes.games : primaryCta.href;

  const cards = HERO_CARDS;

  return (
    <HeroSection aria-labelledby="hero-heading">
      <HeroBackground />

      <HeroContent>
        <Kicker>{kicker}</Kicker>
        <HeroTitle id="hero-heading">{appName}</HeroTitle>
        <Tagline>{tagline}</Tagline>
        <HeroDescription>{description}</HeroDescription>
        <HeroActions>
          <PrimaryAction href={primaryHref}>{primaryLabel}</PrimaryAction>
          <SecondaryAction href={supportCta.href}>
            {supportLabel}
          </SecondaryAction>
        </HeroActions>
      </HeroContent>

      <HeroVisual>
        <CardStack>
          {cards.map((card, index) => (
            <HeroCard key={index} $index={index} $color={card.color}>
              <div className="card-top">
                <span>{card.name}</span>
                <span>{card.icon}</span>
              </div>
              <div className="card-center">{card.icon}</div>
              <div className="card-bottom">
                <span>CRITICAL</span>
              </div>
            </HeroCard>
          ))}
        </CardStack>
      </HeroVisual>
    </HeroSection>
  );
}
