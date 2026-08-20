import type { ChessMessages } from '@/shared/i18n/messages/games/chess';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { ChessBoardVisual } from './ChessBoardVisual';

type ChessMsg = ChessMessages['chess_v1'];
type Landing = ChessMsg['landing'];
type Rules = ChessMsg['rules'];

interface Props {
  landing?: Landing;
  rules?: Rules;
  gameId: string;
  roomsHref: string;
  createRoomHref?: string;
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

export default function ChessLanding({
  landing,
  rules,
  gameId,
  roomsHref,
  createRoomHref,
  gamesHref,
  homeHref,
  locale,
  comingSoon = false,
  navTranslations,
  translatedGames,
}: Props) {
  if (!landing) return null;

  const highlights = [
    { key: 'players', icon: '♟', ...landing.highlights.players },
    { key: 'variants', icon: '🎲', ...landing.highlights.variants },
    { key: 'clock', icon: '⏱', ...landing.highlights.clock },
    {
      key: 'analysis',
      icon: '🧠',
      title: 'Real-Time Sync',
      body: 'Zero-latency WebSocket board synchronization across desktop and mobile devices.',
    },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: 'Choose between standard chess or Chess960 Fischer Random.',
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
      tip: 'Share direct invite links or invite friends instantly.',
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
      tip: 'Keep an eye on the clock and safeguard your king.',
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: 'Objective', body: rules.objective },
        { key: 'pieces', head: 'Piece Movement', body: rules.pieces },
        { key: 'special', head: 'Special Rules', body: rules.special },
      ]
    : [];

  const strategyTips = [
    {
      key: 'center',
      title: 'Control the Center',
      body: 'Occupy and influence the central d4, d5, e4, e5 squares early with pawns and knights.',
    },
    {
      key: 'develop',
      title: 'Develop Minor Pieces',
      body: 'Bring out your knights and bishops before launching aggressive queen excursions.',
    },
    {
      key: 'kingSafety',
      title: 'Prioritize King Safety',
      body: 'Castle early to tuck your king behind a solid pawn shield and activate your rooks.',
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

  const themesList = SHARED_THEMES.filter((t) => t.id !== 'random').map(
    (t) => ({
      id: t.id,
      name: t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' '),
      description: t.descriptionKey,
    }),
  );

  const relatedGames = getRelatedGames(locale, gameId, translatedGames);

  return (
    <UnifiedGameLanding
      accentGlow="amber"
      comingSoon={comingSoon}
      breadcrumbs={[
        { label: navTranslations?.homeTab ?? 'Home', href: homeHref },
        { label: navTranslations?.gamesTab ?? 'Games', href: gamesHref },
        { label: landing.hero.title ?? 'Chess' },
      ]}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: 'Classic Strategy',
        subtitle: landing.hero.subtitle,
        intro:
          'Engage in timeless tactical warfare. Compete with players worldwide or practice against AI.',
        category: 'Board Game',
        playersBadge: '2 Players',
        durationBadge: '10–30 min',
        difficultyBadge: 'Tactical',
        chips: ['Chess960', 'Live Clock', 'Smart AI', 'Cross-Platform'],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: <ChessBoardVisual />,
      }}
      highlights={{
        title: 'Built for Serious Chess Players',
        kicker: 'Key Features',
        items: highlights,
      }}
      howToPlay={{
        title: 'How to Play Chess on Arcadeum',
        kicker: 'Quick Start',
        intro:
          'Start playing in seconds without installing apps or signing up.',
        steps,
      }}
      themes={{
        title: 'Custom Chess Visuals',
        kicker: 'Customization',
        subtitle: 'Choose your board aesthetics and atmosphere.',
        themes: themesList,
        baseHref: createRoomHref,
        createRoomLabel: 'Play Theme',
      }}
      rules={
        rulesList.length > 0
          ? {
              title: rules?.title ?? 'Chess Rules & Moves',
              kicker: 'Rulebook',
              rules: rulesList,
            }
          : undefined
      }
      strategy={{
        title: 'Mastery & Tactical Strategies',
        kicker: 'Pro Tips',
        intro: 'Elevate your rating with foundational tactical habits.',
        tips: strategyTips,
      }}
      faq={{
        title: 'Frequently Asked Questions',
        kicker: 'FAQ',
        items: faqItems,
      }}
      relatedGames={{
        title: 'Explore More Games',
        kicker: 'Discover',
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      finalCta={{
        gameId,
        title: 'Master the 64 Squares',
        subtitle:
          'Jump into an instant match against smart bots or create a room for your friends.',
        roomsHref,
        gamesHref,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        backToGamesLabel: landing.hero.backToGames ?? 'All Games',
      }}
    />
  );
}
