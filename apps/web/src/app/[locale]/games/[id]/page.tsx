import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { appConfig, SSR_TIMEOUT } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import GamesClient from '../GamesClient';
import GamesLoading from '../loading';

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getGameName(
  gameId: string,
  locale: import('@/shared/i18n').Locale,
): Promise<string> {
  const messages = await getTranslations(locale);
  const fromGames = (
    messages.games as Record<string, { name?: string } | undefined> | undefined
  )?.[gameId]?.name;
  return fromGames ?? gameId;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};
  const gameName = await getGameName(id, locale);
  return buildPageMetadata({
    locale,
    page: 'games',
    title: `${gameName} · ${appConfig.appName}`,
    description: `Browse open ${gameName} rooms on ${appConfig.appName} — join an existing match or start your own.`,
    pathFor: (r) => r.gameDetail(id),
  });
}

export default async function GameDetailRoute({
  params,
  searchParams,
}: PageProps) {
  const { locale: rawLocale, id: gameId } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : 'en';
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<GamesLoading />}>
      <GameDetailDataFetcher
        locale={locale}
        gameId={gameId}
        searchParams={resolvedSearchParams}
      />
    </Suspense>
  );
}

async function GameDetailDataFetcher({
  locale,
  gameId,
  searchParams,
}: {
  locale: import('@/shared/i18n').Locale;
  gameId: string;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const accessToken = await getServerAccessToken();
  const gameName = await getGameName(gameId, locale);

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
        gameId,
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
    handleSsrFetchError(`rooms for game ${gameId}`, error);
  }

  return (
    <GamesClient
      initialData={initialData}
      gameId={gameId}
      pageTitle={gameName}
    />
  );
}
