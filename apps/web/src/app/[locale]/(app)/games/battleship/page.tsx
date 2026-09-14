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
import BattleshipLanding from './BattleshipLanding';
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

  const title = t?.title?.replace(/Sea Battle/g, 'Battleship') ?? 'Battleship';
  const description = t?.description?.replace(/Sea Battle/g, 'Battleship');

  const base = await buildPageMetadata({
    locale,
    page: 'battleshipLanding',
    title,
    description,
  });

  return {
    ...base,
    keywords: t?.keywords,
    openGraph: {
      ...base.openGraph,
      title: t?.ogTitle?.replace(/Sea Battle/g, 'Battleship') ?? title,
      description:
        t?.ogDescription?.replace(/Sea Battle/g, 'Battleship') ?? description,
      images: [
        {
          url: `${appConfig.siteUrl}/${locale}/games/battleship/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Battleship — free online naval combat on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      title: t?.ogTitle?.replace(/Sea Battle/g, 'Battleship') ?? title,
      description:
        t?.ogDescription?.replace(/Sea Battle/g, 'Battleship') ?? description,
      images: [
        `${appConfig.siteUrl}/${locale}/games/battleship/opengraph-image`,
      ],
    },
  };
}

export default async function BattleshipLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const routes = buildRoutes(locale);
  const comingSoon = await isGameComingSoon(SEA_BATTLE_SLUG);
  const messages = await getTranslations(locale);
  const landing = messages.games?.sea_battle_v1?.landing;
  const description = landing?.meta?.description ?? '';

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: SEA_BATTLE_SLUG,
    slug: 'battleship',
    gameName: 'Battleship',
    description,
    locale,
    minPlayers: SEA_BATTLE_MIN_PLAYERS,
    maxPlayers: SEA_BATTLE_MAX_PLAYERS,
    genre: SEA_BATTLE_GENRE,
    alternateName: [
      'Sea Battle',
      'Battleship Online',
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
          name: `How to Play Battleship on ${appConfig.appName}`,
          description:
            'Play Battleship online — free multiplayer for 2 to 4 players. No download or signup required.',
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
      <JsonLd id="json-ld-battleship" data={jsonLd} />
      <BattleshipLanding
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
        gameName="Battleship"
      />
    </>
  );
}
