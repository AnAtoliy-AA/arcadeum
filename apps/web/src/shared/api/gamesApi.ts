import { resolveApiUrl } from "../lib/api-base";
import type { GameRoomSummary, GameSessionSummary } from "../types/games";

export async function startGameRoom(
  roomId: string,
  engine: string,
  accessToken: string
): Promise<{ room: GameRoomSummary; session: GameSessionSummary }> {
  const url = resolveApiUrl(`/games/rooms/${roomId}/start`);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ engine }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Failed to start game");
  }

  return response.json();
}

export async function getGameRoomSession(
  roomId: string,
  accessToken: string
): Promise<{ session: GameSessionSummary | null }> {
  const url = resolveApiUrl(`/games/rooms/${roomId}/session`);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return { session: null };
    }
    throw new Error("Failed to fetch session");
  }

  return response.json();
}
