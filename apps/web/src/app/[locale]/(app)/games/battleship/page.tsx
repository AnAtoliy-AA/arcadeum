import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { getPostsByTag } from '@/features/blog/registry';
import { RelatedArticles } from '@/features/blog/RelatedArticles';
import SeaBattleLanding from '../sea-battle/SeaBattleLanding';
import { isGameComingSoon } from '@/features/games/api.server';

const SEA_BATTLE_SLUG = 'sea_battle_v1';
const SEA_BATTLE_MIN_PLAYERS = 2;
const SEA_BATTLE_MAX_PLAYERS = 4;
const SEA_BATTLE_GENRE = 'Strategy';
const JSON_LD_IMAGE = `${appConfig.siteUrl}/logo.png`;

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

  const base = await buildPageMetadata({
    locale,
    page: 'battleshipLanding',
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
      title: t?.ogTitle ?? t?.title ?? base.twitter?.title,
      description:
        t?.ogDescription ?? t?.description ?? base.twitter?.description,
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
  const pageUrl = `${appConfig.siteUrl}${routes.battleshipLanding}`;
  const comingSoon = await isGameComingSoon(SEA_BATTLE_SLUG);
  const messages = await getTranslations(locale);
  const landing = messages.games?.sea_battle_v1?.landing;
  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: 'Battleship',
      alternateName: [
        'Sea Battle',
        'Battleship Online',
        'Bataille Navale',
        'Морской бой',
      ],
      description: landing?.meta?.description,
      url: pageUrl,
      image: JSON_LD_IMAGE,
      genre: SEA_BATTLE_GENRE,
      gamePlatform: ['Web Browser'],
      operatingSystem: 'Any',
      applicationCategory: 'GameApplication',
      playMode: ['MultiPlayer', 'CoOp', 'SinglePlayer'],
      numberOfPlayers: {
        '@type': 'QuantitativeValue',
        minValue: SEA_BATTLE_MIN_PLAYERS,
        maxValue: SEA_BATTLE_MAX_PLAYERS,
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      publisher: {
        '@type': 'Organization',
        name: appConfig.appName,
        url: appConfig.siteUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: landing?.breadcrumb?.home,
          item: `${appConfig.siteUrl}${routes.home}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: landing?.breadcrumb?.games,
          item: `${appConfig.siteUrl}${routes.games}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Battleship',
          item: pageUrl,
        },
      ],
    },
  ];

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
