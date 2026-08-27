import type { BackgammonMessages } from '@/shared/i18n/messages/games/backgammon';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { BackgammonLandingPreview } from './BackgammonLandingPreview';

type BgMessages = BackgammonMessages['backgammon_v1'];
type Landing = BgMessages['landing'];
type Variants = BgMessages['variants'];
type Rules = BgMessages['rules'];

interface Props {
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

export default function BackgammonLanding({
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
}: Props) {
  if (!landing) return null;

  const highlights = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'dice', icon: '🎲', ...landing.highlights.dice },
    { key: 'bearOff', icon: '🏆', ...landing.highlights.bearOff },
    {
      key: 'tactics',
      icon: '⚡',
      title: 'Bar & Blot Hits',
      body: 'Hit vulnerable single checkers to the bar and block key anchors.',
    },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: 'Configure themes, turn timers, and invite options.',
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
      tip: 'Play directly against friends or train with AI bots.',
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
      tip: 'Roll dice, advance your checkers, and bear them off before your opponent.',
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: 'Objective', body: rules.objective },
        { key: 'movement', head: 'Movement & Dice', body: rules.movement },
        { key: 'hitting', head: 'Hitting & Bar', body: rules.hitting },
        { key: 'bearingOff', head: 'Bearing Off', body: rules.bearingOff },
      ]
    : [];

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
      accentGlow="purple"
      breadcrumbs={[
        { label: navTranslations?.homeTab ?? 'Home', href: homeHref },
        { label: navTranslations?.gamesTab ?? 'Games', href: gamesHref },
        { label: landing.hero.title ?? 'Backgammon' },
      ]}
      comingSoon={comingSoon}
      faq={{
        title: 'Frequently Asked Questions',
        kicker: 'FAQ',
        items: faqItems,
      }}
      finalCta={{
        gameId,
        title: 'Roll and Race to Victory',
        subtitle:
          'Challenge intelligent bots or play against friends in real-time matches.',
        roomsHref,
        gamesHref,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        backToGamesLabel: 'All Games',
      }}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: 'Classic 24-Point Board Game',
        subtitle: landing.hero.subtitle,
        intro:
          'A game of skill and strategy with checker moves, dice rolling, and bearing off.',
        category: 'Board Game',
        playersBadge: '2 Players',
        durationBadge: '15–25 min',
        difficultyBadge: 'Strategy',
        chips: ['Dice Rolls', 'Blot Hits', 'Bearing Off', 'AI Bots'],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: <BackgammonLandingPreview />,
      }}
      highlights={{
        title: 'Ancient Heritage, Modern Experience',
        kicker: 'Key Features',
        items: highlights,
      }}
      howToPlay={{
        title: 'How to Play Backgammon',
        kicker: 'Quick Start',
        intro: 'Master the fundamentals of moving, hitting, and bearing off.',
        steps,
      }}
      relatedGames={{
        title: 'More Board Games',
        kicker: 'Discover',
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      rules={
        rulesList.length > 0
          ? {
              title: rules?.title ?? 'Official Backgammon Rules',
              kicker: 'Rulebook',
              rules: rulesList,
            }
          : undefined
      }
      themes={
        themesList.length > 0
          ? {
              title: landing.themes.title,
              kicker: 'Visual Customization',
              subtitle: landing.themes.subtitle,
              themes: themesList,
              baseHref: createRoomHref,
              createRoomLabel: 'Play Theme',
            }
          : undefined
      }
    />
  );
}
