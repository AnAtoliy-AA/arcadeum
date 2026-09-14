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
import { CriticalLandingView } from './CriticalLandingView';
import { isGameComingSoon } from '@/features/games/api.server';

export const dynamic = 'force-static';

export const revalidate = 300;

const CRITICAL_SLUG = 'critical_v1';
const CRITICAL_MIN_PLAYERS = 2;
const CRITICAL_MAX_PLAYERS = 5;
const CRITICAL_GENRE = 'Card Game';

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
  const comingSoon = await isGameComingSoon(CRITICAL_SLUG);
  const messages = await getTranslations(locale);
  const landing = messages.games?.critical_v1?.landing;
  const gameName = messages.games?.critical_v1?.name ?? 'Critical';
  const description = landing?.meta?.description ?? '';

  const jsonLd: Record<string, unknown>[] = buildGameLandingJsonLd({
    gameId: CRITICAL_SLUG,
    slug: 'critical',
    gameName,
    description,
    locale,
    minPlayers: CRITICAL_MIN_PLAYERS,
    maxPlayers: CRITICAL_MAX_PLAYERS,
    genre: CRITICAL_GENRE,
    alternateName: [
      'Critical Card Game',
      'Critical Online',
      'Russian Roulette Card Game',
    ],
    breadcrumb: {
      home: messages.navigation?.homeTab ?? 'Home',
      games: messages.navigation?.gamesTab ?? 'Games',
    },
    howTo: landing?.howToPlay?.steps
      ? {
          name:
            landing.howToPlay.title ??
            `How to Play Critical on ${appConfig.appName}`,
          description:
            landing.meta?.description ??
            'Play Critical online — a fast-paced card game for 3 to 5 players. No download or signup required.',
          steps: Object.values(landing.howToPlay.steps).map((s) => ({
            name: s.title,
            text: s.body,
          })),
          totalTime: 'PT2M',
        }
      : undefined,
    faqs: landing?.faq?.items
      ? Object.values(landing.faq.items).map((f) => ({
          question: f.question,
          answer: f.answer,
        }))
      : undefined,
  });

  const relatedPosts = getPostsByTag(locale, ['Critical', 'Card Game']);

  return (
    <>
      <JsonLd id="json-ld-critical" data={jsonLd} />
      <CriticalLandingView
        landing={landing}
        comingSoon={comingSoon}
        gameId={CRITICAL_SLUG}
        roomsHref={`${routes.rooms}?gameId=${CRITICAL_SLUG}`}
        createRoomHref={`${routes.gameCreate}?gameId=${CRITICAL_SLUG}`}
        homeHref={routes.home}
        gamesHref={routes.games}
        locale={locale}
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
