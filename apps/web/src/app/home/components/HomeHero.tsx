'use client';
import { useLanguage, formatMessage } from '@/app/i18n/LanguageProvider';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import {
  HeroSection,
  HeroBackground,
  HeroContent,
  Kicker,
  HeroTitle,
  Tagline,
  HeroDescription,
  HeroActions,
  HeroVisual,
  CardStack,
  HeroCard,
} from './styles/Hero.styles';
import { LinkButton } from '@/shared/ui';
import { CARD_VARIANTS } from '@/app/games/create/constants';
import { YStack } from 'tamagui';

// Define fixed cards for the hero visual to ensure consistency and avoid hydration/purity issues
const HERO_CARDS = [...CARD_VARIANTS].slice(0, 3).map((v) => ({
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
    `Create real-time game rooms, invite your friends, or play with bots instantly without registration. Let ${appName} handle rules, scoring, and turns so you can focus on the fun.`;
  const primaryLabel = homeCopy.primaryCtaLabel ?? 'Get started';
  const playWithBotsLabel = homeCopy.playWithBotsLabel ?? 'Play with Bots';
  const heroCardBrand = homeCopy.heroCardBrand ?? 'CRITICAL';
  const supportLabel = homeCopy.supportCtaLabel ?? 'Support the developers';

  const isAuthenticated = hydrated && !!snapshot.accessToken;
  const primaryHref = isAuthenticated ? routes.games : primaryCta.href;

  const { t } = useTranslation();
  const cards = HERO_CARDS;

  return (
    <HeroSection aria-labelledby="hero-heading" data-testid="hero-section">
      <HeroBackground
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, var(--background) 100%), radial-gradient(circle at 50% 50%, rgba(90,196,255,0.06) 0%, transparent 50%)',
        }}
      />

      <HeroContent>
        <Kicker
          style={{
            // Use hardcoded dark theme values — tamagui tokens don't resolve in CSS string style props
            background: 'linear-gradient(90deg, #7ad7ff, #57c3ff, #7ad7ff)',
            backgroundSize: '200% auto',
            animation: 'fadeInUp 0.6s ease-out 0.15s both, shimmer 3s linear infinite',
          }}
        >
          {kicker}
        </Kicker>
        <HeroTitle
          id="hero-heading"
          style={{
            fontSize: 'clamp(3.5rem, 8vw, 6rem)',
            background: 'linear-gradient(135deg, #ffffff 0%, #57c3ff 50%, #8f9bff 100%)',
            backgroundSize: '200% auto',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'fadeInUp 0.6s ease-out 0.1s both, shimmer 8s linear infinite',
          }}
        >
          {appName}
        </HeroTitle>
        <Tagline style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
          {tagline}
        </Tagline>
        <HeroDescription style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
          {description}
        </HeroDescription>
        <HeroActions style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}>
          <LinkButton href={primaryHref} variant="primary" size="lg">
            {primaryLabel}
          </LinkButton>
          <LinkButton href={`${routes.gameCreate}?mode=bot`} variant="secondary" size="lg">
            {playWithBotsLabel}
          </LinkButton>
          <LinkButton href={supportCta.href} variant="secondary" size="lg">
            {supportLabel}
          </LinkButton>
        </HeroActions>
      </HeroContent>

      <HeroVisual>
        <CardStack style={{ animation: 'float 6s ease-in-out infinite' }}>
          {cards.map((card, index) => (
            <HeroCard
              key={index}
              style={{
                transform: `rotate(${index * 10 - 10}deg) translate(${index * 20 - 20}px, ${index * -10}px)`,
                zIndex: index,
                boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)`,
              }}
            >
              {/* Colour overlay replaces ::before */}
              <YStack
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                zIndex={0}
                pointerEvents="none"
                style={{
                  background: `linear-gradient(135deg, ${card.color}15, transparent)`,
                }}
              />
              <div className="card-top" style={{ position: 'relative', zIndex: 1 }}>
                <span>{t(card.name as TranslationKey) || card.name}</span>
                <span>{card.icon}</span>
              </div>
              <div className="card-center" style={{ position: 'relative', zIndex: 1 }}>
                {card.icon}
              </div>
              <div className="card-bottom" style={{ position: 'relative', zIndex: 1 }}>
                <span>{heroCardBrand}</span>
              </div>
            </HeroCard>
          ))}
        </CardStack>
      </HeroVisual>
    </HeroSection>
  );
}
