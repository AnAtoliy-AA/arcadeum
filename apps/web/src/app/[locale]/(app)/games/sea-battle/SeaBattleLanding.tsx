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
        playersBadge: '2–4 Players',
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
