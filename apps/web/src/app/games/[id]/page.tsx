import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { gamesApi } from '@/features/games/api';
import type { GameRoomSummary } from '@/shared/types/games';
import { GameDetailPage } from './GameDetailPage';

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
      { token: accessToken || undefined, timeout: 5000 },
    );
    initialRooms = response.rooms;
  } catch (error) {
    console.error(
      `Failed to pre-fetch rooms for game ${gameId} during SSR:`,
      error,
    );
  }

  return <GameDetailPage initialRooms={initialRooms} />;
}
