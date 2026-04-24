import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { appConfig, SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import GamesClient from './GamesClient';
import GamesLoading from './loading';

export const metadata: Metadata = {
  title: 'Games',
  description: `Explore the library of available board games on ${appConfig.appName}. Join or create a room to play with friends.`,
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GamesRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<GamesLoading />}>
      <GamesDataFetcher searchParams={resolvedSearchParams} />
    </Suspense>
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
