import type { CatDashMessages } from '@/shared/i18n/messages/games/cat-dash';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { CatDashLandingPreview } from './CatDashLandingPreview';

type CdMessages = CatDashMessages['cat_dash_v1'];
type Landing = CdMessages['landing'];
type Variants = CdMessages['variants'];
type Rules = CdMessages['rules'];

interface CatDashLandingProps {
  landing?: Landing;
  variants?: Variants;
  rules?: Rules;
  gameId: string;
  createRoomHref: string;
  roomsHref: string;
  gamesHref: string;
  homeHref: string;
  locale: Locale;
  navTranslations?: {
    homeTab: string;
    gamesTab: string;
  };
  translatedGames?: Record<
    string,
    { name?: string; description?: string } | undefined
  >;
  comingSoon?: boolean;
}

export default function CatDashLanding({
  landing,
  variants: _variants,
  rules,
  gameId,
  createRoomHref,
  roomsHref,
  gamesHref,
  homeHref,
  locale,
  comingSoon = false,
  navTranslations,
  translatedGames,
}: CatDashLandingProps) {
  if (!landing) return null;

  const x = landing.extra;

  const highlights = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'cats', icon: '🐱', ...landing.highlights.cats },
    { key: 'themes', icon: '🎨', ...landing.highlights.themes },
    { key: 'obstacles', icon: '🐾', ...x.highlights.obstacles },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: x.howTo.create,
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
      tip: x.howTo.join,
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
      tip: x.howTo.play,
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: x.rules.objective, body: rules.objective },
        { key: 'howToPlay', head: x.rules.howToPlay, body: rules.howToPlay },
        { key: 'abilities', head: x.rules.abilities, body: rules.abilities },
        {
          key: 'trackSpaces',
          head: x.rules.trackSpaces,
          body: rules.trackSpaces,
        },
      ]
    : [];

  const strategyTips = [
    { key: 'boostTiming', ...x.strategy.boostTiming },
    { key: 'hazards', ...x.strategy.hazards },
    { key: 'finishSprint', ...x.strategy.finishSprint },
  ];

  const faqItems = Object.entries(landing.faq).map(([key, entry]) => {
    const e = entry as { question: string; answer: string };
    return {
      key,
      question: e.question,
      answer: e.answer,
    };
  });

  const themeMessages = translatedGames?.themes as
    | Record<string, { name?: string; description?: string } | undefined>
    | undefined;
  const themesList = getTranslatedSharedThemes(themeMessages);

  const relatedGames = getRelatedGames(locale, gameId, translatedGames);

  return (
    <UnifiedGameLanding
      accentGlow="orange"
      comingSoon={comingSoon}
      breadcrumbs={[
        { label: navTranslations?.homeTab ?? 'Home', href: homeHref },
        { label: navTranslations?.gamesTab ?? 'Games', href: gamesHref },
        { label: landing.hero.title ?? 'Cat Dash' },
      ]}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: x.hero.eyebrow,
        subtitle: landing.hero.subtitle,
        intro: x.hero.intro,
        category: x.hero.category,
        playersBadge: x.hero.playersBadge,
        durationBadge: x.hero.durationBadge,
        difficultyBadge: x.hero.difficultyBadge,
        chips: x.hero.chips,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: landing.hero.createRoom,
        roomsHref,
        createRoomHref,
        heroVisual: <CatDashLandingPreview />,
      }}
      highlights={{
        title: x.highlights.title,
        kicker: x.highlights.kicker,
        items: highlights,
      }}
      howToPlay={{
        title: x.howTo.title,
        kicker: x.howTo.kicker,
        intro: x.howTo.intro,
        steps,
      }}
      themes={
        themesList.length > 0
          ? {
              title: landing.themes.title,
              kicker: x.themesSection.kicker,
              subtitle: landing.themes.subtitle,
              themes: themesList,
              baseHref: createRoomHref,
              createRoomLabel: x.themesSection.cta,
            }
          : undefined
      }
      rules={
        rulesList.length > 0
          ? {
              title: rules?.title ?? x.rules.fallbackTitle,
              kicker: x.rules.kicker,
              rules: rulesList,
            }
          : undefined
      }
      strategy={{
        title: x.strategy.title,
        kicker: x.strategy.kicker,
        intro: x.strategy.intro,
        tips: strategyTips,
      }}
      faq={{
        title: x.faq.title,
        kicker: x.faq.kicker,
        items: faqItems,
      }}
      relatedGames={{
        title: x.related.title,
        kicker: x.related.kicker,
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      finalCta={{
        gameId,
        title: x.finalCta.title,
        subtitle: x.finalCta.subtitle,
        roomsHref,
        gamesHref,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        backToGamesLabel: x.finalCta.allGames,
      }}
    />
  );
}
