import type { SeaBattleGamesMessages } from '@/shared/i18n/messages/games/sea-battle';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import type { Locale } from '@/shared/i18n';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import { SeaBattleLandingBoard } from './SeaBattleLandingBoard';
import { SeaBattleBlitzBanner } from '@/features/tournaments/ui/SeaBattleBlitzBanner';

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

  const x = landing.extra;

  const highlightCards = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'teams', icon: '⚔️', ...landing.highlights.teams },
    { key: 'themes', icon: '🎨', ...landing.highlights.themes },
    { key: 'free', icon: '⚡', ...landing.highlights.free },
    { key: 'salvo', icon: '💣', ...x.highlights.salvo },
    { key: 'speed', icon: '⏱️', ...x.highlights.speed },
    { key: 'abilities', icon: '🔱', ...x.highlights.abilities },
    { key: 'keyboard', icon: '⌨️', ...x.highlights.keyboard },
    { key: 'sonar', icon: '📡', ...x.highlights.sonar },
    { key: 'ai', icon: '🤖', ...x.highlights.ai },
    { key: 'grids', icon: '📐', ...x.highlights.grids },
    { key: 'multiplayer', icon: '🌐', ...x.highlights.multiplayer },
  ];

  const howToSteps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.howToPlay.steps.create,
      tip: x.tips.create,
    },
    {
      key: 'place',
      stepNumber: 2,
      ...landing.howToPlay.steps.place,
      tip: x.tips.place,
    },
    {
      key: 'fire',
      stepNumber: 3,
      ...landing.howToPlay.steps.fire,
      tip: x.tips.fire,
    },
    {
      key: 'win',
      stepNumber: 4,
      ...landing.howToPlay.steps.win,
      tip: x.tips.win,
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

  const sp = x.specs;
  const specifications = {
    title: sp.title,
    kicker: sp.kicker,
    items: [
      {
        label: sp.players.label,
        value: sp.players.value,
        icon: '👥',
        hint: sp.players.hint,
      },
      { label: sp.duration.label, value: sp.duration.value, icon: '⏱️' },
      {
        label: sp.modes.label,
        value: sp.modes.value,
        icon: '🎮',
        badge: sp.modes.badge,
      },
      { label: sp.grids.label, value: '10×10, 15×15, 20×20', icon: '📐' },
      { label: sp.fleet.label, value: sp.fleet.value, icon: '🚢' },
      {
        label: sp.ai.label,
        value: sp.ai.value,
        icon: '🤖',
        badge: sp.ai.badge,
      },
      { label: sp.weapons.label, value: sp.weapons.value, icon: '📡' },
      {
        label: sp.abilities.label,
        value: sp.abilities.value,
        icon: '🔱',
        badge: sp.abilities.badge,
      },
      { label: sp.team.label, value: sp.team.value, icon: '⚔️' },
      { label: sp.themes.label, value: sp.themes.value, icon: '🎨' },
      {
        label: sp.cost.label,
        value: sp.cost.value,
        icon: '💰',
        badge: sp.cost.badge,
      },
      { label: sp.platform.label, value: sp.platform.value, icon: '🌐' },
    ],
  };

  const cmp = x.comparison;
  const cv = cmp.values;
  const comparison = {
    title: cmp.title,
    kicker: cmp.kicker,
    subtitle: cmp.subtitle,
    columns: [
      { key: 'feature', name: cmp.feature },
      {
        key: 'arcadeum',
        name: 'Arcadeum',
        isHighlighted: true,
        badge: cmp.usBadge,
      },
      { key: 'seaBattle2', name: 'Sea Battle 2' },
      { key: 'fleetBattle', name: 'Fleet Battle' },
      { key: 'battleTabs', name: 'BattleTabs' },
    ],
    rows: [
      {
        feature: cmp.rows.modes,
        values: {
          arcadeum: cv.modes,
          seaBattle2: '2',
          fleetBattle: '3',
          battleTabs: '3',
        },
      },
      {
        feature: cmp.rows.maxPlayers,
        values: {
          arcadeum: cv.maxPlayers,
          seaBattle2: '2',
          fleetBattle: '2',
          battleTabs: '2',
        },
      },
      {
        feature: cmp.rows.abilities,
        values: {
          arcadeum: cv.abilities,
          seaBattle2: '-',
          fleetBattle: '-',
          battleTabs: '40+',
        },
      },
      {
        feature: cmp.rows.boards,
        values: {
          arcadeum: '10/15/20',
          seaBattle2: '10',
          fleetBattle: '10',
          battleTabs: '10',
        },
      },
      {
        feature: cmp.rows.ai,
        values: {
          arcadeum: cv.ai,
          seaBattle2: '1',
          fleetBattle: '3',
          battleTabs: '2',
        },
      },
      {
        feature: cmp.rows.weapons,
        values: {
          arcadeum: cv.weapons,
          seaBattle2: '-',
          fleetBattle: '-',
          battleTabs: cv.abilitiesShort,
        },
      },
      {
        feature: cmp.rows.keyboard,
        values: {
          arcadeum: true,
          seaBattle2: false,
          fleetBattle: false,
          battleTabs: false,
        },
      },
      {
        feature: cmp.rows.sounds,
        values: {
          arcadeum: cv.sounds,
          seaBattle2: cv.basic,
          fleetBattle: cv.full,
          battleTabs: cv.full,
        },
      },
      {
        feature: cmp.rows.cost,
        values: {
          arcadeum: cv.free,
          seaBattle2: cv.freeIap,
          fleetBattle: cv.freeIap,
          battleTabs: cv.freeCosmetic,
        },
      },
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
        category: x.category,
        playersBadge: x.badges.players,
        durationBadge: x.badges.duration,
        difficultyBadge: x.badges.difficulty,
        chips: landing.hero.chips,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.ctaRooms,
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
      topSection={<SeaBattleBlitzBanner />}
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
        createRoomLabel: x.themesCta,
      }}
      rules={
        rules.length > 0
          ? {
              title: rulesT?.title ?? x.rulesFallbackTitle,
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
        title: x.related.title,
        kicker: x.related.kicker,
        currentGameSlug: 'sea_battle_v1',
        games: relatedGames,
      }}
      finalCta={{
        gameId: 'sea_battle_v1',
        title: landing.finalCta?.title ?? landing.hero.title,
        subtitle: landing.finalCta?.subtitle ?? landing.hero.tagline,
        roomsHref,
        gamesHref,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.ctaRooms,
        backToGamesLabel: landing.breadcrumb.games,
      }}
    />
  );
}
