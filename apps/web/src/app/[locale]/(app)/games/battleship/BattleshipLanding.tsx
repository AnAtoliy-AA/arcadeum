import type { SeaBattleGamesMessages } from '@/shared/i18n/messages/games/sea-battle';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import type { Locale } from '@/shared/i18n';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import { BattleshipLandingBoard } from './BattleshipLandingBoard';

interface LandingData {
  meta?: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    keywords?: string;
  };
  hero: {
    title: string;
    tagline: string;
    intro: string;
    ctaPlay: string;
    ctaRooms: string;
    ctaQuickplay: string;
    ctaQuickplayError: string;
    ctaPlayHuman: string;
    ctaGroupLabel: string;
    eyebrow: string;
    chips: string[];
  };
  finalCta?: { title?: string; subtitle?: string };
  sections: {
    highlightsKicker: string;
    howToKicker: string;
    themesKicker: string;
    themesTitle: string;
    themesLead: string;
    rulesKicker: string;
    strategyKicker: string;
    aboutKicker: string;
    faqKicker: string;
  };
  strategy: {
    title: string;
    intro: string;
    tips: Record<string, { title: string; body: string }>;
  };
  about?: {
    title: string;
    paragraphs: string[];
  };
  board: { label: string; cycleHint: string; cycleAriaLabel: string };
  highlights: {
    title: string;
    players: { title: string; body: string };
    teams: { title: string; body: string };
    themes: { title: string; body: string };
    free: { title: string; body: string };
  };
  howToPlay: {
    title: string;
    steps: {
      create: { title: string; body: string };
      place: { title: string; body: string };
      fire: { title: string; body: string };
      win: { title: string; body: string };
    };
  };
  faq: {
    title: string;
    items: Record<string, { question: string; answer: string }>;
  };
  breadcrumb: { home: string; games: string; seaBattle: string };
  extra: SeaBattleGamesMessages['sea_battle_v1']['landing']['extra'];
}

interface RulesData {
  title: string;
  headers: {
    objective: string;
    gameplay: string;
    placement: string;
    battle: string;
    ships: string;
  };
  objective: string;
  gameplay: string;
  placement: string;
  battle: string;
  ships: string;
}

interface Props {
  landing?: LandingData;
  rulesT?: RulesData;
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

export default function BattleshipLanding({
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
  const bs = x.battleship;

  const highlightCards = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'teams', icon: '⚔️', ...landing.highlights.teams },
    { key: 'themes', icon: '🎨', ...landing.highlights.themes },
    { key: 'free', icon: '⚡', ...landing.highlights.free },
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

  return (
    <UnifiedGameLanding
      accentGlow="cyan"
      comingSoon={comingSoon}
      breadcrumbs={[
        { label: landing.breadcrumb.home, href: homeHref },
        { label: landing.breadcrumb.games, href: gamesHref },
        { label: bs.title },
      ]}
      hero={{
        gameId: 'sea_battle_v1',
        title: bs.title,
        eyebrow: landing.hero.eyebrow,
        subtitle: landing.hero.tagline,
        intro: landing.hero.intro,
        category: x.category,
        playersBadge: bs.badges.players,
        durationBadge: bs.badges.duration,
        difficultyBadge: bs.badges.difficulty,
        chips: landing.hero.chips,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.ctaRooms,
        roomsHref,
        createRoomHref,
        heroVisual: (
          <BattleshipLandingBoard
            label={landing.board.label}
            cycleHint={landing.board.cycleHint}
            cycleAriaLabel={landing.board.cycleAriaLabel}
          />
        ),
      }}
      highlights={{
        title: bs.highlightsTitle,
        kicker: landing.sections.highlightsKicker,
        items: highlightCards,
      }}
      howToPlay={{
        title: bs.howToTitle,
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
        title: bs.strategyTitle,
        kicker: landing.sections.strategyKicker,
        intro: landing.strategy.intro,
        tips: strategyTips,
      }}
      faq={{
        title: bs.faqTitle,
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
        title: bs.finalTitle,
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
