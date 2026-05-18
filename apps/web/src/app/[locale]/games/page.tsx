import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { appConfig, SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildCollectionPageJsonLd } from '@/shared/seo/collectionPageJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { featuredGames } from '../home/data/games';
import { JsonLd } from '@/shared/ui/JsonLd';
import GamesClient from './GamesClient';
import GamesLoading from './loading';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'games' })
    : {};
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export default async function GamesRoute({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const resolvedSearchParams = await searchParams;
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const gamesNamespace = messages.games as
    | Record<
        string,
        { name?: string; description?: string; summary?: string } | undefined
      >
    | undefined;

  const collectionItems = featuredGames
    .filter((g) => g.isPlayable)
    .map((g) => {
      const name = gamesNamespace?.[g.id]?.name ?? g.id;
      const description =
        gamesNamespace?.[g.id]?.description ??
        gamesNamespace?.[g.id]?.summary;
      const url = g.landingHref
        ? `/${locale}${g.landingHref}`
        : routes.gameDetail(g.id);
      return { name, url, description };
    });

  const collectionPage = buildCollectionPageJsonLd({
    locale,
    pageUrl: routes.games,
    name:
      messages.seo?.games?.title ??
      `${messages.navigation?.gamesTab ?? 'Games'} · ${appConfig.appName}`,
    description: messages.seo?.games?.description,
    items: collectionItems,
  });

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.navigation?.gamesTab ?? 'Games',
        url: routes.games,
      },
    ],
  });

  return (
    <>
      <JsonLd
        id={`json-ld-games-${locale}`}
        data={[collectionPage, breadcrumb]}
      />
      <Suspense fallback={<GamesLoading />}>
        <GamesDataFetcher searchParams={resolvedSearchParams} />
      </Suspense>
    </>
  );
}

async function GamesDataFetcher({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const accessToken = await getServerAccessToken();

  // Extract filters from searchParams
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : 'all';
  const participation =
    typeof searchParams.participation === 'string'
      ? searchParams.participation
      : 'all';
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const page =
    typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 0;

  // Initial fetch on server
  let initialData = null;
  try {
    initialData = await gamesApi.getRooms(
      {
        status,
        participation,
        search,
        page,
        limit: 12,
      },
      {
        token: accessToken || undefined,
        timeout: SSR_TIMEOUT,
      },
    );
  } catch (error) {
    handleSsrFetchError('games', error);
    // Keep initialData as null so client can try to fetch
  }

  return <GamesClient initialData={initialData} />;
}
