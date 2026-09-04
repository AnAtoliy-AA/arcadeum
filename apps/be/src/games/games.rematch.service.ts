import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GameRoomsService } from './rooms/game-rooms.service';
import { GameHistoryService } from './history/game-history.service';
import { GamesRealtimeService } from './games.realtime.service';
import { NotificationDispatcher } from '../notifications/notifications.dispatcher';
import { User } from '../auth/schemas/user.schema';
import { HistoryRematchDto } from './dtos/history-rematch.dto';

@Injectable()
export class GamesRematchService {
  private readonly logger = new Logger(GamesRematchService.name);

  constructor(
    private readonly roomsService: GameRoomsService,
    private readonly historyService: GameHistoryService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly dispatcher: NotificationDispatcher,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Create a rematch
   */
  async createRematchFromHistory(
    userId: string,
    roomId: string,
    participantIds: string[],
    options?: {
      gameId?: string;
      name?: string;
      visibility?: 'public' | 'private';
      gameOptions?: Record<string, unknown>;
      message?: string;
    },
  ) {
    const dto: HistoryRematchDto = {
      roomId,
      participantIds,
      ...options,
    };
    const { id: newRoomId, invitedIds } =
      await this.historyService.createRematchFromHistory(dto, userId);

    // Fetch new room to get host details
    const newRoom = await this.roomsService.getRoom(newRoomId, userId);

    // Filter out users who have blocked the host
    const filteredInvitedIds = await this.filterBlockedUsers(
      userId,
      invitedIds,
    );

    // Emit real-time event to the old room (only to non-blocking users)
    if (filteredInvitedIds.length > 0) {
      this.realtimeService.emitRematchInvited(
        roomId,
        newRoomId,
        userId,
        newRoom.host?.displayName || 'Unknown Host',
        filteredInvitedIds,
        options?.message,
      );
    }

    return newRoomId;
  }

  /**
   * Decline a rematch invitation
   */
  async declineInvitation(roomId: string, userId: string): Promise<void> {
    const room = await this.roomsService.declineRematchInvitation(
      roomId,
      userId,
    );
    this.realtimeService.emitPlayerDeclined(room, userId);
  }

  /**
   * Block re-invites for a specific rematch room
   */
  async blockRematchRoom(roomId: string, userId: string): Promise<void> {
    const room = await this.roomsService.blockRematchRoom(roomId, userId);
    this.realtimeService.emitPlayerDeclined(room, userId);
  }

  /**
   * Re-invite players to a rematch
   */
  async reinvitePlayers(
    roomId: string,
    hostId: string,
    userIds: string[],
  ): Promise<void> {
    const room = await this.roomsService.reinviteRematchPlayers(
      roomId,
      hostId,
      userIds,
    );

    // Get host name from room
    const hostName = room.host?.displayName || 'Unknown Host';
    const gameId = room.gameId || 'game';

    // Get previous room ID from game options to broadcast invite to
    const gameOptions = room.gameOptions || {};
    const previousRoomId = gameOptions.rematchPreviousRoomId as string;

    // Filter out users who have blocked the host
    const filteredUserIds = await this.filterBlockedUsers(hostId, userIds);

    if (previousRoomId && filteredUserIds.length > 0) {
      this.realtimeService.emitRematchInvited(
        previousRoomId,
        room.id,
        hostId,
        hostName,
        filteredUserIds,
        gameOptions.rematchMessage as string | undefined,
      );
    }

    // Dispatch notification to each invited user
    for (const invitedUserId of filteredUserIds) {
      this.dispatcher
        .dispatch({
          userId: invitedUserId,
          category: 'game_invitation',
          titleKey: 'notifications.game_invitation.title',
          bodyKey: 'notifications.game_invitation.body',
          i18nParams: { hostName, gameId },
          url: `/rooms/${encodeURIComponent(room.id)}`,
          data: {
            roomId: room.id,
            hostId,
            gameId,
          },
          skipCategoryCheck: true,
        })
        .catch((err) => {
          this.logger.warn(
            `Failed to dispatch game_invitation to ${invitedUserId}: ${err}`,
          );
        });
    }

    // Also broadcast update to the current room so host sees updated status
    this.realtimeService.emitRoomUpdated(room);
  }

  /**
   * Filter out user IDs where the user has blocked the host
   */
  private async filterBlockedUsers(
    hostId: string,
    userIds: string[],
  ): Promise<string[]> {
    const validIds = userIds.filter((id) => Types.ObjectId.isValid(id));
    if (validIds.length === 0) return userIds;
    const users = await this.userModel
      .find({ _id: { $in: validIds } })
      .select('blockedUsers')
      .lean()
      .exec();
    const blocked = new Set<string>();
    for (const user of users) {
      if ((user.blockedUsers || []).includes(hostId)) {
        blocked.add(user._id.toHexString());
      }
    }
    return userIds.filter((id) => !blocked.has(id));
  }
}
