import { GAME_ROOM_STATUS, type GameRoomSummary } from '@/shared/types/games';

export interface MemberLike {
  id: string;
  displayName?: string | null;
  username?: string | null;
  email?: string | null;
}

export const isBotId = (id: string) => id.startsWith('bot-');
export const isAnonId = (id: string) => id.startsWith('anon_');

/** True when the room is a bot room: bot host, bot member, or AI vs AI. */
export function isBotRoom(room: GameRoomSummary): boolean {
  return (
    room.gameOptions?.aiVsAi === true ||
    isBotId(room.hostId) ||
    room.members?.some((m) => isBotId(m.id)) === true
  );
}

export function seatsLeft(room: GameRoomSummary): number | null {
  if (!room.maxPlayers) return null;
  return Math.max(0, room.maxPlayers - room.playerCount);
}

export type RoomCta = 'join' | 'resume' | 'full' | 'none';

/**
 * Decide the primary call to action. Bot rooms in the lobby stay joinable
 * (the room page resolves seat takeover), so they are never shown as full.
 */
export function resolveRoomCta(
  room: GameRoomSummary,
  isParticipant: boolean,
): RoomCta {
  if (room.status === GAME_ROOM_STATUS.COMPLETED) return 'none';
  if (isParticipant) {
    return room.status === GAME_ROOM_STATUS.LOBBY ? 'join' : 'resume';
  }
  if (room.status !== GAME_ROOM_STATUS.LOBBY) return 'none';
  if (isBotRoom(room)) return 'join';
  return seatsLeft(room) === 0 ? 'full' : 'join';
}

export function memberLabel(
  member: MemberLike,
  labels: { guest: (id: string) => string; bot: string },
): string {
  const name = member.displayName?.trim();
  if (name && !name.startsWith('anon_')) return name;
  if (isAnonId(member.id)) return labels.guest(member.id.slice(5, 9));
  if (isBotId(member.id)) return labels.bot;
  return member.username ?? member.email ?? member.id;
}
