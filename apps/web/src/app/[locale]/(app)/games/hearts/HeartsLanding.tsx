import type { HeartsMessages } from '@/shared/i18n/messages/games/hearts';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';

type HMessages = HeartsMessages['hearts_v1'];
type Landing = HMessages['landing'];
type Rules = HMessages['rules'];

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

export default function HeartsLanding({
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
    { key: 'passing', icon: '🃏', ...landing.highlights.passing },
    { key: 'shooting', icon: '🌙', ...landing.highlights.shooting },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: 'Choose your visual theme and configure options.',
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
      tip: 'Play with friends or fill seats with AI bots.',
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
      tip: 'Pass cards, follow suit, avoid Hearts and the Queen of Spades!',
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: 'Objective', body: rules.objective },
        { key: 'setup', head: 'Setup', body: rules.setup },
        { key: 'passing', head: 'Card Passing', body: rules.passing },
        { key: 'gameplay', head: 'Gameplay', body: rules.gameplay },
        { key: 'scoring', head: 'Scoring', body: rules.scoring },
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
      accentGlow="rose"
      breadcrumbs={[
        { label: navTranslations?.homeTab ?? 'Home', href: homeHref },
        { label: navTranslations?.gamesTab ?? 'Games', href: gamesHref },
        { label: landing.hero.title ?? 'Hearts' },
      ]}
      comingSoon={comingSoon}
      faq={{
        title: 'Frequently Asked Questions',
        kicker: 'FAQ',
        items: faqItems,
      }}
      finalCta={{
        gameId,
        title: 'Pass, Play & Shoot the Moon',
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
        eyebrow: 'Classic 4-Player Trick-Taking',
        subtitle: landing.hero.subtitle,
        intro:
          'A strategic card game of passing, following suit, and avoiding penalty points.',
        category: 'Card Game',
        playersBadge: '4 Players',
        durationBadge: '20–30 min',
        difficultyBadge: 'Strategy',
        chips: ['Trick-Taking', 'Card Passing', 'Shoot the Moon', 'AI Bots'],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: landing.hero.createRoom,
        roomsHref,
        createRoomHref,
      }}
      highlights={{
        title: 'Why Play Hearts?',
        kicker: 'Highlights',
        items: highlights,
      }}
      relatedGames={{
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      rules={{
        title: 'How to Play',
        kicker: 'Rules',
        rules: rulesList,
      }}
      howToPlay={{
        title: 'Getting Started',
        kicker: 'Quick Start',
        steps: steps.map((s) => ({
          key: s.key,
          stepNumber: s.stepNumber,
          title: s.title,
          body: s.body,
          tip: s.tip,
        })),
      }}
      themes={{
        title: 'Visual Themes',
        kicker: 'Themes',
        subtitle: 'Play on beautiful cyber, retro, and fantasy tables.',
        themes: themesList,
      }}
    />
  );
}
