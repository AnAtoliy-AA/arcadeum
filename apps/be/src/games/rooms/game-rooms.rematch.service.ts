import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomSummary } from './game-rooms.types';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';

@Injectable()
export class GameRoomsRematchService {
  constructor(
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly gameRoomModel: Model<GameRoom>,
    private readonly gameRoomsMapper: GameRoomsMapper,
  ) {}

  /**
   * Decline a rematch invitation
   */
  async declineRematchInvitation(
    roomId: string,
    userId: string,
  ): Promise<GameRoomSummary> {
    const room = await this.gameRoomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    const gameOptions = room.gameOptions || {};
    const invitedIds = (gameOptions.rematchInvitedIds as string[]) || [];
    const declinedIds = (gameOptions.rematchDeclinedIds as string[]) || [];

    // Remove from invited, add to declined
    if (invitedIds.includes(userId)) {
      gameOptions.rematchInvitedIds = invitedIds.filter((id) => id !== userId);
    }
    if (!declinedIds.includes(userId)) {
      declinedIds.push(userId);
      gameOptions.rematchDeclinedIds = declinedIds;
    }

    if (
      room.status === 'lobby' &&
      ((gameOptions.rematchInvitedIds as string[]) || []).length === 0 &&
      room.participants.length < (room.maxPlayers ?? 2)
    ) {
      const botId = `bot-${globalThis.crypto.randomUUID().slice(0, 10)}`;
      room.participants.push({ userId: botId, joinedAt: new Date() });
    }

    room.markModified('gameOptions');
    await room.save();

    return this.gameRoomsMapper.prepareRoomSummary(room);
  }

  /** Accept a rematch invitation and join the already-created rematch lobby. */
  async acceptRematchInvitation(
    roomId: string,
    userId: string,
  ): Promise<GameRoomSummary> {
    const room = await this.gameRoomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    const gameOptions = room.gameOptions || {};
    const invitedIds = (gameOptions.rematchInvitedIds as string[]) || [];
    if (!invitedIds.includes(userId)) {
      throw new ForbiddenException('You are not invited to this rematch');
    }

    if (room.status !== 'lobby') {
      throw new ForbiddenException('This rematch is no longer available');
    }

    if (
      !room.participants.some((participant) => participant.userId === userId)
    ) {
      room.participants.push({ userId, joinedAt: new Date() });
    }
    gameOptions.rematchInvitedIds = invitedIds.filter((id) => id !== userId);
    const acceptedIds = (gameOptions.rematchAcceptedIds as string[]) || [];
    if (!acceptedIds.includes(userId)) acceptedIds.push(userId);
    gameOptions.rematchAcceptedIds = acceptedIds;
    room.markModified('gameOptions');
    await room.save();

    return this.gameRoomsMapper.prepareRoomSummary(room);
  }

  /**
   * Block re-invites for a specific rematch room
   * User won't be re-invited to this specific room, but can still receive invites from the host in other games
   */
  async blockRematchRoom(
    roomId: string,
    userId: string,
  ): Promise<GameRoomSummary> {
    const room = await this.gameRoomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    const gameOptions = room.gameOptions || {};
    const invitedIds = (gameOptions.rematchInvitedIds as string[]) || [];
    const declinedIds = (gameOptions.rematchDeclinedIds as string[]) || [];
    const blockedIds = (gameOptions.rematchBlockedIds as string[]) || [];

    if (invitedIds.includes(userId)) {
      gameOptions.rematchInvitedIds = invitedIds.filter((id) => id !== userId);
    }
    if (!declinedIds.includes(userId)) {
      declinedIds.push(userId);
      gameOptions.rematchDeclinedIds = declinedIds;
    }
    if (!blockedIds.includes(userId)) {
      blockedIds.push(userId);
      gameOptions.rematchBlockedIds = blockedIds;
    }

    if (
      room.status === 'lobby' &&
      ((gameOptions.rematchInvitedIds as string[]) || []).length === 0 &&
      room.participants.length < (room.maxPlayers ?? 2)
    ) {
      const botId = `bot-${globalThis.crypto.randomUUID().slice(0, 10)}`;
      room.participants.push({ userId: botId, joinedAt: new Date() });
    }

    room.markModified('gameOptions');
    await room.save();

    return this.gameRoomsMapper.prepareRoomSummary(room);
  }

  /**
   * Re-invite players to a rematch
   */
  async reinviteRematchPlayers(
    roomId: string,
    hostId: string,
    userIds: string[],
  ): Promise<GameRoomSummary> {
    const room = await this.gameRoomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    if (room.hostId !== hostId) {
      throw new ForbiddenException('Only the host can re-invite players');
    }

    const gameOptions = room.gameOptions || {};
    const invitedIds = (gameOptions.rematchInvitedIds as string[]) || [];
    let declinedIds = (gameOptions.rematchDeclinedIds as string[]) || [];
    const blockedIds = (gameOptions.rematchBlockedIds as string[]) || [];

    // Filter out room-blocked users - they can't be re-invited to this room
    const allowedUserIds = userIds.filter((uid) => !blockedIds.includes(uid));

    const newInvitedIds = [...invitedIds];
    allowedUserIds.forEach((uid) => {
      if (!newInvitedIds.includes(uid)) {
        newInvitedIds.push(uid);
      }
    });

    // Remove them from declined list if they were there
    declinedIds = declinedIds.filter((did) => !allowedUserIds.includes(did));

    gameOptions.rematchInvitedIds = newInvitedIds;
    gameOptions.rematchDeclinedIds = declinedIds;

    room.markModified('gameOptions');
    await room.save();

    return this.gameRoomsMapper.prepareRoomSummary(room);
  }
}
