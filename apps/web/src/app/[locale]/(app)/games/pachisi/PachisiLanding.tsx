import type { PachisiMessages } from '@/shared/i18n/messages/games/pachisi';
import {
  UnifiedGameLanding,
  getRelatedGames,
} from '@/features/games/ui/landing';
import { getTranslatedSharedThemes } from '@/features/games/lib/shared-themes';
import type { Locale } from '@/shared/i18n';
import { PachisiLandingPreview } from './PachisiLandingPreview';

type PachisiMsg = PachisiMessages['pachisi_v1'];
type Landing = PachisiMsg['landing'];
type Rules = PachisiMsg['rules'];

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

export default function PachisiLanding({
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
    { key: 'dice', icon: '🎲', ...landing.highlights.dice },
    { key: 'capture', icon: '⚔️', ...landing.highlights.capture },
    { key: 'safe', icon: '⭐', ...landing.highlights.safe },
  ];

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
        { key: 'movement', head: rules.movementTitle, body: rules.movement },
        { key: 'capture', head: rules.captureTitle, body: rules.capture },
        { key: 'sixes', head: rules.sixesTitle, body: rules.sixes },
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
      accentGlow="amber"
      breadcrumbs={[
        { label: navTranslations?.homeTab ?? 'Home', href: homeHref },
        { label: navTranslations?.gamesTab ?? 'Games', href: gamesHref },
        { label: landing.hero.title ?? 'Pachisi' },
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
        chips: [s.chipDiceRolls, s.chipCaptures, s.chipSafeStars, s.chipAiBots],
        ctaQuickplayLabel: landing.hero.ctaQuickplay,
        ctaQuickplayErrorLabel: landing.hero.ctaQuickplayError,
        browseRoomsLabel: landing.hero.browseRooms,
        createRoomLabel: landing.hero.createRoom,
        roomsHref,
        createRoomHref,
        heroVisual: <PachisiLandingPreview />,
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
        currentGameSlug: gameId,
        games: relatedGames,
      }}
      rules={
        rules && rulesList.length > 0
          ? {
              title: rules.title,
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
              baseHref: createRoomHref,
              createRoomLabel: s.themesCta,
            }
          : undefined
      }
    />
  );
}
