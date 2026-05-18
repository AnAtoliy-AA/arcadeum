import { Suspense } from 'react';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { historyApi } from '@/features/history/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { ApiError } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import HistoryClient from './HistoryClient';
import HistoryLoading from './loading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game History',
  description: 'Review your past games and results.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HistoryRoute({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<HistoryLoading />}>
      <HistoryDataFetcher searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

async function HistoryDataFetcher({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const accessToken = await getServerAccessToken();

  // Extract filters from searchParams
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : 'all';
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : '';
  const page =
    typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;

  // Initial fetch on server
  let initialData = null;
  try {
    if (accessToken) {
      initialData = await historyApi.getHistory(
        {
          status,
          search,
          page: page - 1, // Convert from 1-indexed UI to 0-indexed API
          limit: 12,
        },
        {
          token: accessToken,
          timeout: SSR_TIMEOUT,
        },
      );
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === HttpStatus.UNAUTHORIZED) {
      // Intentionally ignore to show 'Login Required' UI on the client
      return <HistoryClient initialData={undefined} />;
    }
    console.error('Failed to pre-fetch history during SSR:', error);
  }

  return <HistoryClient initialData={initialData || undefined} />;
}
