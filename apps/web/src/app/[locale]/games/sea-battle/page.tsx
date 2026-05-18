import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import SeaBattleLanding from './SeaBattleLanding';

const SEA_BATTLE_SLUG = 'sea_battle_v1';
const SEA_BATTLE_MIN_PLAYERS = 2;
const SEA_BATTLE_MAX_PLAYERS = 4;
const SEA_BATTLE_GENRE = 'Strategy';
// Image URL for JSON-LD only — for OG/Twitter unfurls we let Next's
// file-based opengraph-image.tsx / twitter-image.tsx generate a real
// 1200×630 game-themed preview at build/request time.
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
  const routes = buildRoutes(locale);
  const pageUrl = `${appConfig.siteUrl}${routes.seaBattleLanding}`;
  const messages = await getTranslations(locale);
  const t = messages.games?.sea_battle_v1?.landing?.meta;

  return {
    title: t?.title,
    description: t?.description,
    keywords: t?.keywords,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: t?.ogTitle ?? t?.title,
      description: t?.ogDescription ?? t?.description,
      url: pageUrl,
      siteName: appConfig.appName,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t?.ogTitle ?? t?.title,
      description: t?.ogDescription ?? t?.description,
    },
  };
}

export default async function SeaBattleLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const routes = buildRoutes(locale);
  const pageUrl = `${appConfig.siteUrl}${routes.seaBattleLanding}`;
  const messages = await getTranslations(locale);
  const landing = messages.games?.sea_battle_v1?.landing;

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: 'Sea Battle',
      alternateName: ['Battleship', 'Sea Battle Online'],
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
          name: landing?.breadcrumb?.seaBattle,
          item: pageUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: Object.values(landing?.faq?.items ?? {}).map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <>
      <JsonLd id="json-ld-sea-battle" data={jsonLd} />
      <SeaBattleLanding
        landing={landing}
        createRoomHref={`${routes.gameCreate}?gameId=${SEA_BATTLE_SLUG}`}
        roomsHref={routes.gameDetail(SEA_BATTLE_SLUG)}
        homeHref={routes.home}
        gamesHref={routes.games}
        rulesT={messages.games?.sea_battle_v1?.rules}
        variantsT={messages.games?.sea_battle_v1?.variants}
      />
    </>
  );
}
