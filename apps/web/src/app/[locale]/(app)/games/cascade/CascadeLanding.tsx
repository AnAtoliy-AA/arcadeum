import type { CascadeMessages } from '@/shared/i18n/messages/games/cascade';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { CascadeCardsVisual } from './CascadeCardsVisual';

type CscMessages = CascadeMessages['cascade_v1'];
type Landing = CscMessages['landing'];
type Variants = CscMessages['variants'];
type Rules = CscMessages['rules'];

interface Props {
  landing?: Landing;
  variants?: Variants;
  rules?: Rules;
  gameId: string;
  createRoomHref: string;
  roomsHref: string;
  gamesHref: string;
  homeHref: string;
  homeLabel: string;
  gamesLabel: string;
  backToGamesLabel: string;
  locale: Locale;
  translatedGames?: Record<
    string,
    { name?: string; description?: string } | undefined
  >;
  comingSoon?: boolean;
}

export default function CascadeLanding({
  landing,
  variants: _variants,
  rules,
  gameId,
  createRoomHref,
  roomsHref,
  gamesHref,
  homeHref,
  homeLabel,
  gamesLabel,
  backToGamesLabel,
  locale,
  comingSoon = false,
  translatedGames,
}: Props) {
  if (!landing) return null;

  const highlights = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'themes', icon: '🎨', ...landing.highlights.themes },
    { key: 'stacking', icon: '⚡', ...landing.highlights.stacking },
    {
      key: 'combos',
      icon: '🔥',
      title: 'Action Card Chains',
      body: 'Counter attack cards with matching penalties to pass the draw burden to opponents.',
    },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: 'Configure starting hand sizes and penalty stacking rules.',
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
      tip: 'Supports up to 10 simultaneous players in a single room.',
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
      tip: 'Match by color or number and save wild cards for tactical escapes.',
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: 'Objective', body: rules.objective },
        { key: 'steps', head: 'How Stacking Works', body: rules.steps },
        { key: 'stacking', head: 'Penalty Defense', body: rules.stacking },
      ]
    : [];

  const strategyTips = [
    {
      key: 'saveWilds',
      title: 'Save Wilds for Emergencies',
      body: 'Hold wild cards until you are forced into an unfavorable color to regain tempo.',
    },
    {
      key: 'colorTracking',
      title: 'Track Opponent Color Preferences',
      body: 'Pay attention to what colors other players pass on and shift the active color away from them.',
    },
    {
      key: 'stackDefend',
      title: 'Keep +2 and +4 Counters',
      body: 'Never play your last draw-card unnecessarily if you suspect a draw chain is coming.',
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
      accentGlow="blue"
      comingSoon={comingSoon}
      breadcrumbs={[
        { label: homeLabel, href: homeHref },
        { label: gamesLabel, href: gamesHref },
        { label: landing.hero.title ?? 'Cascade' },
      ]}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: 'Fast Party Cards',
        subtitle: landing.hero.subtitle,
        intro:
          'The fast-paced card shedding showdown with ruthless stacking penalties, color changes, and 4 themes.',
        category: 'Card Game',
        playersBadge: '2–10 Players',
        durationBadge: '5–15 min',
        difficultyBadge: 'Casual Party',
        chips: [
          'Stacking Penalties',
          '4 Theme Decks',
          'Up to 10 Players',
          'Instant Quickplay',
        ],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: <CascadeCardsVisual />,
      }}
      highlights={{
        title: 'Action-Packed Card Shedding',
        kicker: 'Key Features',
        items: highlights,
      }}
      howToPlay={{
        title: 'How to Play Cascade',
        kicker: 'Quick Start',
        intro:
          'Match cards by number, color, or symbol and be the first to empty your hand.',
        steps,
      }}
      themes={
        themesList.length > 0
          ? {
              title: landing.themes.title,
              kicker: 'Deck Themes',
              subtitle: landing.themes.subtitle,
              themes: themesList,
              baseHref: createRoomHref,
              createRoomLabel: 'Play Deck',
            }
          : undefined
      }
      rules={
        rulesList.length > 0
          ? {
              title: rules?.title ?? 'Rules & Mechanics',
              kicker: 'Rulebook',
              rules: rulesList,
            }
          : undefined
      }
      strategy={{
        title: 'Winning Strategies & Combos',
        kicker: 'Pro Tips',
        intro:
          'Learn how to counter draw chains and control the flow of the game.',
        tips: strategyTips,
      }}
      faq={{
        title: 'Frequently Asked Questions',
        kicker: 'FAQ',
        items: faqItems,
      }}
      relatedGames={{
        title: 'More Multiplayer Card Games',
        kicker: 'Discover',
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      finalCta={{
        gameId,
        title: 'Jump Into the Next Round',
        subtitle:
          'Play against intelligent AI bots or host a high-stakes party game for up to 10 friends.',
        roomsHref,
        gamesHref,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        backToGamesLabel,
      }}
    />
  );
}
