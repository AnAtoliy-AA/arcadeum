import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildVideoGameJsonLd } from '@/shared/seo/videoGameJsonLd';
import { getPostsByTag } from '@/features/blog/registry';
import { RelatedArticles } from '@/features/blog/RelatedArticles';
import CheckersLanding from './CheckersLanding';
import { isGameComingSoon } from '@/features/games/api.server';

const CHECKERS_SLUG = 'checkers_v1';
const CHECKERS_MIN_PLAYERS = 2;
const CHECKERS_MAX_PLAYERS = 2;
const CHECKERS_GENRE = 'Board Game';

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
  const base = await buildPageMetadata({ locale, page: 'checkersLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/checkers/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Checkers — free multiplayer on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/checkers/opengraph-image`],
    },
  };
}

export default async function CheckersLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.checkers_v1?.landing;
  const variants = messages.games?.checkers_v1?.variants;
  const rules = messages.games?.checkers_v1?.rules;
  const gameName = messages.games?.checkers_v1?.name ?? 'Checkers';
  const description =
    messages.games?.checkers_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = [
    ...buildVideoGameJsonLd({
      gameId: CHECKERS_SLUG,
      gameName,
      description: description ?? '',
      locale,
      minPlayers: CHECKERS_MIN_PLAYERS,
      maxPlayers: CHECKERS_MAX_PLAYERS,
      genre: CHECKERS_GENRE,
      alternateName: ['Draughts', 'Checkers Online', 'American Checkers'],
      breadcrumb: {
        home: messages.navigation?.homeTab ?? 'Home',
        games: messages.navigation?.gamesTab ?? 'Games',
        game: gameName,
      },
    }),
  ];

  const comingSoon = await isGameComingSoon(CHECKERS_SLUG);

  return (
    <>
      <JsonLd id="json-ld-checkers" data={jsonLd} />
      <CheckersLanding
        landing={landing}
        comingSoon={comingSoon}
        variants={variants}
        rules={rules}
        gameId={CHECKERS_SLUG}
        createRoomHref={`${routes.gameCreate}?gameId=${CHECKERS_SLUG}`}
        roomsHref={`${routes.rooms}?gameId=${CHECKERS_SLUG}`}
        gamesHref={routes.games}
        homeHref={routes.home}
        locale={locale}
        navTranslations={{
          homeTab: messages.navigation?.homeTab ?? 'Home',
          gamesTab: messages.navigation?.gamesTab ?? 'Games',
        }}
        translatedGames={
          messages.games as Record<
            string,
            { name?: string; description?: string } | undefined
          >
        }
      />
      <RelatedArticles
        locale={locale}
        posts={getPostsByTag(locale, [
          'Checkers',
          'Draughts',
          'Шашки',
          'Шашкі',
          'Dames',
        ])}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
