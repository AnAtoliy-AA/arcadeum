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
import { CriticalLandingView } from './CriticalLandingView';

const CRITICAL_SLUG = 'critical_v1';
const CRITICAL_MIN_PLAYERS = 2;
const CRITICAL_MAX_PLAYERS = 5;
const CRITICAL_GENRE = 'Card Game';
// JSON-LD only — OG/Twitter unfurls fall back to the global file-based
// `opengraph-image` in the root metadata.
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
  const t = messages.games?.critical_v1?.landing?.meta;

  const base = await buildPageMetadata({
    locale,
    page: 'criticalLanding',
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
          url: `${appConfig.siteUrl}/${locale}/games/critical/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Critical — multiplayer card game on Arcadeum',
        },
      ],
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      title: t?.ogTitle ?? t?.title ?? base.twitter?.title,
      description:
        t?.ogDescription ?? t?.description ?? base.twitter?.description,
      images: [`${appConfig.siteUrl}/${locale}/games/critical/opengraph-image`],
    },
  };
}

export default async function CriticalLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const routes = buildRoutes(locale);
  const pageUrl = `${appConfig.siteUrl}${routes.criticalLanding}`;
  const messages = await getTranslations(locale);
  const landing = messages.games?.critical_v1?.landing;

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: 'Critical',
      alternateName: ['Critical Card Game', 'Critical Online'],
      description: landing?.meta?.description,
      url: pageUrl,
      image: JSON_LD_IMAGE,
      genre: CRITICAL_GENRE,
      gamePlatform: ['Web Browser'],
      operatingSystem: 'Any',
      applicationCategory: 'GameApplication',
      playMode: ['MultiPlayer', 'SinglePlayer'],
      numberOfPlayers: {
        '@type': 'QuantitativeValue',
        minValue: CRITICAL_MIN_PLAYERS,
        maxValue: CRITICAL_MAX_PLAYERS,
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
          name: landing?.breadcrumb?.critical,
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
      // Mark the on-page FAQ block (`<section id="faq">`) as speakable
      // so Google Assistant / voice surfaces know which slice is safe
      // to read aloud in response to a spoken query.
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['#faq'],
      },
    },
  ];

  // HowTo derived from the new `howToPlay` i18n that renders as the
  // numbered "How to play Critical" section. Eligible for Google's
  // step-by-step rich result on "how to play critical card game" and
  // related queries.
  const howToSteps = landing?.howToPlay?.steps;
  const howToJsonLd = howToSteps
    ? buildHowToJsonLd({
        locale,
        pageUrl,
        name: landing?.howToPlay?.title ?? 'How to play Critical',
        description: landing?.meta?.description,
        steps: [
          howToSteps.setup,
          howToSteps.draw,
          howToSteps.play,
          howToSteps.survive,
        ]
          .filter((s): s is { title: string; body: string } => !!s)
          .map((s) => ({ name: s.title, text: s.body })),
      })
    : null;
  if (howToJsonLd) jsonLd.push(howToJsonLd);

  const relatedPosts = getPostsByTag(locale, ['Critical', 'Card Game']);

  return (
    <>
      <JsonLd id="json-ld-critical" data={jsonLd} />
      <CriticalLandingView
        landing={landing}
        createRoomHref={`${routes.gameCreate}?gameId=${CRITICAL_SLUG}`}
        roomsHref={routes.gameDetail(CRITICAL_SLUG)}
        homeHref={routes.home}
        gamesHref={routes.games}
      />
      <RelatedArticles
        locale={locale}
        posts={relatedPosts}
        gameName={landing?.hero?.title}
      />
    </>
  );
}
