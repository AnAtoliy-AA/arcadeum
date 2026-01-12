import { gamesCatalog } from './catalog';
import type { GameRoomSummary } from './api/gamesApi';
import type { TranslationKey } from '@/lib/i18n/messages';

export function formatRoomGame(gameId: string): string {
  const normalizedId =
    gameId === 'exploding_kittens_v1' ? 'critical_v1' : gameId;
  return (
    gamesCatalog.find((game) => game.id === normalizedId)?.name ??
    'Unknown game'
  );
}

export function formatRoomHost(hostId: string): string {
  if (!hostId) return 'mystery captain';
  if (hostId.length <= 4) return hostId;
  return `${hostId.slice(0, 4)}…${hostId.slice(-2)}`;
}

export function getRoomStatusLabel(
  status: GameRoomSummary['status'],
): TranslationKey {
  switch (status) {
    case 'lobby':
      return 'games.rooms.status.lobby';
    case 'in_progress':
      return 'games.rooms.status.inProgress';
    case 'completed':
      return 'games.rooms.status.completed';
    default:
      return 'games.rooms.status.unknown';
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
