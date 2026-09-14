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
import SeaBattleLanding from './SeaBattleLanding';
import { isGameComingSoon } from '@/features/games/api.server';

export const dynamic = 'force-static';

export const revalidate = 300;

const SEA_BATTLE_SLUG = 'sea_battle_v1';
const SEA_BATTLE_MIN_PLAYERS = 2;
const SEA_BATTLE_MAX_PLAYERS = 4;
const SEA_BATTLE_GENRE = 'Strategy';

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
  const messages = await getTranslations(locale);
  const t = messages.games?.sea_battle_v1?.landing?.meta;

  // The Sea Battle landing keeps its richer in-game metadata (keywords,
  // distinct OG title/description from the games namespace), wrapped in
  // the shared `buildPageMetadata` so hreflang + alternates stay correct.
  const base = await buildPageMetadata({
    locale,
    page: 'seaBattleLanding',
    title: t?.title,
    description: t?.description,
  });

  return {
    ...base,
    keywords: t?.keywords,
    openGraph: {
      ...base.openGraph,
      title: t?.ogTitle ?? t?.title ?? base.openGraph?.title,
      description:
        t?.ogDescription ?? t?.description ?? base.openGraph?.description,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/sea-battle/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Sea Battle — free online Battleship on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      title: t?.ogTitle ?? t?.title ?? base.twitter?.title,
      description:
        t?.ogDescription ?? t?.description ?? base.twitter?.description,
      images: [
        `${appConfig.siteUrl}/${locale}/games/sea-battle/opengraph-image`,
      ],
    },
  };
}

export default async function SeaBattleLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const routes = buildRoutes(locale);
  const comingSoon = await isGameComingSoon(SEA_BATTLE_SLUG);
  const messages = await getTranslations(locale);
  const landing = messages.games?.sea_battle_v1?.landing;
  const gameName = landing?.hero?.title ?? 'Sea Battle';
  const description = landing?.meta?.description ?? '';

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: SEA_BATTLE_SLUG,
    slug: 'sea-battle',
    gameName,
    description,
    locale,
    minPlayers: SEA_BATTLE_MIN_PLAYERS,
    maxPlayers: SEA_BATTLE_MAX_PLAYERS,
    genre: SEA_BATTLE_GENRE,
    alternateName: [
      'Battleship',
      'Sea Battle Online',
      'Bataille Navale',
      'Морской бой',
    ],
    breadcrumb: {
      home: landing?.breadcrumb?.home ?? messages.navigation?.homeTab ?? 'Home',
      games:
        landing?.breadcrumb?.games ?? messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: landing
      ? {
          name: `How to Play Sea Battle on ${appConfig.appName}`,
          description:
            'Play Sea Battle (Battleship) online — free multiplayer for 2 to 4 players. No download or signup required.',
          steps: [
            {
              name: 'Place your ships',
              text: 'Arrange your fleet on the grid before the battle begins.',
            },
            {
              name: 'Invite opponents',
              text: 'Share the room link with 1 to 3 opponents or use Quick Play matchmaking.',
            },
            {
              name: 'Fire and sink',
              text: 'Take turns firing at opponent grids. Sink all enemy ships first to win.',
            },
          ],
          totalTime: 'PT2M',
        }
      : undefined,
    faqs: landing?.faq?.items
      ? Object.values(landing.faq.items).map((f) => ({
          question: (f as { question: string; answer: string }).question,
          answer: (f as { question: string; answer: string }).answer,
        }))
      : undefined,
  });

  const relatedPosts = getPostsByTag(locale, [
    'Sea Battle',
    'Battleship',
    'Bataille navale',
    'Batalla Naval',
    'Морской бой',
    'Марскі бой',
  ]);

  return (
    <>
      <JsonLd id="json-ld-sea-battle" data={jsonLd} />
      <SeaBattleLanding
        landing={landing}
        comingSoon={comingSoon}
        createRoomHref={`${routes.gameCreate}?gameId=${SEA_BATTLE_SLUG}`}
        roomsHref={`${routes.rooms}?gameId=${SEA_BATTLE_SLUG}`}
        homeHref={routes.home}
        gamesHref={routes.games}
        locale={locale}
        rulesT={messages.games?.sea_battle_v1?.rules}
        translatedGames={
          messages.games as Record<
            string,
            { name?: string; description?: string } | undefined
          >
        }
      />
      <RelatedArticles
        locale={locale}
        posts={relatedPosts}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
