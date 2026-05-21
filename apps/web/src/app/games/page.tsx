import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { appConfig, SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { getSeoMessages } from '@/shared/seo/messages';
import { breadcrumbList, collectionPage } from '@/shared/seo/jsonLd';
import GamesClient from './GamesClient';
import GamesLoading from './loading';
import { routes } from '@/shared/config/routes';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const seo = getSeoMessages(locale, 'games');
  return buildMetadata({
    ...seo,
    path: routes.games,
    keywords: [
      'browse board games',
      'find a game room',
      'join board game online',
      'game library',
    ],
    locale,
  });
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const GAMES_JSON_LD = [
  collectionPage({
    name: `Games — ${appConfig.appName}`,
    description: 'Browse the full library of board games and join a room.',
    path: routes.games,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Games', path: routes.games },
  ]),
];

export default async function GamesRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <JsonLd data={GAMES_JSON_LD} />
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
