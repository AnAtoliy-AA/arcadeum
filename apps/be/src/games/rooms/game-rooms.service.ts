import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../common/constants/bcrypt';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
  JoinGameRoomResult,
  LeaveGameRoomResult,
  DeleteGameRoomResult,
} from './game-rooms.types';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomsRematchService } from './game-rooms.rematch.service';
import { GameRoomsQueryBuilder } from './game-rooms.query';
import { GameEngineRegistry } from '../engines/registry/game-engine.registry';
import { validateGameOptions } from './game-rooms.config-validator';
import {
  validateRoomId,
  validateInviteCode,
  validatePassword,
  validateMaxPlayers,
  validateHost,
  validateKick,
  validateParticipantOrder,
} from './game-rooms.validation';
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
    private readonly engineRegistry: GameEngineRegistry,
  ) {}
  async createRoom(
    userId: string,
    dto: CreateGameRoomDto,
  ): Promise<GameRoomSummary> {
    const inviteCode = await this.generateInviteCode();

    validateGameOptions(this.engineRegistry, dto.gameId, dto.gameOptions);

    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS)
      : undefined;

    const room = await this.gameRoomModel.create({
      gameId: dto.gameId,
      name: dto.name,
      hostId: userId,
      visibility: dto.visibility,
      maxPlayers: dto.maxPlayers || null,
      inviteCode,
      password: hashedPassword,
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

  async listRooms(
    filters: ListRoomsFilters = {},
    viewerId?: string,
  ): Promise<ListRoomsResult> {
    const page = filters.page || 0;
    const limit = filters.limit || 10;
    const skip = page * limit;

    const query = GameRoomsQueryBuilder.buildListQuery(filters);

    const [rooms, total] = await Promise.all([
      this.gameRoomModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.gameRoomModel.countDocuments(query).exec(),
    ]);

    const summaries = await Promise.all(
      rooms.map((room) =>
        this.gameRoomsMapper.prepareRoomSummary(
          room as unknown as GameRoom,
          viewerId,
        ),
      ),
    );

    return {
      rooms: summaries,
      total,
      page,
      limit,
    };
  }

  // Bypasses canViewRoom so non-participants can discover a private room they
  // were invited to. Joining still validates the code in joinRoom.
  async findByInviteCode(
    code: string,
    viewerId?: string,
  ): Promise<GameRoomSummary> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) throw new NotFoundException('Room not found');
    const room = await this.gameRoomModel
      .findOne({ inviteCode: normalized })
      .lean()
      .exec();
    if (!room) throw new NotFoundException('Room not found');
    return this.gameRoomsMapper.prepareRoomSummary(
      room as unknown as import('../schemas/game-room.schema').GameRoom,
      viewerId,
    );
  }

  async getRoom(roomId: string, userId?: string): Promise<GameRoomSummary> {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new NotFoundException(`Invalid room ID format: ${roomId}`);
    }
    const room = await this.gameRoomModel
      .findById(roomId)
      .select('-password')
      .lean()
      .exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    if (!this.canViewRoom(room as unknown as GameRoom, userId)) {
      throw new ForbiddenException('Cannot view this room');
    }

    return this.gameRoomsMapper.prepareRoomSummary(
      room as unknown as GameRoom,
      userId,
    );
  }

  async joinRoom(
    dto: JoinGameRoomDto,
    userId: string,
  ): Promise<JoinGameRoomResult> {
    validateRoomId(dto.roomId);
    const room = await this.gameRoomModel
      .findById(new Types.ObjectId(dto.roomId))
      .select('+password')
      .exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${dto.roomId}`);
    }

    // Check if already a participant (allow rejoining even if game started)
    const isParticipant = room.participants.some((p) => p.userId === userId);

    if (isParticipant) {
      return {
        room: await this.gameRoomsMapper.prepareRoomSummary(room, userId),
        added: false,
      };
    }

    // New players can only join if game hasn't started yet
    if (room.status !== 'lobby') {
      throw new BadRequestException('Cannot join - game already started');
    }

    validateInviteCode(room, dto.inviteCode);
    await validatePassword(room, dto.password);
    validateMaxPlayers(room);

    // Add participant
    room.participants.push({
      userId,
      joinedAt: new Date(),
    });
    room.updatedAt = new Date();

    await room.save();

    return {
      room: await this.gameRoomsMapper.prepareRoomSummary(room, userId),
      added: true,
    };
  }

  async ensureParticipant(roomId: string, userId: string): Promise<boolean> {
    const room = await this.gameRoomModel.findById(roomId).exec();
    if (!room) throw new NotFoundException(`Room not found: ${roomId}`);
    const isParticipant = room.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      room.participants.push({ userId, joinedAt: new Date() });
      room.updatedAt = new Date();
      await room.save();
      return true;
    }
    return false;
  }

  async leaveRoom(
    dto: LeaveGameRoomDto,
    userId: string,
  ): Promise<LeaveGameRoomResult> {
    validateRoomId(dto.roomId);
    const room = await this.gameRoomModel
      .findById(new Types.ObjectId(dto.roomId))
      .exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${dto.roomId}`);
    }

    const isHost = room.hostId === userId;
    const isParticipant = room.participants.some((p) => p.userId === userId);

    if (!isHost && !isParticipant) {
      throw new BadRequestException('Not a member of this room');
    }

    validateKick(room, userId, dto.kickedBy);

    // If it's the last player, delete the room
    if (room.participants.length === 1) {
      await this.gameRoomModel
        .findByIdAndDelete(new Types.ObjectId(dto.roomId))
        .exec();
      return {
        room: null,
        deleted: true,
        removedPlayerId: userId,
        kicked: !!dto.kickedBy,
      };
    }

    // Remove participant
    room.participants = room.participants.filter((p) => p.userId !== userId);

    // If host left, assign new host (next player in list)
    if (isHost) {
      room.hostId = room.participants[0].userId;
    }

    room.updatedAt = new Date();
    await room.save();

    const summary = await this.gameRoomsMapper.prepareRoomSummary(room, userId);

    return {
      room: summary,
      deleted: false,
      removedPlayerId: userId,
      kicked: !!dto.kickedBy,
    };
  }

  async deleteRoom(
    dto: DeleteGameRoomDto,
    userId: string,
  ): Promise<DeleteGameRoomResult> {
    validateRoomId(dto.roomId);
    const room = await this.gameRoomModel
      .findById(new Types.ObjectId(dto.roomId))
      .lean()
      .exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${dto.roomId}`);
    }

    validateHost(room.hostId, userId);

    await this.gameRoomModel
      .findByIdAndDelete(new Types.ObjectId(dto.roomId))
      .exec();

    return {
      roomId: dto.roomId,
      deleted: true,
    };
  }

  async updateRoomStatus(
    roomId: string,
    status: GameRoomStatus,
  ): Promise<GameRoom> {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new NotFoundException(`Invalid room ID format: ${roomId}`);
    }
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    room.status = status;
    room.updatedAt = new Date();
    await room.save();

    return room;
  }

  async getRoomParticipants(roomId: string): Promise<string[]> {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new NotFoundException(`Invalid room ID format: ${roomId}`);
    }
    const room = await this.gameRoomModel.findById(roomId).lean().exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    return room.participants.map((p) => p.userId);
  }

  async updateRoomOptions(
    roomId: string,
    userId: string,
    options: Record<string, unknown>,
  ): Promise<GameRoomSummary> {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new NotFoundException(`Invalid room ID format: ${roomId}`);
    }
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    if (room.hostId !== userId) {
      throw new ForbiddenException('Only the host can update room options');
    }

    if (room.status !== 'lobby') {
      throw new BadRequestException(
        'Cannot update options after game has started',
      );
    }

    room.gameOptions = {
      ...room.gameOptions,
      ...options,
    };
    room.updatedAt = new Date();

    await room.save();

    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
  }

  async reorderParticipants(
    roomId: string,
    userId: string,
    newOrder: string[],
  ): Promise<GameRoomSummary> {
    const room = await this.gameRoomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${roomId}`);
    }

    validateHost(room.hostId, userId);
    validateParticipantOrder(room.participants, newOrder);

    // Create a map for quick access
    const participantMap = new Map(room.participants.map((p) => [p.userId, p]));

    // Reconstruct participants array in new order
    room.participants = newOrder.map((id) => participantMap.get(id)!);
    room.updatedAt = new Date();

    await room.save();

    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
  }

  private canViewRoom(room: GameRoom, userId?: string | null): boolean {
    if (room.visibility === 'public') return true;
    if (!userId) return false;
    return (
      room.hostId === userId ||
      room.participants.some((p) => p.userId === userId)
    );
  }
  async declineRematchInvitation(
    roomId: string,
    userId: string,
  ): Promise<GameRoomSummary> {
    return this.gameRoomsRematchService.declineRematchInvitation(
      roomId,
      userId,
    );
  }

  async blockRematchRoom(
    roomId: string,
    userId: string,
  ): Promise<GameRoomSummary> {
    return this.gameRoomsRematchService.blockRematchRoom(roomId, userId);
  }
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
