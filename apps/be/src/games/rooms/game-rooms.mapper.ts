import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomSummary } from './game-rooms.types';

@Injectable()
export class GameRoomsMapper {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async prepareRoomSummary(
    room: GameRoom,
    viewerId?: string,
  ): Promise<GameRoomSummary> {
    const { invitedIds, declinedIds } = this.getRematchLists(room);
    const userMap = await this.fetchAllRelevantUsers(
      room,
      invitedIds,
      declinedIds,
    );

    const host = userMap.get(room.hostId);
    const members = room.participants.map((p) =>
      this.mapUserToMember(p.userId, userMap, room.hostId),
    );

    const rematchInvitedUsers = invitedIds.map((id) =>
      this.mapRematchUser(id, userMap),
    );

    const rematchDeclinedUsers = declinedIds.map((id) =>
      this.mapRematchUser(id, userMap),
    );

    const summary: GameRoomSummary = {
      id: room._id.toString(),
      gameId: room.gameId,
      name: room.name,
      hostId: room.hostId,
      visibility: room.visibility,
      playerCount: room.participants.length,
      maxPlayers: room.maxPlayers ?? null,
      createdAt: room.createdAt.toISOString(),
      status: room.status,
      inviteCode: room.inviteCode,
      gameOptions: room.gameOptions ? structuredClone(room.gameOptions) : {},
      rematchInvitedUsers,
      rematchDeclinedUsers,
      host: host
        ? {
            id: room.hostId,
            displayName: host.username || host.email || 'Unknown',
            username: host.username || null,
            email: host.email || null,
            isHost: true,
          }
        : undefined,
      members,
    };

    if (viewerId) {
      this.enrichViewerInfo(summary, room, viewerId);
    }

    return summary;
  }

  private getRematchLists(room: GameRoom) {
    const gameOptions = room.gameOptions || {};
    return {
      invitedIds: (gameOptions.rematchInvitedIds as string[]) || [],
      declinedIds: (gameOptions.rematchDeclinedIds as string[]) || [],
    };
  }

  private async fetchAllRelevantUsers(
    room: GameRoom,
    invitedIds: string[],
    declinedIds: string[],
  ): Promise<Map<string, User>> {
    const userIds = [
      room.hostId,
      ...room.participants.map((p) => p.userId),
      ...invitedIds,
      ...declinedIds,
    ];
    const uniqueUserIds = Array.from(new Set(userIds));

    const users = await this.userModel
      .find({ _id: { $in: uniqueUserIds } })
      .select('username email')
      .exec();

    return new Map(users.map((u) => [u._id.toString(), u]));
  }

  private mapUserToMember(
    userId: string,
    userMap: Map<string, User>,
    roomHostId: string,
  ) {
    const user = userMap.get(userId);
    return {
      id: userId,
      displayName: user?.username || user?.email || 'Unknown',
      username: user?.username || null,
      email: user?.email || null,
      isHost: userId === roomHostId,
    };
  }

  private mapRematchUser(userId: string, userMap: Map<string, User>) {
    const user = userMap.get(userId);
    return {
      id: userId,
      displayName: user?.username || user?.email || 'Unknown',
      username: user?.username || null,
      email: user?.email || null,
      isHost: false,
    };
  }

  private enrichViewerInfo(
    summary: GameRoomSummary,
    room: GameRoom,
    viewerId: string,
  ) {
    summary.viewerIsHost = room.hostId === viewerId;
    summary.viewerHasJoined = room.participants.some(
      (p) => p.userId === viewerId,
    );
    summary.viewerRole = summary.viewerIsHost
      ? 'host'
      : summary.viewerHasJoined
        ? 'participant'
        : 'none';
  }
}
