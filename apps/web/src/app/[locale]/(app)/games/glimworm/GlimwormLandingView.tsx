import type { GlimwormGamesMessages } from '@/shared/i18n/messages/games/glimworm';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { SHARED_THEMES } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { GlimwormVisual } from './GlimwormVisual';

type GlimwormMessages = GlimwormGamesMessages['glimworm_v1'];
type Landing = GlimwormMessages['landing'];

interface Props {
  landing?: Landing;
  gameId: string;
  roomsHref: string;
  createRoomHref?: string;
  homeHref: string;
  gamesHref: string;
  locale: Locale;
  translatedGames?: Record<
    string,
    { name?: string; description?: string } | undefined
  >;
  comingSoon?: boolean;
}

export function GlimwormLandingView({
  landing,
  gameId,
  roomsHref,
  createRoomHref,
  homeHref,
  gamesHref,
  locale,
  comingSoon = false,
  translatedGames,
}: Props) {
  if (!landing) return null;

  const highlights = [
    {
      key: 'realtime',
      icon: '⚡',
      title: 'Real-Time Multiplayer Arena',
      body: 'Compete in high-frequency 60 FPS snake duels with up to 10 players simultaneously.',
    },
    {
      key: 'glow',
      icon: '✨',
      title: 'Glow Trails & Light Orbs',
      body: 'Consume glowing matter to extend your length and leave behind lethal neon trails.',
    },
    {
      key: 'boost',
      icon: '🚀',
      title: 'Tactical Speed Boost',
      body: 'Sacrifice trail mass to accelerate past opponents and cut off their escape paths.',
    },
    {
      key: 'crossplay',
      icon: '📱',
      title: 'Instant Cross-Platform',
      body: 'Zero installation required. Responsive controls on desktop keyboard and mobile touch.',
    },
  ];

  const howToSteps = [
    {
      key: 'setup',
      stepNumber: 1,
      ...landing.howToPlay.steps.setup,
      tip: 'Adjust sensitivity in settings to suit your device.',
    },
    {
      key: 'slither',
      stepNumber: 2,
      ...landing.howToPlay.steps.slither,
      tip: 'Collect floating light orbs to grow longer and score higher.',
    },
    {
      key: 'evade',
      stepNumber: 3,
      ...landing.howToPlay.steps.evade,
      tip: 'Do not collide with walls or the glowing bodies of rival worms.',
    },
    {
      key: 'survive',
      stepNumber: 4,
      ...landing.howToPlay.steps.survive,
      tip: 'Trap competitors in tight spirals to force a collision.',
    },
  ];

  const rulesList = [
    {
      key: 'objective',
      head: 'Survival & Growth',
      body: 'Survive in the dark arena by feeding on ambient light energy while eliminating rivals.',
    },
    {
      key: 'collisions',
      head: 'Lethal Collisions',
      body: 'Colliding head-first into another worm’s body or the arena boundary causes instant defeat.',
    },
    {
      key: 'absorption',
      head: 'Energy Absorption',
      body: 'Defeated worms burst into concentrated light particles that can be consumed by anyone.',
    },
  ];

  const strategyTips = [
    {
      key: 'coiling',
      title: 'The Coil Trap',
      body: 'Once you achieve sufficient length, encircle smaller opponents gradually until they have nowhere to turn.',
    },
    {
      key: 'boostCut',
      title: 'Intercept with Speed Boost',
      body: 'Sprint ahead of parallel worms and sharply turn across their trajectory to force a head-on collision.',
    },
    {
      key: 'perimeter',
      title: 'Perimeter Farming',
      body: 'Stay near the edges early on to collect energy safely before venturing into the chaotic center.',
    },
  ];

  const faqItems = Object.entries(landing.faq.items).map(([key, item]) => ({
    key,
    question: item.question,
    answer: item.answer,
  }));

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
      accentGlow="emerald"
      comingSoon={comingSoon}
      breadcrumbs={[
        { label: landing.breadcrumb.home, href: homeHref },
        { label: landing.breadcrumb.games, href: gamesHref },
        { label: landing.breadcrumb.glimworm },
      ]}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: landing.hero.eyebrow,
        subtitle: landing.hero.tagline,
        intro: landing.hero.intro,
        category: 'Action Arena',
        playersBadge: '2–10 Players',
        durationBadge: '3–8 min',
        difficultyBadge: 'Fast Action',
        chips: landing.hero.chips,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.ctaRooms,
        createRoomLabel: 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: <GlimwormVisual />,
      }}
      highlights={{
        title: 'High-Stakes Glow Arena Action',
        kicker: 'Key Features',
        items: highlights,
      }}
      howToPlay={{
        title: landing.howToPlay.title,
        kicker: landing.sections.howToKicker,
        steps: howToSteps,
      }}
      themes={{
        title: 'Glow Arena Visual Themes',
        kicker: 'Custom Visuals',
        subtitle: 'Customize the arena backdrop and aesthetic vibes.',
        themes: themesList,
        baseHref: createRoomHref,
        createRoomLabel: 'Play Theme',
      }}
      rules={{
        title: 'Arena Mechanics & Physics',
        kicker: landing.sections.aboutKicker,
        rules: rulesList,
      }}
      strategy={{
        title: 'Mastering the Arena',
        kicker: 'Pro Tips',
        intro: 'Tactical maneuvers to out-maneuver and trap opponents.',
        tips: strategyTips,
      }}
      faq={{
        title: landing.faq.title,
        kicker: landing.sections.faqKicker,
        items: faqItems,
      }}
      relatedGames={{
        title: 'Discover More Fast-Paced Action',
        kicker: 'Discover',
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      finalCta={{
        gameId,
        title: landing.finalCta.title,
        subtitle: landing.finalCta.subtitle,
        roomsHref,
        gamesHref,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.ctaRooms,
        backToGamesLabel: landing.breadcrumb.games,
      }}
    />
  );
}
