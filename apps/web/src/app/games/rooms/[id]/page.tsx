import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { appConfig, SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import GameRoomClient from './GameRoomClient';
import GameRoomLoading from './loading';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Game Room | ${appConfig.appName}`,
    description: `Join game room ${resolvedParams.id} on ${appConfig.appName}.`,
  };
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

  // Initial fetch on server
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
