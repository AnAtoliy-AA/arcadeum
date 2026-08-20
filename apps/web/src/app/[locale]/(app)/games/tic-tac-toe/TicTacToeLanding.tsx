import type { TicTacToeMessages } from '@/shared/i18n/messages/games/tic-tac-toe';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { TicTacToeBoardVisual } from './TicTacToeBoardVisual';

type TttMessages = TicTacToeMessages['tic_tac_toe_v1'];
type Landing = TttMessages['landing'];
type Variants = TttMessages['variants'];
type Rules = TttMessages['rules'];

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

export default function TicTacToeLanding({
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
    { key: 'sizes', icon: '🎯', ...landing.highlights.sizes },
    { key: 'themes', icon: '🎨', ...landing.highlights.themes },
    {
      key: 'gomoku',
      icon: '⚡',
      title: 'Extended Grids',
      body: 'Scale beyond 3×3 up to 9×9 boards with Gomoku-style 5-in-a-row winning lines.',
    },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: 'Select your preferred grid dimension from 3×3 up to 9×9.',
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
      tip: 'Invite friends or test your wits against instant AI bots.',
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
      tip: 'Block enemy alignments while crafting overlapping winning threats.',
    },
  ];

  const rulesList = rules
    ? [
        { key: 'steps', head: 'Turns & Placement', body: rules.steps },
        { key: 'winLengths', head: 'Win Conditions', body: rules.winLengths },
      ]
    : [];

  const strategyTips = [
    {
      key: 'center',
      title: 'Claim the Center First',
      body: 'Taking the central square in 3×3 gives you access to 4 possible winning lines.',
    },
    {
      key: 'fork',
      title: 'Create Double Threats (Forks)',
      body: 'Position marks to threaten two separate 3-in-a-row lines simultaneously.',
    },
    {
      key: 'corners',
      title: 'Corner Tactics',
      body: 'Opening with corner moves pressures your opponent to respond precisely or lose.',
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
      accentGlow="purple"
      comingSoon={comingSoon}
      breadcrumbs={[
        { label: navTranslations?.homeTab ?? 'Home', href: homeHref },
        { label: navTranslations?.gamesTab ?? 'Games', href: gamesHref },
        { label: landing.hero.title ?? 'Tic-Tac-Toe' },
      ]}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: 'Fast Quickplay',
        subtitle: landing.hero.subtitle,
        intro:
          'The world’s most recognized grid duel enhanced with custom sizes (3×3 to 9×9) and visual themes.',
        category: 'Casual / Board',
        playersBadge: '2–5 Players',
        durationBadge: '2–5 min',
        difficultyBadge: 'Quick Fun',
        chips: [
          '3x3 to 9x9 Grids',
          'Gomoku Mode',
          'Multiplayer Rooms',
          'Smart AI',
        ],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: <TicTacToeBoardVisual />,
      }}
      highlights={{
        title: 'Simple Yet Infinitely Fun',
        kicker: 'Key Features',
        items: highlights,
      }}
      howToPlay={{
        title: 'How to Play Tic-Tac-Toe',
        kicker: 'Quick Start',
        intro: 'Take turns placing Xs and Os to achieve consecutive lines.',
        steps,
      }}
      themes={
        themesList.length > 0
          ? {
              title: landing.themes.title,
              kicker: 'Custom Visuals',
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
              title: rules?.title ?? 'Rules & Win Conditions',
              kicker: 'Rulebook',
              rules: rulesList,
            }
          : undefined
      }
      strategy={{
        title: 'Unbeatable Tactics & Strategies',
        kicker: 'Pro Tips',
        intro: 'Learn how to never lose a game of Tic-Tac-Toe.',
        tips: strategyTips,
      }}
      faq={{
        title: 'Frequently Asked Questions',
        kicker: 'FAQ',
        items: faqItems,
      }}
      relatedGames={{
        title: 'Discover More Games',
        kicker: 'Discover',
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      finalCta={{
        gameId,
        title: 'Start a Match in Seconds',
        subtitle:
          'Play against bots or challenge friends across desktop and mobile devices.',
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
