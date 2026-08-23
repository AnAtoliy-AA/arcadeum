import type { PachisiMessages } from '@/shared/i18n/messages/games/pachisi';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { PachisiLandingPreview } from './PachisiLandingPreview';

type PachisiMsg = PachisiMessages['pachisi_v1'];
type Landing = PachisiMsg['landing'];
type Rules = PachisiMsg['rules'];

interface Props {
  landing?: Landing;
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

export default function PachisiLanding({
  landing,
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
    { key: 'capture', icon: '⚔️', ...landing.highlights.capture },
    {
      key: 'safe',
      icon: '⭐',
      title: 'Safe Star Cells',
      body: 'Star cells shield you — plan routes through protected ground.',
    },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: 'Configure themes, game modes, and invite options.',
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
      tip: 'Roll a six to launch, capture rivals mid-race, and reach home first.',
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: 'Objective', body: rules.objective },
        { key: 'movement', head: 'Rolling & Moving', body: rules.movement },
        { key: 'capture', head: 'Captures & Safe Cells', body: rules.capture },
        { key: 'sixes', head: 'Sixes', body: rules.sixes },
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
      accentGlow="amber"
      breadcrumbs={[
        { label: navTranslations?.homeTab ?? 'Home', href: homeHref },
        { label: navTranslations?.gamesTab ?? 'Games', href: gamesHref },
        { label: landing.hero.title ?? 'Pachisi' },
      ]}
      comingSoon={comingSoon}
      faq={{
        title: 'Frequently Asked Questions',
        kicker: 'FAQ',
        items: faqItems,
      }}
      finalCta={{
        gameId,
        title: 'Roll a Six and Race Home',
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
        eyebrow: 'Classic Cross-and-Circle Race',
        subtitle: landing.hero.subtitle,
        intro:
          'The timeless chase game of dice rolls, captures, and home stretches — easy to learn, endlessly replayable.',
        category: 'Board Game',
        playersBadge: '2–4 Players',
        durationBadge: '10–20 min',
        difficultyBadge: 'Casual',
        chips: ['Dice Rolls', 'Captures', 'Safe Stars', 'AI Bots'],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: <PachisiLandingPreview />,
      }}
      highlights={{
        title: 'Ancient Game, Modern Boards',
        kicker: 'Key Features',
        items: highlights,
      }}
      howToPlay={{
        title: 'How to Play Pachisi',
        kicker: 'Quick Start',
        intro:
          'Master the fundamentals of launching, racing, capturing, and finishing.',
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
              title: rules?.title ?? 'Official Pachisi Rules',
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
