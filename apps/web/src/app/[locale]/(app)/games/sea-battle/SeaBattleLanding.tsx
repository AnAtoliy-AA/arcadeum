import type { SeaBattleGamesMessages } from '@/shared/i18n/messages/games/sea-battle';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import type { Locale } from '@/shared/i18n';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import { SeaBattleLandingBoard } from './SeaBattleLandingBoard';

type SeaBattleMessages = SeaBattleGamesMessages['sea_battle_v1'];
type Landing = SeaBattleMessages['landing'];
type Rules = SeaBattleMessages['rules'];

interface Props {
  landing?: Landing;
  rulesT?: Rules;
  createRoomHref: string;
  roomsHref: string;
  homeHref: string;
  gamesHref: string;
  locale: Locale;
  translatedGames?: Record<
    string,
    { name?: string; description?: string } | undefined
  >;
  comingSoon?: boolean;
}

export default function SeaBattleLanding({
  landing,
  rulesT,
  createRoomHref,
  roomsHref,
  homeHref,
  gamesHref,
  locale,
  comingSoon = false,
  translatedGames,
}: Props) {
  if (!landing) return null;

  const highlightCards = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'teams', icon: '⚔️', ...landing.highlights.teams },
    { key: 'themes', icon: '🎨', ...landing.highlights.themes },
    { key: 'free', icon: '⚡', ...landing.highlights.free },
    {
      key: 'salvo',
      icon: '💣',
      title: 'Salvo Mode',
      body: 'Fire multiple shots per turn — one for each surviving ship. The classic competitive variation that rewards precision targeting.',
    },
    {
      key: 'speed',
      icon: '⏱️',
      title: 'Speed Mode',
      body: '30-second turn timer keeps the pressure on. Think fast, shoot faster — no time for second-guessing.',
    },
    {
      key: 'abilities',
      icon: '🔱',
      title: 'Ship Abilities',
      body: 'Each ship class has a unique power: Scout reveals areas, Barrage fires extra shots, Torpedo guarantees a hit, and more.',
    },
    {
      key: 'keyboard',
      icon: '⌨️',
      title: 'Keyboard Controls',
      body: 'Navigate the grid with arrow keys or WASD, fire with Enter. Full keyboard support for fast, precise play.',
    },
    {
      key: 'sonar',
      icon: '📡',
      title: 'Sonar & Radar',
      body: 'Special weapons reveal hidden ships. Sonar scans a 3×3 area, Radar sweeps entire rows or columns.',
    },
    {
      key: 'ai',
      icon: '🤖',
      title: '4-Level AI Opponents',
      body: 'From beginner-friendly Easy to devastating Expert — AI uses probabilistic density maps and hunt-mode targeting.',
    },
    {
      key: 'grids',
      icon: '📐',
      title: 'Flexible Board Sizes',
      body: 'Play on 10×10, 15×15, or 20×20 grids with configurable ship counts. Customize every match to your preference.',
    },
    {
      key: 'multiplayer',
      icon: '🌐',
      title: 'Up to 8 Players',
      body: 'Free-for-all up to 6 players, or team battles with up to 8 across 2–4 teams. Real-time multiplayer with chat.',
    },
  ];

  const howToSteps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.howToPlay.steps.create,
      tip: 'Pick your board size and enable spectator slots if you want friends to watch.',
    },
    {
      key: 'place',
      stepNumber: 2,
      ...landing.howToPlay.steps.place,
      tip: 'Spread out ships to prevent clustered hits by enemy salvoes.',
    },
    {
      key: 'fire',
      stepNumber: 3,
      ...landing.howToPlay.steps.fire,
      tip: 'Use parity search (checkerboard targeting) to find larger ships efficiently.',
    },
    {
      key: 'win',
      stepNumber: 4,
      ...landing.howToPlay.steps.win,
      tip: 'Sinking an enemy ship grants a confirmation announcement.',
    },
  ];

  const faqItems = Object.entries(landing.faq.items).map(([key, item]) => ({
    key,
    question: item.question,
    answer: item.answer,
  }));

  const strategyTips = Object.entries(landing.strategy.tips).map(
    ([key, tip]) => ({ key, title: tip.title, body: tip.body }),
  );

  const rules = rulesT
    ? [
        {
          key: 'objective',
          head: rulesT.headers.objective,
          body: rulesT.objective,
        },
        {
          key: 'gameplay',
          head: rulesT.headers.gameplay,
          body: rulesT.gameplay,
        },
        {
          key: 'placement',
          head: rulesT.headers.placement,
          body: rulesT.placement,
        },
        { key: 'battle', head: rulesT.headers.battle, body: rulesT.battle },
        { key: 'ships', head: rulesT.headers.ships, body: rulesT.ships },
      ]
    : [];

  const themeMessages = translatedGames?.themes as
    | Record<string, { name?: string; description?: string } | undefined>
    | undefined;
  const themesList = getTranslatedSharedThemes(themeMessages);

  const relatedGames = getRelatedGames(
    locale,
    'sea_battle_v1',
    translatedGames,
  );

  const specifications = {
    title: 'Game Specifications',
    kicker: 'Details',
    items: [
      { label: 'Players', value: '2–8', icon: '👥', hint: 'FFA up to 6, teams up to 8' },
      { label: 'Duration', value: '15–25 min', icon: '⏱️' },
      { label: 'Game Modes', value: 'Classic, Salvo, Speed', icon: '🎮', badge: '3 modes' },
      { label: 'Grid Sizes', value: '10×10, 15×15, 20×20', icon: '📐' },
      { label: 'Ship Fleet', value: '7 classes, 26 ships', icon: '🚢' },
      { label: 'AI Difficulty', value: 'Easy, Medium, Hard, Expert', icon: '🤖', badge: '4 levels' },
      { label: 'Special Weapons', value: 'Sonar, Radar, Scan Wave', icon: '📡' },
      { label: 'Ship Abilities', value: '6 unique powers with cooldowns', icon: '🔱', badge: 'NEW' },
      { label: 'Team Mode', value: '2–4 teams, up to 8 players', icon: '⚔️' },
      { label: 'Themes', value: '13 visual themes', icon: '🎨' },
      { label: 'Cost', value: 'Free to Play', icon: '💰', badge: 'No ads' },
      { label: 'Cross-Platform', value: 'Web + Mobile', icon: '🌐' },
    ],
  };

  const comparison = {
    title: 'Why Arcadeum Sea Battle?',
    kicker: 'Comparison',
    subtitle: 'See how Arcadeum stacks up against other naval combat games',
    columns: [
      { key: 'feature', name: 'Feature' },
      { key: 'arcadeum', name: 'Arcadeum', isHighlighted: true, badge: 'US' },
      { key: 'seaBattle2', name: 'Sea Battle 2' },
      { key: 'fleetBattle', name: 'Fleet Battle' },
      { key: 'battleTabs', name: 'BattleTabs' },
    ],
    rows: [
      { feature: 'Game Modes', values: { arcadeum: '3 (Classic, Salvo, Speed)', seaBattle2: '2', fleetBattle: '3', battleTabs: '3' } },
      { feature: 'Max Players', values: { arcadeum: '8 (Team Mode)', seaBattle2: '2', fleetBattle: '2', battleTabs: '2' } },
      { feature: 'Ship Abilities', values: { arcadeum: '6 unique powers', seaBattle2: '—', fleetBattle: '—', battleTabs: '40+' } },
      { feature: 'Board Sizes', values: { arcadeum: '10/15/20', seaBattle2: '10', fleetBattle: '10', battleTabs: '10' } },
      { feature: 'AI Difficulty', values: { arcadeum: '4 levels', seaBattle2: '1', fleetBattle: '3', battleTabs: '2' } },
      { feature: 'Special Weapons', values: { arcadeum: 'Sonar + Radar', seaBattle2: '—', fleetBattle: '—', battleTabs: 'Abilities' } },
      { feature: 'Keyboard Controls', values: { arcadeum: true, seaBattle2: false, fleetBattle: false, battleTabs: false } },
      { feature: 'Sound Effects', values: { arcadeum: '8 sounds', seaBattle2: 'Basic', fleetBattle: 'Full', battleTabs: 'Full' } },
      { feature: 'Cost', values: { arcadeum: 'Free', seaBattle2: 'Free + IAP', fleetBattle: 'Free + IAP', battleTabs: 'Free (cosmetic)' } },
    ],
  };

  return (
    <UnifiedGameLanding
      accentGlow="cyan"
      comingSoon={comingSoon}
      breadcrumbs={[
        { label: landing.breadcrumb.home, href: homeHref },
        { label: landing.breadcrumb.games, href: gamesHref },
        { label: landing.breadcrumb.seaBattle },
      ]}
      hero={{
        gameId: 'sea_battle_v1',
        title: landing.hero.title,
        eyebrow: landing.hero.eyebrow,
        subtitle: landing.hero.tagline,
        intro: landing.hero.intro,
        category: 'Strategy',
        playersBadge: '2–8 Players',
        durationBadge: '15–25 min',
        difficultyBadge: 'Naval Combat',
        chips: landing.hero.chips,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        ctaPlayHumanLabel: landing.hero.ctaPlayHuman,
        browseRoomsLabel: landing.hero.ctaRooms,
        createRoomLabel: landing.hero.ctaPlay,
        roomsHref,
        createRoomHref,
        heroVisual: (
          <SeaBattleLandingBoard
            label={landing.board.label}
            cycleHint={landing.board.cycleHint}
            cycleAriaLabel={landing.board.cycleAriaLabel}
          />
        ),
      }}
      specifications={specifications}
      comparison={comparison}
      highlights={{
        title: landing.highlights.title,
        kicker: landing.sections.highlightsKicker,
        items: highlightCards,
      }}
      howToPlay={{
        title: landing.howToPlay.title,
        kicker: landing.sections.howToKicker,
        steps: howToSteps,
      }}
      themes={{
        title: landing.sections.themesTitle,
        kicker: landing.sections.themesKicker,
        subtitle: landing.sections.themesLead,
        themes: themesList,
        baseHref: createRoomHref,
        createRoomLabel: 'Deploy with Theme',
      }}
      rules={
        rules.length > 0
          ? {
              title: rulesT?.title ?? 'Naval Combat Rules',
              kicker: landing.sections.rulesKicker,
              rules,
            }
          : undefined
      }
      strategy={{
        title: landing.strategy.title,
        kicker: landing.sections.strategyKicker,
        intro: landing.strategy.intro,
        tips: strategyTips,
      }}
      faq={{
        title: landing.faq.title,
        kicker: landing.sections.faqKicker,
        items: faqItems,
      }}
      relatedGames={{
        title: 'More Tactical Battles',
        kicker: 'Discover',
        currentGameSlug: 'sea_battle_v1',
        games: relatedGames,
      }}
      finalCta={{
        gameId: 'sea_battle_v1',
        title: landing.finalCta?.title ?? landing.hero.title,
        subtitle: landing.finalCta?.subtitle ?? landing.hero.tagline,
        roomsHref,
        gamesHref,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        ctaPlayHumanLabel: landing.hero.ctaPlayHuman,
        browseRoomsLabel: landing.hero.ctaRooms,
        backToGamesLabel: landing.breadcrumb.games,
      }}
    />
  );
}
