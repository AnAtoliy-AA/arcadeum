import type { CriticalGamesMessages } from '@/shared/i18n/messages/games/critical';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { CriticalLandingPreview } from './CriticalLandingPreview';
import { CriticalRankedHub } from '@/features/games/ui/critical/CriticalRankedHub';

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
  comingSoon?: boolean;
}

export function CriticalLandingView({
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

  const x = landing.extra;

  const highlights = [
    { key: 'tension', icon: '💣', ...x.highlights.tension },
    { key: 'defuse', icon: '🛠', ...x.highlights.defuse },
    { key: 'actionCards', icon: '⚡', ...x.highlights.actionCards },
    { key: 'party', icon: '👥', ...x.highlights.party },
  ];

  const howToSteps = [
    {
      key: 'setup',
      stepNumber: 1,
      ...landing.howToPlay.steps.setup,
      tip: x.tips.setup,
    },
    {
      key: 'draw',
      stepNumber: 2,
      ...landing.howToPlay.steps.draw,
      tip: x.tips.draw,
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.howToPlay.steps.play,
      tip: x.tips.play,
    },
    {
      key: 'survive',
      stepNumber: 4,
      ...landing.howToPlay.steps.survive,
      tip: x.tips.survive,
    },
  ];

  const rulesList = [
    { key: 'bombCard', ...x.rules.bombCard },
    { key: 'reinsert', ...x.rules.reinsert },
    { key: 'turnEnd', ...x.rules.turnEnd },
  ];

  const strategyTips = [
    { key: 'deckCounting', ...x.strategy.deckCounting },
    { key: 'seeFuture', ...x.strategy.seeFuture },
    { key: 'bombPosition', ...x.strategy.bombPosition },
  ];

  const faqItems = Object.values(landing.faq.items).map((item, idx) => ({
    key: `faq-${idx}`,
    question: item.question,
    answer: item.answer,
  }));

  const themeMessages = translatedGames?.themes as
    | Record<string, { name?: string; description?: string } | undefined>
    | undefined;
  const themesList = getTranslatedSharedThemes(themeMessages);

  const relatedGames = getRelatedGames(locale, gameId, translatedGames);

  return (
    <UnifiedGameLanding
      accentGlow="rose"
      comingSoon={comingSoon}
      breadcrumbs={[
        { label: landing.breadcrumb.home, href: homeHref },
        { label: landing.breadcrumb.games, href: gamesHref },
        { label: landing.breadcrumb.critical },
      ]}
      extraNavItems={[
        {
          id: 'ranked',
          labelKey: 'games.critical_v1.landing.ranked.navLabel',
          placement: 'afterPlay',
        },
      ]}
      topSection={<CriticalRankedHub gameId={gameId} labels={landing.ranked} />}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: landing.hero.eyebrow,
        subtitle: landing.hero.tagline,
        intro: landing.hero.intro,
        category: x.category,
        playersBadge: x.badges.players,
        durationBadge: x.badges.duration,
        difficultyBadge: x.badges.difficulty,
        chips: [...landing.hero.chips, x.rankedChip],
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.ctaRooms,
        createRoomLabel: x.createRoom,
        roomsHref,
        createRoomHref,
        heroVisual: <CriticalLandingPreview />,
      }}
      highlights={{
        title: x.highlights.title,
        kicker: x.highlights.kicker,
        items: highlights,
      }}
      howToPlay={{
        title: landing.howToPlay.title,
        kicker: landing.sections.howToKicker,
        steps: howToSteps,
      }}
      themes={{
        title: x.themes.title,
        kicker: x.themes.kicker,
        subtitle: x.themes.subtitle,
        themes: themesList,
        baseHref: createRoomHref,
        createRoomLabel: x.themes.cta,
      }}
      rules={{
        title: x.rules.title,
        kicker: landing.sections.aboutKicker,
        rules: rulesList,
      }}
      strategy={{
        title: x.strategy.title,
        kicker: x.strategy.kicker,
        intro: x.strategy.intro,
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
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      finalCta={{
        gameId,
        title: landing.finalCta.title,
        subtitle: landing.finalCta.subtitle,
        roomsHref,
        gamesHref,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.ctaRooms,
        backToGamesLabel: landing.breadcrumb.games,
      }}
    />
  );
}
