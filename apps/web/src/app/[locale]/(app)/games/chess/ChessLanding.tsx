import type { ChessMessages } from '@/shared/i18n/messages/games/chess';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { ChessPuzzleHub } from './ChessPuzzleHub';
import { ChessHeroLaunchpad } from './ChessHeroLaunchpad';

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
  puzzleHrefs?: {
    daily: string;
    rated: string;
    rush: string;
    coordinates: string;
  };
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
  puzzleHrefs,
}: Props) {
  if (!landing) return null;

  const highlights = [
    {
      key: 'engine',
      icon: '🧠',
      title: 'Stockfish 19 Engine',
      body: 'Live analysis powered by Stockfish 19 - the strongest open-source chess engine with SFNNv16 neural network architecture.',
    },
    {
      key: 'matchmaking',
      icon: '⚡',
      title: 'Quick Play Matchmaking',
      body: 'Auto-matchmaking with ±100 rating range that expands over time. Find an opponent instantly.',
    },
    {
      key: 'puzzles',
      icon: '🧩',
      title: 'Puzzle Rush & Tactics',
      body: 'Survival and timed puzzle modes, daily puzzles, themed tactical sets, and rating-tracked puzzle solving.',
    },
    {
      key: 'analysis',
      icon: '📊',
      title: 'Game Review & Analysis',
      body: 'Post-game accuracy scores, A–F grades, move classification, evaluation graphs, and key moment detection.',
    },
    { key: 'variants', icon: '🎲', ...landing.highlights.variants },
    {
      key: 'tablebases',
      icon: '📚',
      title: 'Endgame Tablebases',
      body: 'Syzygy tablebase lookup for positions with 7 or fewer pieces: perfect endgame play.',
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

  const themeMessages = translatedGames?.themes as
    | Record<string, { name?: string; description?: string } | undefined>
    | undefined;
  const themesList = getTranslatedSharedThemes(themeMessages);

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
      quickNavItems={[
        { id: 'play', label: '⚔️ Play', href: '#play' },
        {
          id: 'puzzles',
          label: '🧩 Chess Puzzles',
          badge: 'DAILY',
          href: '#puzzles',
        },
        { id: 'themes', label: '🎨 Themes', href: '#themes' },
        { id: 'how-to-play', label: '📖 Rules', href: '#how-to-play' },
      ]}
      topSection={
        puzzleHrefs ? (
          <ChessPuzzleHub
            dailyPuzzleHref={puzzleHrefs.daily}
            ratedPuzzlesHref={puzzleHrefs.rated}
            puzzleRushHref={puzzleHrefs.rush}
            coordinatesHref={puzzleHrefs.coordinates}
          />
        ) : null
      }
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: 'Classic Strategy',
        subtitle: landing.hero.subtitle,
        directAnswer:
          'Arcadeum Chess is a free, web-based multiplayer chess platform featuring Stockfish 19 NNUE engine analysis, 20 AI bot personalities, Chess960, live matchmaking, and puzzle tactics, playable instantly with zero downloads or account creation required.',
        category: 'Board Game',
        playersBadge: '2 Players',
        durationBadge: '10-30 min',
        difficultyBadge: 'Tactical',
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: (
          <ChessHeroLaunchpad
            gameId={gameId}
            roomsHref={roomsHref}
            createRoomHref={createRoomHref}
            dailyPuzzleHref={puzzleHrefs?.daily}
            ratedPuzzlesHref={puzzleHrefs?.rated}
            puzzleRushHref={puzzleHrefs?.rush}
          />
        ),
      }}
      specifications={{
        title: 'Arcadeum Chess Technical Specifications',
        kicker: 'Key Facts & Engine',
        items: [
          {
            label: 'Engine',
            value: 'Stockfish 19 NNUE',
            badge: 'SFNNv16',
            hint: '3500+ Elo rated strength',
          },
          {
            label: 'Variants',
            value: 'Standard & Chess960',
            badge: 'Fischer Random',
            hint: 'Full castling & 960 start positions',
          },
          {
            label: 'Time Controls',
            value: '1+0 to 14-day Daily',
            hint: 'Bullet, Blitz, Rapid, Classical',
          },
          {
            label: 'AI Bots',
            value: '20 Personalities',
            badge: '250–3200 Elo',
            hint: 'From beginner to grandmaster',
          },
          {
            label: 'Endgame Tablebases',
            value: 'Syzygy 7-Piece',
            hint: '100% theoretical endgame accuracy',
          },
          {
            label: 'Cost & Access',
            value: '100% Free · Zero Ads',
            badge: 'No Signup',
            hint: 'Instant room sharing & guest play',
          },
        ],
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
          'Powered by Stockfish 19. Play against 20 AI personalities, solve puzzles, analyze games, and compete in tournaments. 100% free.',
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
