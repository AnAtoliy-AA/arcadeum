import { Suspense } from 'react';
import type { Metadata } from 'next';
import {
  getServerAccessToken,
  getServerAnonymousId,
} from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import { JsonLd } from '@/shared/ui/JsonLd';
import RoomsClient from './RoomsClient';
import RoomsLoading from './loading';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'rooms' }) : {};
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function resolveLocale(raw: string): Locale {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export default async function RoomsRoute({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const resolvedSearchParams = await searchParams;
  const messages = await getTranslations(locale);
  const routes = buildRoutes(locale);

  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.navigation?.roomsTab ?? 'Rooms',
        url: routes.rooms,
      },
    ],
  });

  return (
    <>
      <JsonLd id={`json-ld-rooms-${locale}`} data={[breadcrumb]} />
      <Suspense fallback={<RoomsLoading />}>
        <RoomsDataFetcher searchParams={resolvedSearchParams} />
      </Suspense>
    </>
  );
}

async function RoomsDataFetcher({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const accessToken = await getServerAccessToken();
  // Anonymous players: forward the cookie-mirrored anon id so SSR respects
  // participation filters (games they host/joined), same as client fetches.
  const anonymousId = accessToken ? null : await getServerAnonymousId();

  const gameId =
    typeof searchParams.gameId === 'string' ? searchParams.gameId : undefined;
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

  let initialData = null;
  try {
    initialData = await gamesApi.getRooms(
      {
        status,
        participation,
        search,
        page,
        limit: 12,
        gameId,
      },
      {
        token: accessToken || undefined,
        anonymousId: anonymousId || undefined,
        timeout: SSR_TIMEOUT,
      },
    );
  } catch (error) {
    handleSsrFetchError('rooms', error);
  }

  return <RoomsClient initialData={initialData} gameId={gameId} />;
}
