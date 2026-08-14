import type { Metadata } from 'next';
import { appConfig } from '@/shared/config/app-config';
import { buildRoutes } from '@/shared/config/routes';
import { getTranslations } from '@/shared/i18n/server';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildHowToJsonLd } from '@/shared/seo/howToJsonLd';
import { getPostsByTag } from '@/features/blog/registry';
import { RelatedArticles } from '@/features/blog/RelatedArticles';
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
      // Speakable hint for Google Assistant / voice surfaces. `#faq` is
      // the FAQ section's id on the rendered SeaBattleLanding view —
      // stable across builds (unlike Tamagui's hashed module classes).
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['#faq'],
      },
    },
  ];

  // HowTo derived from the existing `howToPlay` i18n that already
  // renders on the landing. Eligible for Google's step-by-step rich
  // result on "how to play battleship" / "battleship rules" queries
  // — a high-traffic surface (landing) emits the schema on top of the
  // blog post that ships the long-form version.
  const howToSteps = landing?.howToPlay?.steps;
  const howToJsonLd = howToSteps
    ? buildHowToJsonLd({
        locale,
        pageUrl,
        name: landing?.howToPlay?.title ?? 'How to play Sea Battle',
        description: landing?.meta?.description,
        steps: [
          howToSteps.create,
          howToSteps.place,
          howToSteps.fire,
          howToSteps.win,
        ]
          .filter((s): s is { title: string; body: string } => !!s)
          .map((s) => ({ name: s.title, text: s.body })),
      })
    : null;
  if (howToJsonLd) jsonLd.push(howToJsonLd);

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
        createRoomHref={`${routes.gameCreate}?gameId=${SEA_BATTLE_SLUG}`}
        roomsHref={routes.gameDetail(SEA_BATTLE_SLUG)}
        homeHref={routes.home}
        gamesHref={routes.games}
        rulesT={messages.games?.sea_battle_v1?.rules}
        variantsT={messages.games?.sea_battle_v1?.variants}
      />
      <RelatedArticles
        locale={locale}
        posts={relatedPosts}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
