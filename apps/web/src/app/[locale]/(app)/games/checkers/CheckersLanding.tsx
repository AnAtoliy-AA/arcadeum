import type { CheckersMessages } from '@/shared/i18n/messages/games/checkers';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { CheckersLandingPreview } from './CheckersLandingPreview';

type CkMessages = CheckersMessages['checkers_v1'];
type Landing = CkMessages['landing'];
type Variants = CkMessages['variants'];
type Rules = CkMessages['rules'];

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

export default function CheckersLanding({
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
    { key: 'captures', icon: '⚡', ...landing.highlights.captures },
    { key: 'kings', icon: '👑', ...landing.highlights.kings },
    {
      key: 'rulesets',
      icon: '📐',
      title: 'Forced Jumps',
      body: 'Standard draughts rules with mandatory jump sequences and crown promotions.',
    },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: 'Configure optional turn timers or play relaxed untimed matches.',
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
      tip: 'Share room links directly or let matchmaking match an opponent.',
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
      tip: 'Remember that jumping opponent pieces is mandatory when available.',
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: 'Objective', body: rules.objective },
        { key: 'steps', head: 'Piece Movement', body: rules.steps },
        {
          key: 'kingPromotion',
          head: 'King Promotion',
          body: rules.kingPromotion,
        },
        {
          key: 'forcedCaptures',
          head: 'Forced Captures',
          body: rules.forcedCaptures,
        },
      ]
    : [];

  const strategyTips = [
    {
      key: 'flanks',
      title: 'Guard the Side Edges',
      body: 'Pieces along the side files (a and h) cannot be captured from behind. Use them as safe anchors.',
    },
    {
      key: 'backRow',
      title: 'Protect Your Back Row',
      body: 'Keep pieces on your home row as long as possible to delay opponent king promotions.',
    },
    {
      key: 'traps',
      title: 'Sacrifice for Double Jumps',
      body: 'Giving up a single piece can frequently lure an opponent into a crushing multi-jump trap.',
    },
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
        { label: landing.hero.title ?? 'Checkers' },
      ]}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: 'Classic Draughts',
        subtitle: landing.hero.subtitle,
        intro:
          'Fast-paced board tactics of diagonal moves, forced jump combos, and king piece promotions.',
        category: 'Board Game',
        playersBadge: '2 Players',
        durationBadge: '10–20 min',
        difficultyBadge: 'Casual / Strategy',
        chips: ['King Crowns', 'Forced Captures', 'Multi-Jumps', 'AI Bots'],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: <CheckersLandingPreview />,
      }}
      highlights={{
        title: 'Classic Board Mechanics, Modern Feel',
        kicker: 'Key Features',
        items: highlights,
      }}
      howToPlay={{
        title: 'How to Play Checkers',
        kicker: 'Quick Start',
        intro: 'Simple rules to learn, deep tactical layers to master.',
        steps,
      }}
      themes={
        themesList.length > 0
          ? {
              title: landing.themes.title,
              kicker: 'Theme Customization',
              subtitle: landing.themes.subtitle,
              themes: themesList,
              baseHref: createRoomHref,
              createRoomLabel: 'Play Theme',
            }
          : undefined
      }
      rules={
        rulesList.length > 0
          ? {
              title: rules?.title ?? 'Official Checkers Rules',
              kicker: 'Rulebook',
              rules: rulesList,
            }
          : undefined
      }
      strategy={{
        title: 'Tactical Strategies & Traps',
        kicker: 'Pro Tips',
        intro: 'Control the board and set up decisive jump sequences.',
        tips: strategyTips,
      }}
      faq={{
        title: 'Frequently Asked Questions',
        kicker: 'FAQ',
        items: faqItems,
      }}
      relatedGames={{
        title: 'More Board & Strategy Games',
        kicker: 'Discover',
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      finalCta={{
        gameId,
        title: 'Jump Into the Action',
        subtitle:
          'Play against intelligent AI bots or challenge friends to a classic draughts duel.',
        roomsHref,
        gamesHref,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        backToGamesLabel: 'All Games',
      }}
    />
  );
}
