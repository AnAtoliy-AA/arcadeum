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
import { GlimwormLandingView } from './GlimwormLandingView';

const GLIMWORM_SLUG = 'glimworm_v1';
const GLIMWORM_MIN_PLAYERS = 2;
const GLIMWORM_MAX_PLAYERS = 10;
const GLIMWORM_GENRE = 'Action';
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
  const t = messages.games?.glimworm_v1?.landing?.meta;

  const base = await buildPageMetadata({
    locale,
    page: 'glimwormLanding',
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
    },
    twitter: {
      ...base.twitter,
      card: 'summary_large_image',
      title: t?.ogTitle ?? t?.title ?? base.twitter?.title,
      description:
        t?.ogDescription ?? t?.description ?? base.twitter?.description,
    },
  };
}

export default async function GlimwormLandingRoute({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const routes = buildRoutes(locale);
  const pageUrl = `${appConfig.siteUrl}${routes.glimwormLanding}`;
  const messages = await getTranslations(locale);
  const landing = messages.games?.glimworm_v1?.landing;

  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: 'Glimworm',
      alternateName: ['Glimworm Online', 'Glow Snake Arena'],
      description: landing?.meta?.description,
      url: pageUrl,
      image: JSON_LD_IMAGE,
      genre: GLIMWORM_GENRE,
      gamePlatform: ['Web Browser'],
      operatingSystem: 'Any',
      applicationCategory: 'GameApplication',
      playMode: ['MultiPlayer', 'SinglePlayer'],
      numberOfPlayers: {
        '@type': 'QuantitativeValue',
        minValue: GLIMWORM_MIN_PLAYERS,
        maxValue: GLIMWORM_MAX_PLAYERS,
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
          name: landing?.breadcrumb?.glimworm,
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
      // See critical/page.tsx for the rationale — `#faq` is the stable
      // anchor on the landing's FAQ section that voice surfaces use to
      // pick up the question/answer pairs.
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['#faq'],
      },
    },
  ];

  // HowTo schema derived from the new visible `howToPlay` section.
  // Boosts SERP CTR on instructional queries ("how to play snake game
  // online", "slither.io rules").
  const howToSteps = landing?.howToPlay?.steps;
  const howToJsonLd = howToSteps
    ? buildHowToJsonLd({
        locale,
        pageUrl,
        name: landing?.howToPlay?.title ?? 'How to play Glimworm',
        description: landing?.meta?.description,
        steps: [
          howToSteps.setup,
          howToSteps.slither,
          howToSteps.evade,
          howToSteps.survive,
        ]
          .filter((s): s is { title: string; body: string } => !!s)
          .map((s) => ({ name: s.title, text: s.body })),
      })
    : null;
  if (howToJsonLd) jsonLd.push(howToJsonLd);

  const relatedPosts = getPostsByTag(locale, ['Glimworm', 'Snake', 'Arcade']);

  return (
    <>
      <JsonLd id="json-ld-glimworm" data={jsonLd} />
      <GlimwormLandingView
        landing={landing}
        createRoomHref={`${routes.gameCreate}?gameId=${GLIMWORM_SLUG}`}
        roomsHref={routes.gameDetail(GLIMWORM_SLUG)}
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
