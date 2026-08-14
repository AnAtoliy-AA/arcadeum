import { Suspense } from 'react';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { historyApi } from '@/features/history/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { ApiError } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';
import HistoryClient from './HistoryClient';
import HistoryLoading from './loading';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'history' }) : {};
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HistoryRoute({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <PageBreadcrumb locale={locale} page="history" />
      <Suspense fallback={<HistoryLoading />}>
        <HistoryDataFetcher searchParams={resolvedSearchParams} />
      </Suspense>
    </>
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
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to pre-fetch history during SSR:', error);
    }
  }

  return <HistoryClient initialData={initialData || undefined} />;
}
