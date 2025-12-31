import { randomBytes } from 'crypto';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { GameRoom, type GameRoomStatus } from '../schemas/game-room.schema';
import { User } from '../../auth/schemas/user.schema';
import { CreateGameRoomDto } from '../dtos/create-game-room.dto';
import { JoinGameRoomDto } from '../dtos/join-game-room.dto';
import { LeaveGameRoomDto } from '../dtos/leave-game-room.dto';
import { DeleteGameRoomDto } from '../dtos/delete-game-room.dto';

export interface GameRoomMemberSummary {
  id: string;
  displayName: string;
  username?: string | null;
  email?: string | null;
  isHost: boolean;
}

export interface GameRoomSummary {
  id: string;
  gameId: string;
  name: string;
  hostId: string;
  visibility: GameRoom['visibility'];
  playerCount: number;
  maxPlayers: number | null;
  createdAt: string;
  status: GameRoomStatus;
  inviteCode?: string;
  gameOptions?: Record<string, unknown>;
  host?: GameRoomMemberSummary;
  members?: GameRoomMemberSummary[];
  viewerRole?: 'host' | 'participant' | 'none';
  viewerHasJoined?: boolean;
  viewerIsHost?: boolean;
}

export interface ListRoomsFilters {
  gameId?: string;
  status?: GameRoomStatus;
  statuses?: GameRoomStatus[];
  visibility?:
    | 'public'
    | 'private'
    | 'friends'
    | ('public' | 'private' | 'friends')[];
  userId?: string;
  participation?:
    | 'host'
    | 'participant'
    | 'any'
    | 'hosting'
    | 'joined'
    | 'not_joined';
}

export interface LeaveGameRoomResult {
  room: GameRoomSummary | null;
  deleted: boolean;
  removedPlayerId: string;
}

export interface DeleteGameRoomResult {
  roomId: string;
  deleted: boolean;
}

/**
 * Game Rooms Service
 * Handles all room-related operations (CRUD, joining, leaving)
 */
@Injectable()
export class GameRoomsService {
  constructor(
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  /**
   * Create a new game room
   */
  async createRoom(
    userId: string,
    dto: CreateGameRoomDto,
  ): Promise<GameRoomSummary> {
    const inviteCode =
      dto.visibility === 'private'
        ? await this.generateInviteCode()
        : undefined;

    const room = await this.gameRoomModel.create({
      gameId: dto.gameId,
      name: dto.name,
      hostId: userId,
      visibility: dto.visibility,
      maxPlayers: dto.maxPlayers || null,
      inviteCode,
      participants: [
        {
          userId,
          joinedAt: new Date(),
        },
      ],
      status: 'lobby',
      gameOptions: dto.gameOptions || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.prepareRoomSummary(room, userId);
  }

  /**
   * List game rooms based on filters
   */
  async listRooms(
    filters: ListRoomsFilters = {},
    viewerId?: string,
  ): Promise<GameRoomSummary[]> {
    const query: FilterQuery<GameRoom> = {};

    if (filters.gameId) {
      query.gameId = filters.gameId;
    }

    if (filters.status) {
      query.status = filters.status;
    } else if (filters.statuses && filters.statuses.length > 0) {
      query.status = { $in: filters.statuses };
    }

    if (filters.visibility) {
      if (Array.isArray(filters.visibility)) {
        query.visibility = { $in: filters.visibility };
      } else {
        query.visibility = filters.visibility;
      }
    }

    if (filters.participation && filters.userId) {
      if (
        filters.participation === 'host' ||
        filters.participation === 'hosting'
      ) {
        query.hostId = filters.userId;
      } else if (
        filters.participation === 'participant' ||
        filters.participation === 'joined'
      ) {
        query['participants.userId'] = filters.userId;
      } else if (filters.participation === 'not_joined') {
        query['participants.userId'] = { $ne: filters.userId };
        query.hostId = { $ne: filters.userId };
      } else if (filters.participation === 'any') {
        query.$or = [
          { hostId: filters.userId },
          { 'participants.userId': filters.userId },
        ];
      }
    }

    const rooms = await this.gameRoomModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    const summaries = await Promise.all(
      rooms.map((room) => this.prepareRoomSummary(room, viewerId)),
    );

    return summaries;
  }

  /**
   * Get a specific room by ID
   */
  async getRoom(roomId: string, userId?: string): Promise<GameRoomSummary> {
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    if (!this.canViewRoom(room, userId)) {
      throw new ForbiddenException('Cannot view this room');
    }

    return this.prepareRoomSummary(room, userId);
  }

  /**
   * Join a game room
   */
  async joinRoom(
    dto: JoinGameRoomDto,
    userId: string,
  ): Promise<GameRoomSummary> {
    const room = await this.gameRoomModel.findById(dto.roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${dto.roomId}`);
    }

    // Check if already a participant (allow rejoining even if game started)
    const isParticipant = room.participants.some((p) => p.userId === userId);

    if (isParticipant) {
      return this.prepareRoomSummary(room, userId);
    }

    // New players can only join if game hasn't started yet
    if (room.status !== 'lobby') {
      throw new BadRequestException('Cannot join - game already started');
    }

    // Validate invite code for private rooms
    if (room.visibility === 'private' && room.inviteCode !== dto.inviteCode) {
      throw new ForbiddenException('Invalid invite code');
    }

    // Check max players
    if (room.maxPlayers && room.participants.length >= room.maxPlayers) {
      throw new BadRequestException('Room is full');
    }

    // Add participant
    room.participants.push({
      userId,
      joinedAt: new Date(),
    });
    room.updatedAt = new Date();

    await room.save();

    return this.prepareRoomSummary(room, userId);
  }

  /**
   * Ensure user is a participant (join if not already)
   */
  async ensureParticipant(roomId: string, userId: string): Promise<void> {
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    const isParticipant = room.participants.some((p) => p.userId === userId);

    if (!isParticipant) {
      room.participants.push({
        userId,
        joinedAt: new Date(),
      });
      room.updatedAt = new Date();
      await room.save();
    }
  }

  /**
   * Leave a game room
   */
  async leaveRoom(
    dto: LeaveGameRoomDto,
    userId: string,
  ): Promise<LeaveGameRoomResult> {
    const room = await this.gameRoomModel.findById(dto.roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${dto.roomId}`);
    }

    const isHost = room.hostId === userId;
    const isParticipant = room.participants.some((p) => p.userId === userId);

    if (!isHost && !isParticipant) {
      throw new BadRequestException('Not a member of this room');
    }

    // If host leaves or room becomes empty, delete the room
    if (isHost || room.participants.length === 1) {
      await this.gameRoomModel.findByIdAndDelete(dto.roomId).exec();
      return {
        room: null,
        deleted: true,
        removedPlayerId: userId,
      };
    }

    // Remove participant
    room.participants = room.participants.filter((p) => p.userId !== userId);
    room.updatedAt = new Date();
    await room.save();

    const summary = await this.prepareRoomSummary(room, userId);

    return {
      room: summary,
      deleted: false,
      removedPlayerId: userId,
    };
  }

  /**
   * Delete a game room (host only)
   */
  async deleteRoom(
    dto: DeleteGameRoomDto,
    userId: string,
  ): Promise<DeleteGameRoomResult> {
    const room = await this.gameRoomModel.findById(dto.roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${dto.roomId}`);
    }

    if (room.hostId !== userId) {
      throw new ForbiddenException('Only the host can delete the room');
    }

    await this.gameRoomModel.findByIdAndDelete(dto.roomId).exec();

    return {
      roomId: dto.roomId,
      deleted: true,
    };
  }

  /**
   * Update room status
   */
  async updateRoomStatus(
    roomId: string,
    status: GameRoomStatus,
  ): Promise<GameRoom> {
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    room.status = status;
    room.updatedAt = new Date();
    await room.save();

    return room;
  }

  /**
   * Get room participants
   */
  async getRoomParticipants(roomId: string): Promise<string[]> {
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    return room.participants.map((p) => p.userId);
  }

  // ========== Private Helper Methods ==========

  private canViewRoom(room: GameRoom, userId?: string | null): boolean {
    if (room.visibility === 'public') {
      return true;
    }

    if (!userId) {
      return false;
    }

    // Host can always view
    if (room.hostId === userId) {
      return true;
    }

    // Participants can view
    if (room.participants.some((p) => p.userId === userId)) {
      return true;
    }

    // Private rooms require invite code (handled in join)
    return false;
  }

  private async generateInviteCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = randomBytes(4).toString('hex').toUpperCase();
      const existing = await this.gameRoomModel
        .findOne({ inviteCode: code })
        .exec();
      exists = !!existing;
    }

    return code!;
  }

  private async prepareRoomSummary(
    room: GameRoom,
    viewerId?: string,
  ): Promise<GameRoomSummary> {
    const userIds = [room.hostId, ...room.participants.map((p) => p.userId)];
    const uniqueUserIds = Array.from(new Set(userIds));

    const users = await this.userModel
      .find({ _id: { $in: uniqueUserIds } })
      .select('username email')
      .exec();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const host = userMap.get(room.hostId);
    const members = room.participants.map((p) => {
      const user = userMap.get(p.userId);
      return {
        id: p.userId,
        displayName: user?.username || user?.email || 'Unknown',
        username: user?.username || null,
        email: user?.email || null,
        isHost: p.userId === room.hostId,
      };
    });

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
      gameOptions: room.gameOptions,
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

    return summary;
  }
}
