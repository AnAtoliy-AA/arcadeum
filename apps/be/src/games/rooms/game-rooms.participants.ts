import { GameRoom } from '../schemas/game-room.schema';
import {
  validateHost,
  validateParticipantOrder,
} from './game-rooms.validation';

type ParticipantList = Array<{ userId: string }>;

export function isRoomParticipant(
  participants: ParticipantList,
  userId: string,
): boolean {
  return participants.some((p) => p.userId === userId);
}

export function addRoomParticipant(room: GameRoom, userId: string): boolean {
  if (isRoomParticipant(room.participants, userId)) return false;
  room.participants.push({ userId, joinedAt: new Date() });
  return true;
}

export function removeRoomParticipant(room: GameRoom, userId: string): boolean {
  const previousLength = room.participants.length;
  room.participants = room.participants.filter((p) => p.userId !== userId);
  const removed = room.participants.length < previousLength;
  if (
    removed &&
    room.gameOptions?.rematchPreviousRoomId &&
    room.status === 'lobby' &&
    room.participants.length === 1 &&
    !room.participants[0].userId.startsWith('bot-')
  ) {
    const botId = `bot-${globalThis.crypto.randomUUID().slice(0, 10)}`;
    room.participants.push({ userId: botId, joinedAt: new Date() });
  }
  return removed;
}

export function getRoomParticipantIds(room: GameRoom): string[] {
  return room.participants.map((p) => p.userId);
}

export function reorderRoomParticipants(
  room: GameRoom,
  userId: string,
  newOrder: string[],
): GameRoom {
  validateHost(room.hostId, userId);
  validateParticipantOrder(room.participants, newOrder);
  const participantMap = new Map(room.participants.map((p) => [p.userId, p]));
  room.participants = newOrder.map((id) => participantMap.get(id)!);
  return room;
}
