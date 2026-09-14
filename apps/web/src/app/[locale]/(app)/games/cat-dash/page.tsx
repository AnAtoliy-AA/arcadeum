import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildGameLandingJsonLd } from '@/shared/seo/buildGameLandingJsonLd';
import { getPostsByTag } from '@/features/blog/registry';
import { RelatedArticles } from '@/features/blog/RelatedArticles';
import CatDashLanding from './CatDashLanding';
import { isGameComingSoon } from '@/features/games/api.server';

export const dynamic = 'force-static';

export const revalidate = 300;

const CAT_DASH_SLUG = 'cat_dash_v1';
const CAT_DASH_MIN_PLAYERS = 2;
const CAT_DASH_MAX_PLAYERS = 6;
const CAT_DASH_GENRE = 'Race';

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
  const base = await buildPageMetadata({ locale, page: 'catDashLanding' });
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/cat-dash/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Cat Dash — free multiplayer cat racing on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      images: [`${appConfig.siteUrl}/${locale}/games/cat-dash/opengraph-image`],
    },
  };
}

export default async function CatDashLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const landing = messages.games?.cat_dash_v1?.landing;
  const variants = messages.games?.cat_dash_v1?.variants;
  const rules = messages.games?.cat_dash_v1?.rules;
  const gameName = messages.games?.cat_dash_v1?.name ?? 'Cat Dash';
  const description =
    messages.games?.cat_dash_v1?.description ?? landing?.meta?.description;

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: CAT_DASH_SLUG,
    slug: 'cat-dash',
    gameName,
    description: description ?? '',
    locale,
    minPlayers: CAT_DASH_MIN_PLAYERS,
    maxPlayers: CAT_DASH_MAX_PLAYERS,
    genre: CAT_DASH_GENRE,
    alternateName: ['Cat Dash Racing', 'Cat Race Online', 'Dice Cat Runner'],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: landing
      ? {
          name: `How to Play Cat Dash on ${appConfig.appName}`,
          description:
            'Play Cat Dash — a dice-based race game for 2 to 6 players.',
          steps: [
            {
              name: landing.steps?.create?.title ?? 'Create a room',
              text:
                landing.steps?.create?.body ??
                'Create a room and pick a theme.',
            },
            {
              name: landing.steps?.join?.title ?? 'Invite',
              text:
                landing.steps?.join?.body ??
                'Invite up to 5 friends with the room link.',
            },
            {
              name: landing.steps?.play?.title ?? 'Play',
              text:
                landing.steps?.play?.body ??
                'Roll dice and use abilities to be the first to the finish.',
            },
          ],
          totalTime: 'PT2M',
        }
      : undefined,
    faqs: landing?.faq
      ? Object.values(landing.faq).map((f) => ({
          question: (f as { question: string; answer: string }).question,
          answer: (f as { question: string; answer: string }).answer,
        }))
      : undefined,
  });

  const comingSoon = await isGameComingSoon(CAT_DASH_SLUG);

  return (
    <>
      <JsonLd id="json-ld-cat-dash" data={jsonLd} />
      <CatDashLanding
        landing={landing}
        comingSoon={comingSoon}
        variants={variants}
        rules={rules}
        gameId={CAT_DASH_SLUG}
        createRoomHref={`${routes.gameCreate}?gameId=${CAT_DASH_SLUG}`}
        roomsHref={`${routes.rooms}?gameId=${CAT_DASH_SLUG}`}
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
          'Cat Dash',
          'Board Game',
          'Racing',
          'Гонки',
        ])}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
