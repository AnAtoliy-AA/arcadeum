import { NotFoundException, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { isRoomParticipant } from './game-rooms.participants';

export async function loadRoomEntity(
  ociRoomModel: Model<GameRoom>,
  roomId: string,
  options: { lean?: boolean; select?: string } = {},
): Promise<GameRoom> {
  if (typeof roomId !== 'string')
    throw new NotFoundException('Invalid room ID');
  if (!Types.ObjectId.isValid(roomId))
    throw new NotFoundException(`Invalid room ID format: ${roomId}`);
  const query = options.select
    ? ociRoomModel.findById(roomId).select(options.select)
    : ociRoomModel.findById(roomId);
  const room = options.lean ? await query.lean().exec() : await query.exec();
  if (!room) throw new NotFoundException(`Room not found: ${roomId}`);
  return room as GameRoom;
}

export async function mirrorRoomToAtlas(
  atlasRoomModel: Model<GameRoom> | undefined,
  logger: Logger,
  roomId: string,
  patch: Record<string, unknown>,
  upsert = false,
): Promise<void> {
  if (!atlasRoomModel) return;
  if (typeof roomId !== 'string' || !Types.ObjectId.isValid(roomId)) {
    logger.warn(`Skipping Atlas mirror due to invalid room ID: ${roomId}`);
    return;
  }
  try {
    await atlasRoomModel.updateOne(
      { _id: { $eq: roomId } },
      { $set: patch },
      upsert ? { upsert: true } : undefined,
    );
  } catch (err) {
    logger.warn(
      `Failed to mirror room to Atlas for room ${roomId}: ${(err as Error).message}`,
    );
  }
}

/** Ids of users with a pending (not yet accepted) invitation to this room. */
export function getPendingInvitedIds(room: GameRoom): string[] {
  const ids = room.gameOptions?.rematchInvitedIds;
  return Array.isArray(ids) ? (ids as string[]) : [];
}

export function canViewRoom(room: GameRoom, userId?: string | null): boolean {
  if (room.visibility === 'public') return true;
  if (!userId) return false;
  return (
    room.hostId === userId ||
    isRoomParticipant(room.participants, userId) ||
    // An invited user must be able to open a private room to accept/decline.
    getPendingInvitedIds(room).includes(userId)
  );
}
