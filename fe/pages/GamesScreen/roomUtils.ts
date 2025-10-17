import { gamesCatalog } from './catalog';
import type { GameRoomSummary } from './api/gamesApi';

export function formatRoomGame(gameId: string): string {
  return gamesCatalog.find((game) => game.id === gameId)?.name ?? 'Unknown game';
}

export function formatRoomHost(hostId: string): string {
  if (!hostId) return 'mystery captain';
  if (hostId.length <= 4) return hostId;
  return `${hostId.slice(0, 4)}…${hostId.slice(-2)}`;
}

export function getRoomStatusLabel(status: GameRoomSummary['status']): string {
  switch (status) {
    case 'lobby':
      return 'Lobby open';
    case 'in_progress':
      return 'Match running';
    case 'completed':
      return 'Session wrapped';
    default:
      return 'Unknown status';
  }
}

export function formatRoomTimestamp(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return 'Just created';
  }

  try {
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return date.toISOString();
  }
}
