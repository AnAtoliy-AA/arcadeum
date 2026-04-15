'use client';
import { useLanguage, formatMessage } from '@/shared/i18n/context';
import { appConfig } from '@/shared/config/app-config';
import { routes } from '@/shared/config/routes';
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
import { HomePrimaryLinkButton, LinkButton, SupportIcon } from '@/shared/ui';
import { CARD_VARIANTS } from '@/features/games/ui/create/constants';
import { YStack, XStack, Text } from 'tamagui';

type ThemeColor = '$red10' | '$blue10' | '$purple10';
const THEME_COLORS: ThemeColor[] = ['$red10', '$blue10', '$purple10'];
const HERO_CARDS = [...CARD_VARIANTS].slice(0, 3).map((v, i) => ({
  name: v.name,
  icon: v.emoji,
  colorToken: THEME_COLORS[i % THEME_COLORS.length],
}));

export function HomeHero() {
  const { messages } = useLanguage();
  const homeCopy = messages.home ?? {};

  const { appName, supportCta } = appConfig;

  const kicker = homeCopy.kicker ?? 'The future of table games';
  const tagline =
    formatMessage(homeCopy.tagline, { appName }) ??
    `${appName} is your online platform to play board games with friends.`;
  const description =
    formatMessage(homeCopy.description, { appName }) ??
    `Create real-time game rooms and invite your friends instantly without registration. Let ${appName} handle rules, scoring, and turns so you can focus on the fun.`;
  const primaryLabel = homeCopy.primaryCtaLabel ?? 'Get started';
  const heroCardBrand = homeCopy.heroCardBrand ?? 'CRITICAL';
  const supportLabel = homeCopy.supportCtaLabel ?? 'Support the developers';

  const primaryHref = routes.games;

  const { t } = useTranslation();
  const cards = HERO_CARDS;

  return (
    <HeroSection aria-labelledby="hero-heading" data-testid="hero-section">
      <HeroBackground />

      <SectionContainer
        flexDirection="column"
        $gtMd={{ flexDirection: 'row', justifyContent: 'space-between' }}
        alignItems="center"
        paddingVertical={0}
      >
        <HeroContent>
          <Kicker
            background="linear-gradient(90deg, $primary10, $primary5, $primary10)"
            backgroundSize="200% auto"
          >
            ✦ {kicker}
          </Kicker>
          <HeroTitle id="hero-heading" className="hero-title-animated">
            {appName}
          </HeroTitle>
          <Tagline>{tagline}</Tagline>
          <HeroDescription>{description}</HeroDescription>
          <HeroActions>
            <HomePrimaryLinkButton href={primaryHref} ml="$10" mb="$10">
              {primaryLabel}
            </HomePrimaryLinkButton>
            <LinkButton
              href={supportCta.href}
              variant="ghost"
              size="md"
              gap="$2"
              prefetch={false}
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
                    opacity={0.6}
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
                      opacity={0.7}
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
