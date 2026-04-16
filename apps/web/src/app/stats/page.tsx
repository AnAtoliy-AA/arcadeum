import { Suspense } from 'react';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import {
  historyApi,
  type LeaderboardResponse,
  type PlayerStats,
} from '@/features/history/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import StatsClient from './StatsClient';
import StatsLoading from './loading';

export const metadata = {
  title: 'Player Statistics - Arcadeum',
  description: 'View your game performance and statistics',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Statistics({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<StatsLoading />}>
      <StatsDataFetcher searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

async function StatsDataFetcher({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const accessToken = await getServerAccessToken();
  const selectedGame =
    typeof searchParams.game === 'string' ? searchParams.game : undefined;

  // Initial fetches on server
  let initialStats = null;
  let initialLeaderboard = null;

  try {
    const promises: Promise<unknown>[] = [
      historyApi.getLeaderboard(10, 0, selectedGame, { timeout: SSR_TIMEOUT }),
    ];

    if (accessToken) {
      promises.push(
        historyApi.getStats({ token: accessToken, timeout: SSR_TIMEOUT }),
      );
    }

    const results = await Promise.allSettled(promises);

    // Result 0 is always leaderboard
    if (results[0].status === 'fulfilled') {
      initialLeaderboard = results[0].value as LeaderboardResponse;
    }

    // Result 1 is stats (if user is authenticated)
    if (results[1]?.status === 'fulfilled') {
      initialStats = results[1].value as PlayerStats;
    }
  } catch (error) {
    console.error('Failed to pre-fetch stats during SSR:', error);
  }

  return (
    <StatsClient
      initialStats={initialStats}
      initialLeaderboard={initialLeaderboard}
    />
  );
}
