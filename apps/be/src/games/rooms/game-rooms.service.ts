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

import {
  GameRoomSummary,
  ListRoomsFilters,
  ListRoomsResult,
  LeaveGameRoomResult,
  DeleteGameRoomResult,
} from './game-rooms.types';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomsRematchService } from './game-rooms.rematch.service';

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
    private readonly gameRoomsMapper: GameRoomsMapper,
    private readonly gameRoomsRematchService: GameRoomsRematchService,
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

    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
  }

  /**
   * List game rooms based on filters
   */
  async listRooms(
    filters: ListRoomsFilters = {},
    viewerId?: string,
  ): Promise<ListRoomsResult> {
    const query: FilterQuery<GameRoom> = {};
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

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

    const [rooms, total] = await Promise.all([
      this.gameRoomModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.gameRoomModel.countDocuments(query).exec(),
    ]);

    const summaries = await Promise.all(
      rooms.map((room) =>
        this.gameRoomsMapper.prepareRoomSummary(room, viewerId),
      ),
    );

    return {
      rooms: summaries,
      total,
      page,
      limit,
    };
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

    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
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
      return this.gameRoomsMapper.prepareRoomSummary(room, userId);
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

    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
  }

  /**
   * Ensure user is a participant (join if not already)
   */
  async ensureParticipant(roomId: string, userId: string): Promise<boolean> {
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
      return true;
    }
    return false;
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

    const summary = await this.gameRoomsMapper.prepareRoomSummary(room, userId);

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

  /**
   * Reorder participants (host only)
   */
  async reorderParticipants(
    roomId: string,
    userId: string,
    newOrder: string[],
  ): Promise<GameRoomSummary> {
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    if (room.hostId !== userId) {
      throw new ForbiddenException('Only the host can reorder participants');
    }

    // Verify all participants are present in newOrder
    const currentParticipantIds = room.participants.map((p) => p.userId);
    const isValidOrder =
      newOrder.length === currentParticipantIds.length &&
      newOrder.every((id) => currentParticipantIds.includes(id));

    if (!isValidOrder) {
      throw new BadRequestException('Invalid participant order');
    }

    // Create a map for quick access
    const participantMap = new Map(room.participants.map((p) => [p.userId, p]));

    // Reconstruct participants array in new order
    room.participants = newOrder.map((id) => participantMap.get(id)!);
    room.updatedAt = new Date();

    await room.save();

    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
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

  /**
   * Decline a rematch invitation
   */
  /**
   * Decline a rematch invitation
   */
  async declineRematchInvitation(
    roomId: string,
    userId: string,
  ): Promise<GameRoomSummary> {
    return this.gameRoomsRematchService.declineRematchInvitation(
      roomId,
      userId,
    );
  }

  /**
   * Block re-invites for a specific rematch room
   */
  async blockRematchRoom(
    roomId: string,
    userId: string,
  ): Promise<GameRoomSummary> {
    return this.gameRoomsRematchService.blockRematchRoom(roomId, userId);
  }

  /**
   * Re-invite players to a rematch
   */
  async reinviteRematchPlayers(
    roomId: string,
    hostId: string,
    userIds: string[],
  ): Promise<GameRoomSummary> {
    return this.gameRoomsRematchService.reinviteRematchPlayers(
      roomId,
      hostId,
      userIds,
    );
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
}
