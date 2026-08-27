import type { GoMessages } from '@/shared/i18n/messages/games/go';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { GoLandingPreview } from './GoLandingPreview';

type GoMsgs = GoMessages['go_v1'];
type Landing = GoMsgs['landing'];
type Rules = GoMsgs['rules'];

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

export default function GoLanding({
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

  const s = landing.sections;

  const highlights = [
    { key: 'players', icon: '👥', ...landing.highlights.players },
    { key: 'boards', icon: '🔲', ...landing.highlights.boards },
    { key: 'captures', icon: '⚫', ...landing.highlights.captures },
    { key: 'botAI', icon: '🤖', ...landing.highlights.botAI },
  ];

  const steps = [
    {
      key: 'create',
      stepNumber: 1,
      ...landing.steps.create,
    },
    {
      key: 'join',
      stepNumber: 2,
      ...landing.steps.join,
    },
    {
      key: 'play',
      stepNumber: 3,
      ...landing.steps.play,
    },
  ];

  const rulesList = rules
    ? [
        { key: 'objective', head: rules.objectiveTitle, body: rules.objective },
        { key: 'capture', head: rules.captureTitle, body: rules.capture },
        { key: 'ko', head: rules.koTitle, body: rules.ko },
        { key: 'pass', head: rules.passTitle, body: rules.pass },
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
      accentGlow="purple"
      breadcrumbs={[
        { label: navTranslations?.homeTab ?? 'Home', href: homeHref },
        { label: navTranslations?.gamesTab ?? 'Games', href: gamesHref },
        { label: landing.hero.title ?? 'Go' },
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
        chips: [s.chipTerritory, s.chipKoRule, s.chipAreaScoring, s.chipAiBots],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: landing.hero.createRoom ?? 'Create Room',
        roomsHref,
        createRoomHref,
        heroVisual: <GoLandingPreview />,
      }}
      highlights={{
        title: s.highlightsTitle,
        kicker: s.highlightsKicker,
        items: highlights,
      }}
      howToPlay={{
        title: s.howToPlayTitle,
        kicker: s.howToPlayKicker,
        intro: s.howToPlayIntro,
        steps,
      }}
      relatedGames={{
        title: s.relatedTitle,
        kicker: s.relatedKicker,
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      rules={
        rulesList.length > 0
          ? {
              title: s.rulesTitle,
              kicker: s.rulesKicker,
              rules: rulesList,
            }
          : undefined
      }
      themes={
        themesList.length > 0
          ? {
              title: landing.themes.title,
              kicker: s.themesKicker,
              subtitle: landing.themes.subtitle,
              themes: themesList,
            }
          : undefined
      }
    />
  );
}
