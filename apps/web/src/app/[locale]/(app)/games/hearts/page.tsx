import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildVideoGameJsonLd } from '@/shared/seo/videoGameJsonLd';
import { buildFaqJsonLd } from '@/shared/seo/faqJsonLd';
import HeartsLanding from './HeartsLanding';
import { isGameComingSoon } from '@/features/games/api.server';

const HEARTS_SLUG = 'hearts_v1';
const HEARTS_MIN_PLAYERS = 4;
const HEARTS_MAX_PLAYERS = 4;
const HEARTS_GENRE = 'Card Game';

type PageProps = {
  params: Promise<{ locale: string }>;
};

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const base = await buildPageMetadata({ locale, page: 'heartsLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/hearts/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Hearts — free multiplayer on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/hearts/opengraph-image`],
    },
  };
}

export default async function HeartsLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.hearts_v1?.landing;
  const rules = messages.games?.hearts_v1?.rules;
  const gameName = messages.games?.hearts_v1?.name ?? 'Hearts';
  const description =
    messages.games?.hearts_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: HEARTS_SLUG,
      gameName,
      description: description ?? '',
      locale,
      minPlayers: HEARTS_MIN_PLAYERS,
      maxPlayers: HEARTS_MAX_PLAYERS,
      genre: HEARTS_GENRE,
      alternateName: ['Hearts Card Game', 'Hearts Online'],
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
  ];

  const pageUrl = `${appConfig.siteUrl}${routes.heartsLanding ?? `/${locale}/games/hearts`}`;
  const comingSoon = await isGameComingSoon(HEARTS_SLUG);

  const faqItems = landing?.faq;
  if (faqItems) {
    const faqQuestions = (
      Object.values(faqItems) as Array<{ question: string; answer: string }>
    ).map((item) => ({
      question: item.question,
      answer: item.answer,
    }));
    const faqJsonLd = buildFaqJsonLd({
      locale,
      questions: faqQuestions,
      pageUrl,
      speakableSelectors: ['#faq'],
    });
    if (faqJsonLd) jsonLd.push(faqJsonLd);
  }

  return (
    <>
      <JsonLd id="json-ld-hearts" data={jsonLd} />
      <HeartsLanding
        comingSoon={comingSoon}
        createRoomHref={`${routes.gameCreate}?gameId=${HEARTS_SLUG}`}
        gameId={HEARTS_SLUG}
        gamesHref={routes.games}
        homeHref={routes.home}
        landing={landing}
        locale={locale}
        navTranslations={{
          homeTab: messages.navigation?.homeTab ?? 'Home',
          gamesTab: messages.navigation?.gamesTab ?? 'Games',
        }}
        roomsHref={`${routes.rooms}?gameId=${HEARTS_SLUG}`}
        rules={rules}
        translatedGames={
          messages.games as Record<
            string,
            { name?: string; description?: string } | undefined
          >
        }
      />
    </>
  );
}
