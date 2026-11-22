import { apiClient, ApiError } from '../lib/api-client';
import type { GameRoomSummary, GameSessionSummary } from '../types/games';

export async function startGameRoom(
  roomId: string,
  engine: string,
  accessToken?: string,
): Promise<{ room: GameRoomSummary; session: GameSessionSummary }> {
  return apiClient.post<{ room: GameRoomSummary; session: GameSessionSummary }>(
    `/games/rooms/${roomId}/start`,
    { engine },
    { token: accessToken },
  );
}

export async function reorderRoomParticipants(
  roomId: string,
  userIds: string[],
  accessToken?: string,
): Promise<{ room: GameRoomSummary }> {
  return apiClient.post<{ room: GameRoomSummary }>(
    `/games/rooms/${roomId}/participants`,
    { userIds },
    { token: accessToken },
  );
}

export async function getGameRoomSession(
  roomId: string,
  accessToken?: string,
): Promise<{ session: GameSessionSummary | null }> {
  try {
    return await apiClient.get<{ session: GameSessionSummary | null }>(
      `/games/rooms/${roomId}/session`,
      { token: accessToken },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { session: null };
    }
    throw error;
  }
}

export async function addBotToRoom(
  roomId: string,
  accessToken?: string,
): Promise<{ room: GameRoomSummary }> {
  return apiClient.post<{ room: GameRoomSummary }>(
    `/games/rooms/${roomId}/add-bot`,
    undefined,
    { token: accessToken },
  );
}

export async function removeBotFromRoom(
  roomId: string,
  botId: string,
  accessToken?: string,
): Promise<{ room: GameRoomSummary }> {
  return apiClient.post<{ room: GameRoomSummary }>(
    `/games/rooms/${roomId}/remove-bot`,
    { botId },
    { token: accessToken },
  );
}
