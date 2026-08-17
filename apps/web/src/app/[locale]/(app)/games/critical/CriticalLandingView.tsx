import type { CriticalGamesMessages } from '@/shared/i18n/messages/games/critical';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import type { Locale } from '@/shared/i18n';
import { CriticalCardsVisual } from './CriticalCardsVisual';

type CriticalMessages = CriticalGamesMessages['critical_v1'];
type Landing = CriticalMessages['landing'];

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
}

export function CriticalLandingView({
  landing,
  gameId,
  roomsHref,
  createRoomHref,
  homeHref,
  gamesHref,
  locale,
  translatedGames,
}: Props) {
  if (!landing) return null;

  const highlights = [
    {
      key: 'tension',
      icon: '💣',
      title: 'High-Stakes Card Roulette',
      body: 'Every draw from the deck could be the fatal Critical bomb that knocks you out.',
    },
    {
      key: 'defuse',
      icon: '🛠',
      title: 'Defusal Tactics',
      body: 'Use Defuse cards to survive bomb draws and strategically re-insert the bomb anywhere into the deck.',
    },
    {
      key: 'actionCards',
      icon: '⚡',
      title: 'Aggressive Action Cards',
      body: 'Attack opponents, skip turns, steal cards, and peek at the upcoming deck order.',
    },
    {
      key: 'party',
      icon: '👥',
      title: '2–5 Player Chaos',
      body: 'Fast party matches with instant matchmaking against friends or smart AI bots.',
    },
  ];

  const howToSteps = [
    {
      key: 'setup',
      stepNumber: 1,
      ...landing.howToPlay.steps.setup,
      tip: 'Everyone starts with a secret Defuse card in hand.',
    },
    {
      key: 'draw',
      stepNumber: 2,
      ...landing.howToPlay.steps.draw,
      tip: 'Play actions to avoid drawing, but eventually someone must pull a card.',
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.howToPlay.steps.play,
      tip: 'Chain attacks together to force double draws on your opponents.',
    },
    {
      key: 'survive',
      stepNumber: 4,
      ...landing.howToPlay.steps.survive,
      tip: 'The last player remaining without exploding wins the match.',
    },
  ];

  const rulesList = [
    {
      key: 'bombCard',
      head: 'Critical Bomb Cards',
      body: 'Drawing a Bomb card eliminates you unless you immediately play a Defuse card from your hand.',
    },
    {
      key: 'reinsert',
      head: 'Secret Re-Insertion',
      body: 'When you defuse a bomb, you secretly choose which position in the draw pile to put the bomb back in.',
    },
    {
      key: 'turnEnd',
      head: 'Turn End by Drawing',
      body: 'Playing cards does not end your turn; your turn only ends after you draw a card from the deck or play a Skip card.',
    },
  ];

  const strategyTips = [
    {
      key: 'deckCounting',
      title: 'Count the Remaining Bombs',
      body: 'Track how many bombs and defuse cards have been revealed to calculate risk before drawing.',
    },
    {
      key: 'seeFuture',
      title: 'Combo See the Future with Shuffle',
      body: 'Peek at the top 3 cards; if a bomb is on top, immediately play a Shuffle or Skip card.',
    },
    {
      key: 'bombPosition',
      title: 'Strategic Bomb Placement',
      body: 'When re-inserting a defused bomb, place it right at the top if the next player has no Defuse left.',
    },
  ];

  const faqItems = Object.values(landing.faq.items).map((item, idx) => ({
    key: `faq-${idx}`,
    question: item.question,
    answer: item.answer,
  }));

  const relatedGames = getRelatedGames(locale, gameId, translatedGames);

  return (
    <UnifiedGameLanding
      accentGlow="rose"
      breadcrumbs={[
        { label: landing.breadcrumb.home, href: homeHref },
        { label: landing.breadcrumb.games, href: gamesHref },
        { label: landing.breadcrumb.critical },
      ]}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: landing.hero.eyebrow,
        subtitle: landing.hero.tagline,
        intro: landing.hero.intro,
        category: 'Card Game',
        playersBadge: '2–5 Players',
        durationBadge: '10–20 min',
        difficultyBadge: 'High Tension',
        chips: landing.hero.chips,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.ctaRooms,
        createRoomLabel: 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: <CriticalCardsVisual />,
      }}
      highlights={{
        title: 'Ruthless Card Party Mechanics',
        kicker: 'Key Features',
        items: highlights,
      }}
      howToPlay={{
        title: landing.howToPlay.title,
        kicker: landing.sections.howToKicker,
        steps: howToSteps,
      }}
      rules={{
        title: 'Core Rules & Bomb Defusal',
        kicker: landing.sections.aboutKicker,
        rules: rulesList,
      }}
      strategy={{
        title: 'Survival Strategies & Mind Games',
        kicker: 'Pro Tips',
        intro:
          'Master card counts and outwit opponents when the deck runs low.',
        tips: strategyTips,
      }}
      faq={{
        title: landing.faq.title,
        kicker: landing.sections.faqKicker,
        items: faqItems,
      }}
      relatedGames={{
        title: 'More High-Stakes Multiplayer Games',
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
