import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import { appConfig } from '@/shared/config/app-config';
import GameRoomPage from './components/GameRoomPage';
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
      timeout: 5000,
    });
  } catch (error) {
    // Suppress noisy 'room_not_found_error' logs during SSR in development/test
    // as mocked rooms in E2E only exist in the browser context.
    const isNotFoundError =
      error instanceof Error && error.message === 'room_not_found_error';
    const isDev = process.env.NODE_ENV === 'development';

    if (!isNotFoundError || !isDev) {
      console.error(
        `Failed to pre-fetch room info for ${id} during SSR:`,
        error,
      );
    }
  }

  return <GameRoomPage initialData={initialData} />;
}
