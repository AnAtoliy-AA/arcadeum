import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { GameRoom } from '../schemas/game-room.schema';

export function validateRoomId(roomId: string | undefined): void {
  if (!roomId || !Types.ObjectId.isValid(roomId)) {
    throw new BadRequestException('Invalid roomId format');
  }
}

export function validateInviteCode(room: GameRoom, inviteCode?: string): void {
  if (room.visibility === 'private' && room.inviteCode !== inviteCode) {
    throw new ForbiddenException('Invalid invite code');
  }
}

export async function validatePassword(
  room: GameRoom,
  password?: string,
): Promise<void> {
  if (room.password) {
    if (!password) throw new ForbiddenException('Room requires a password');
    const passwordValid = await bcrypt.compare(password, room.password);
    if (!passwordValid) throw new ForbiddenException('Invalid room password');
  }
}

export function validateMaxPlayers(room: GameRoom): void {
  if (room.maxPlayers && room.participants.length >= room.maxPlayers) {
    throw new BadRequestException('Room is full');
  }
}

export function validateHost(hostId: string, userId: string): void {
  if (hostId !== userId) {
    throw new ForbiddenException('Only the host can perform this action');
  }
}

export function validateParticipant(
  participants: Array<{ userId: string }>,
  userId: string,
): void {
  const isParticipant = participants.some((p) => p.userId === userId);
  if (!isParticipant) {
    throw new BadRequestException('Not a member of this room');
  }
}

export function validateKick(
  room: GameRoom,
  userId: string,
  kickedBy?: string,
): void {
  if (kickedBy) {
    if (kickedBy !== room.hostId) {
      throw new ForbiddenException('Only the host can kick players');
    }
    if (userId === kickedBy) {
      throw new BadRequestException('Cannot kick yourself');
    }
    const isParticipant = room.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new BadRequestException(
        'Target user is not a participant of this room',
      );
    }
  }
}

export function validateParticipantOrder(
  currentParticipants: Array<{ userId: string }>,
  newOrder: string[],
): void {
  const currentParticipantIds = currentParticipants.map((p) => p.userId);
  const isValidOrder =
    newOrder.length === currentParticipantIds.length &&
    newOrder.every((id) => currentParticipantIds.includes(id));

  if (!isValidOrder) {
    throw new BadRequestException('Invalid participant order');
  }
}
