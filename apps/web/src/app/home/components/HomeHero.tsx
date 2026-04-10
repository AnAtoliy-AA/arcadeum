'use client';
import { useLanguage, formatMessage } from '@/shared/i18n/context';
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
import { SectionContainer } from './styles/Common.styles';
import { LinkButton, SupportIcon } from '@/shared/ui';
import React from 'react';
import { CARD_VARIANTS } from '@/features/games/ui/create/constants';
import { YStack, XStack, Text, useTheme } from 'tamagui';

type ThemeColor = '$red10' | '$blue10' | '$purple10';
const THEME_COLORS: ThemeColor[] = ['$red10', '$blue10', '$purple10'];
const HERO_CARDS = [...CARD_VARIANTS].slice(0, 3).map((v, i) => ({
  name: v.name,
  icon: v.emoji,
  colorToken: THEME_COLORS[i % THEME_COLORS.length],
}));

export function HomeHero() {
  const { messages } = useLanguage();
  const { snapshot, hydrated } = useSessionTokens();
  const theme = useTheme();
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
            'linear-gradient(to bottom, transparent 0%, var(--background) 100%), radial-gradient(circle at 50% 50%, rgba(90,196,255,0.12) 0%, transparent 50%)',
        }}
      />

      <SectionContainer
        flexDirection="column"
        $gtMd={{ flexDirection: 'row', justifyContent: 'space-between' }}
        alignItems="center"
        paddingVertical={0}
      >
        <HeroContent>
          <Kicker
            style={{
              background: `linear-gradient(90deg, ${theme.primaryGradientStart?.get() ?? 'rgba(87,195,255,0.22)'}38, ${theme.primaryGradientStart?.get() ?? 'rgba(87,195,255,0.08)'}14, ${theme.primaryGradientStart?.get() ?? 'rgba(87,195,255,0.22)'}38)`,
              backgroundSize: '200% auto',
              animation:
                'fadeInUp 0.6s ease-out 0.15s both, shimmer 3s linear infinite',
            }}
          >
            ✦ {kicker}
          </Kicker>
          <HeroTitle
            id="hero-heading"
            style={{
              fontSize: 'clamp(3.5rem, 8vw, 6rem)',
              background: `linear-gradient(135deg, ${theme.color?.get() ?? '#ffffff'} 0%, ${theme.primaryGradientStart?.get() ?? '#57c3ff'} 50%, ${theme.primaryGradientEnd?.get() ?? '#8f9bff'} 100%)`,
              backgroundSize: '200% auto',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation:
                'fadeInUp 0.6s ease-out 0.1s both, shimmer 8s linear infinite',
            }}
          >
            {appName}
          </HeroTitle>
          <Tagline style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}>
            {tagline}
          </Tagline>
          <HeroDescription
            style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
          >
            {description}
          </HeroDescription>
          <HeroActions
            style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
          >
            <LinkButton href={primaryHref} variant="primary" size="lg">
              {primaryLabel}
            </LinkButton>
            <LinkButton
              href={`${routes.gameCreate}?mode=bot`}
              variant="secondary"
              size="lg"
            >
              {playWithBotsLabel}
            </LinkButton>
            <LinkButton
              href={supportCta.href}
              variant="ghost"
              size="md"
              gap="$2"
              style={{
                animation: 'fadeInUp 0.6s ease-out 0.5s both',
              }}
            >
              <SupportIcon size={18} />
              {supportLabel}
            </LinkButton>
          </HeroActions>
        </HeroContent>

        <HeroVisual>
          <CardStack className="hero-card-stack">
            {cards.map((card, index) => {
              const isLast = index === cards.length - 1;

              // spread them out slightly more for better visibility of the "not covered" parts
              const x = (index - 1) * 65;
              const rotate = `${(index - 1) * 12}deg`;

              const y = index * -15;
              const zIndexVal = index;
              const scale = isLast ? 1 : 0.95;
              const opacity = isLast ? 1 : 0.8;

              return (
                <HeroCard
                  key={index}
                  className="hero-card"
                  rotate={rotate}
                  x={x}
                  y={y}
                  zIndex={zIndexVal}
                  scale={scale}
                  opacity={opacity}
                  hoverStyle={{ scale: 1.05, filter: 'blur(0px)', rotate }}
                >
                  <YStack
                    position="absolute"
                    inset={0}
                    zIndex={0}
                    pointerEvents="none"
                    opacity={0.4}
                    backgroundColor={card.colorToken}
                  />
                  <XStack
                    position="relative"
                    zIndex={1}
                    justifyContent="space-between"
                  >
                    <Text color="white" fontWeight="bold">
                      {t(card.name as TranslationKey) || card.name}
                    </Text>
                    <Text>{card.icon}</Text>
                  </XStack>
                  <YStack
                    position="relative"
                    zIndex={1}
                    alignItems="center"
                    justifyContent="center"
                    flex={1}
                  >
                    <Text fontSize={120} lineHeight={120}>
                      {card.icon}
                    </Text>
                  </YStack>
                  <XStack
                    position="relative"
                    zIndex={1}
                    justifyContent="center"
                  >
                    <Text
                      color="white"
                      opacity={0.5}
                      fontWeight="bold"
                      letterSpacing={2}
                    >
                      {heroCardBrand}
                    </Text>
                  </XStack>
                </HeroCard>
              );
            })}
          </CardStack>
        </HeroVisual>
      </SectionContainer>
    </HeroSection>
  );
}
