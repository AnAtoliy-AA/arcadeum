import { Suspense } from 'react';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { historyApi } from '@/features/history/api';
import { HistoryPage } from './HistoryPage';
import HistoryLoading from './loading';

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
          page,
          limit: 12,
        },
        {
          token: accessToken,
          timeout: 3000,
        },
      );
    }
  } catch (error) {
    console.error('Failed to pre-fetch history during SSR:', error);
  }

  return <HistoryPage initialData={initialData || undefined} />;
}
