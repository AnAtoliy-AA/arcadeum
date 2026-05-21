import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { appConfig, SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import GameRoomClient from './GameRoomClient';
import GameRoomLoading from './loading';
import { routes } from '@/shared/config/routes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const [{ id }, locale] = await Promise.all([params, getRequestLocale()]);
  return buildMetadata({
    title: 'Game Room',
    description: `Join game room ${id} on ${appConfig.appName}.`,
    path: routes.gameRoom(id),
    index: false,
    locale,
  });
}

export default async function GameRoomRoute({ params }: PageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<GameRoomLoading />}>
      <RoomDataFetcher id={resolvedParams.id} />
    </Suspense>
  );
}

async function RoomDataFetcher({ id }: { id: string }) {
  const accessToken = await getServerAccessToken();

  let initialData = null;
  try {
    initialData = await gamesApi.getRoomInfo(id, {
      token: accessToken || undefined,
      timeout: SSR_TIMEOUT,
    });
  } catch (error) {
    handleSsrFetchError(`room info for ${id}`, error);
  }

  return (
    <GameRoomClient
      params={Promise.resolve({ id })}
      initialData={initialData}
    />
  );
}
