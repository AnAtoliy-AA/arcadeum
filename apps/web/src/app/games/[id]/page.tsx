import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import type { GameRoomSummary } from '@/shared/types/games';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import { handleSsrFetchError } from '@/shared/lib/ssr';
import GameDetailClient from './GameDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GameDetailRoute({ params }: PageProps) {
  const { id: gameId } = await params;
  const accessToken = await getServerAccessToken();

  // Initial fetch on server
  let initialRooms: GameRoomSummary[] = [];
  try {
    const response = await gamesApi.getRooms(
      { gameId },
      { token: accessToken || undefined, timeout: SSR_TIMEOUT },
    );
    initialRooms = response.rooms;
  } catch (error) {
    handleSsrFetchError(`rooms for game ${gameId}`, error);
  }

  return <GameDetailClient initialRooms={initialRooms} />;
}
