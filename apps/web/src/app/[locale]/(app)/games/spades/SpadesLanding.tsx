import type { SpadesMessages } from '@/shared/i18n/messages/games/spades';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { SpadesLandingPreview } from './SpadesLandingPreview';

type HMessages = SpadesMessages['spades_v1'];
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

export default function SpadesLanding({
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
    { key: 'bidding', icon: '🎯', ...landing.highlights.bidding },
    { key: 'sandbagging', icon: '🎒', ...landing.highlights.sandbagging },
  ];

  const s = landing.sections;

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
      tip: s.tipCreate,
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
      tip: s.tipJoin,
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
      tip: s.tipPlay,
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: rules.objectiveTitle, body: rules.objective },
        { key: 'setup', head: rules.setupTitle, body: rules.setup },
        { key: 'bidding', head: rules.biddingTitle, body: rules.bidding },
        { key: 'gameplay', head: rules.gameplayTitle, body: rules.gameplay },
        { key: 'scoring', head: rules.scoringTitle, body: rules.scoring },
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
      accentGlow="blue"
      breadcrumbs={[
        { label: navTranslations?.homeTab ?? 'Home', href: homeHref },
        { label: navTranslations?.gamesTab ?? 'Games', href: gamesHref },
        { label: landing.hero.title ?? 'Spades' },
      ]}
      comingSoon={comingSoon}
      faq={{
        title: s.faqTitle,
        kicker: s.faqKicker,
        items: faqItems,
      }}
      finalCta={{
        gameId,
        title: s.finalCtaTitle,
        subtitle: s.finalCtaSubtitle,
        roomsHref,
        gamesHref,
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        backToGamesLabel: s.backToGames,
      }}
      hero={{
        gameId,
        title: landing.hero.title,
        eyebrow: s.heroEyebrow,
        subtitle: landing.hero.subtitle,
        intro: s.heroIntro,
        category: s.heroCategory,
        playersBadge: s.playersBadge,
        durationBadge: s.durationBadge,
        difficultyBadge: s.difficultyBadge,
        chips: [
          s.chipTrickTaking,
          s.chipPartnership,
          s.chipBidding,
          s.chipAiBots,
        ],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: landing.hero.createRoom,
        roomsHref,
        createRoomHref,
        heroVisual: <SpadesLandingPreview />,
      }}
      highlights={{
        title: s.highlightsTitle,
        kicker: s.highlightsKicker,
        items: highlights,
      }}
      relatedGames={{
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      rules={{
        title: s.rulesTitle,
        kicker: s.rulesKicker,
        rules: rulesList,
      }}
      howToPlay={{
        title: s.howToPlayTitle,
        kicker: s.howToPlayKicker,
        steps: steps.map((step) => ({
          key: step.key,
          stepNumber: step.stepNumber,
          title: step.title,
          body: step.body,
          tip: step.tip,
        })),
      }}
      themes={{
        title: landing.themes.title,
        kicker: s.themesKicker,
        subtitle: landing.themes.subtitle,
        themes: themesList,
      }}
    />
  );
}
