import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { appConfig, SSR_TIMEOUT } from '@/shared/config/app-config';
import { getTranslations } from '@/shared/i18n/server';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import { routes } from '@/shared/config/routes';
import GamesClient from '../GamesClient';
import GamesLoading from '../loading';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getGameName(gameId: string): Promise<string> {
  const messages = await getTranslations();
  const fromGames = (
    messages.games as
      | Record<string, { name?: string } | undefined>
      | undefined
  )?.[gameId]?.name;
  return fromGames ?? gameId;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const gameName = await getGameName(id);
  return {
    title: `${gameName} · ${appConfig.appName}`,
    description: `Browse open ${gameName} rooms on ${appConfig.appName} — join an existing match or start your own.`,
    alternates: { canonical: routes.gameDetail(id) },
  };
}

export default async function GameDetailRoute({
  params,
  searchParams,
}: PageProps) {
  const { id: gameId } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense fallback={<GamesLoading />}>
      <GameDetailDataFetcher
        gameId={gameId}
        searchParams={resolvedSearchParams}
      />
    </Suspense>
  );
}

async function GameDetailDataFetcher({
  gameId,
  searchParams,
}: {
  gameId: string;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const accessToken = await getServerAccessToken();
  const gameName = await getGameName(gameId);

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
