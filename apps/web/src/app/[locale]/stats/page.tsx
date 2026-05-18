import { Suspense } from 'react';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import {
  historyApi,
  type LeaderboardResponse,
  type PlayerStats,
} from '@/features/history/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import StatsClient from './StatsClient';
import StatsLoading from './loading';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'stats' }) : {};
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Statistics({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <PageBreadcrumb locale={locale} page="stats" />
      <Suspense fallback={<StatsLoading />}>
        <StatsDataFetcher searchParams={resolvedSearchParams} />
      </Suspense>
    </>
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
