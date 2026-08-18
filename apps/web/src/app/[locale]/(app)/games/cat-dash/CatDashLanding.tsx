import type { CatDashMessages } from '@/shared/i18n/messages/games/cat-dash';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import type { Locale } from '@/shared/i18n';
import { CatDashVisual } from './CatDashVisual';

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
  variants,
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

  const highlights = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'cats', icon: '🐱', ...landing.highlights.cats },
    { key: 'themes', icon: '🎨', ...landing.highlights.themes },
    {
      key: 'obstacles',
      icon: '🐾',
      title: 'Interactive Hazards',
      body: 'Dodge yarn traps, slippery milk spills, and burst forward with tuna speed boosts.',
    },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: 'Pick your track theme and set 1 to 3 laps for the race.',
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
      tip: 'Race against friends or compete with smart bot runners.',
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
      tip: 'Roll the dice, activate power-ups, and sprint across the finish line.',
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: 'Objective', body: rules.objective },
        { key: 'howToPlay', head: 'Dice & Movement', body: rules.howToPlay },
        { key: 'abilities', head: 'Cat Abilities', body: rules.abilities },
        { key: 'trackSpaces', head: 'Track Spaces', body: rules.trackSpaces },
      ]
    : [];

  const strategyTips = [
    {
      key: 'boostTiming',
      title: 'Time Your Boosts',
      body: 'Save speed boosts for straightaways or right after recovering from a hazard trap.',
    },
    {
      key: 'hazards',
      title: 'Guide Opponents Into Traps',
      body: 'Position your cat to block safe lanes and force rival racers onto hazard tiles.',
    },
    {
      key: 'finishSprint',
      title: 'Final Lap Sprint',
      body: 'Unleash all remaining stamina and power-ups on the final stretch to clinch victory.',
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

  const themeKeys = ['neon', 'village', 'space', 'nature'] as const;
  const themesList = variants
    ? themeKeys.map((k) => ({
        id: k,
        name: variants[k]?.name ?? k,
        description: variants[k]?.description,
      }))
    : [];

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
        eyebrow: 'Fast Multiplayer Race',
        subtitle: landing.hero.subtitle,
        intro:
          'A high-energy cat racing dice game filled with speed boosts, hilarious hazards, and themed tracks.',
        category: 'Race / Casual',
        playersBadge: '2–6 Players',
        durationBadge: '5–15 min',
        difficultyBadge: 'Fun for All',
        chips: ['Dice Racing', 'Speed Boosts', '4 Track Themes', '2-6 Players'],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: landing.hero.createRoom,
        roomsHref,
        createRoomHref,
        heroVisual: <CatDashVisual />,
      }}
      highlights={{
        title: 'Why You’ll Love Cat Dash',
        kicker: 'Key Features',
        items: highlights,
      }}
      howToPlay={{
        title: 'How to Play Cat Dash',
        kicker: 'Quick Start',
        intro:
          'Roll dice, activate powers, and be the first cat across the finish line.',
        steps,
      }}
      themes={
        themesList.length > 0
          ? {
              title: landing.themes.title,
              kicker: 'Track Selection',
              subtitle: landing.themes.subtitle,
              themes: themesList,
              baseHref: createRoomHref,
              createRoomLabel: 'Race on Track',
            }
          : undefined
      }
      rules={
        rulesList.length > 0
          ? {
              title: rules?.title ?? 'Rules & Racing Mechanics',
              kicker: 'Rulebook',
              rules: rulesList,
            }
          : undefined
      }
      strategy={{
        title: 'Track Tactics & Strategies',
        kicker: 'Pro Tips',
        intro:
          'Learn how to maximize dice rolls and dominate the leaderboards.',
        tips: strategyTips,
      }}
      faq={{
        title: 'Frequently Asked Questions',
        kicker: 'FAQ',
        items: faqItems,
      }}
      relatedGames={{
        title: 'Discover More Fast Games',
        kicker: 'Discover',
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      finalCta={{
        gameId,
        title: 'Ready to Race?',
        subtitle:
          'Play against bots or challenge up to 5 friends in real-time cat racing mayhem.',
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
