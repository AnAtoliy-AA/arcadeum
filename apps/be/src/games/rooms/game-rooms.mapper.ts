import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomSummary, GameRoomMemberSummary } from './game-rooms.types';

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

    // Deduplicate participants to ensure unique members list
    const uniqueMemberIds = new Set<string>();
    const members: GameRoomMemberSummary[] = [];

    // Number bots by their join order so the lobby/sidebar renders "Bot 1",
    // "Bot 2", ... instead of "Unknown" (which is the userMap fallback for
    // bot ids — they aren't real Users so no record exists in Mongo).
    let botCounter = 0;
    const botIndexById = new Map<string, number>();
    for (const p of room.participants) {
      const pUserId = String(p.userId);
      if (pUserId.startsWith('bot-') && !botIndexById.has(pUserId)) {
        botCounter += 1;
        botIndexById.set(pUserId, botCounter);
      }
    }

    for (const p of room.participants) {
      const pUserId = String(p.userId);
      if (!uniqueMemberIds.has(pUserId)) {
        uniqueMemberIds.add(pUserId);
        members.push(
          this.mapUserToMember(
            pUserId,
            userMap,
            room.hostId,
            botIndexById.get(pUserId),
          ),
        );
      }
    }

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
      playerCount: members.length, // Use unique count
      maxPlayers: room.maxPlayers ?? null,
      createdAt: room.createdAt.toISOString(),
      status: room.status,
      inviteCode: room.inviteCode,
      hasPassword: !!(room as unknown as { password?: string }).password,
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

    const validUserIds = uniqueUserIds.filter((id) =>
      Types.ObjectId.isValid(id),
    );

    const users = await this.userModel
      .find({ _id: { $in: validUserIds } })
      .select(
        'username email role equippedAvatarId equippedBadgeId equippedNameColorId equippedFrameId equippedAuraId equippedBannerId equippedBackgroundId',
      )
      .exec();

    return new Map(users.map((u) => [u._id.toString(), u]));
  }

  private mapUserToMember(
    userId: string,
    userMap: Map<string, User>,
    roomHostId: string,
    botIndex?: number,
  ) {
    const user = userMap.get(userId);
    const isAnonymous = userId.startsWith('anon_');
    const isBot = userId.startsWith('bot-');
    const anonSuffix = isAnonymous
      ? userId.replace('anon_', '').slice(0, 4)
      : '';
    const displayName = isBot
      ? `Bot${botIndex ? ` ${botIndex}` : ''}`
      : user?.username ||
        user?.email ||
        (isAnonymous ? `Anonymous #${anonSuffix}` : 'Unknown');

    return {
      id: userId,
      displayName,
      username: user?.username || null,
      email: user?.email || null,
      isHost: userId === roomHostId,
      role: user?.role ?? null,
      equippedAvatarId: user?.equippedAvatarId ?? null,
      equippedBadgeId: user?.equippedBadgeId ?? null,
      equippedNameColorId: user?.equippedNameColorId ?? null,
      equippedFrameId: user?.equippedFrameId ?? null,
      equippedAuraId: user?.equippedAuraId ?? null,
      equippedBannerId: user?.equippedBannerId ?? null,
      equippedBackgroundId: user?.equippedBackgroundId ?? null,
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
