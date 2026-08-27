import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../../common/constants/bcrypt';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
  Optional,
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
import { GameRoomsChatService } from './game-rooms.chat.service';
import { sanitizeNotes } from '../utils/sanitize-notes';
import { generateUniqueInviteCode } from './game-rooms.invite-code';
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
} from './game-rooms.validation';
import {
  isRoomParticipant,
  addRoomParticipant,
  removeRoomParticipant,
  getRoomParticipantIds,
  reorderRoomParticipants,
} from './game-rooms.participants';
import {
  loadRoomEntity,
  mirrorRoomToAtlas,
  canViewRoom,
} from './game-rooms.helpers';
import {
  OCI_CONNECTION,
  ATLAS_CONNECTION,
} from '../../common/providers/mongo-connections.provider';
/**
 * Game Rooms Service
 * Handles all room-related operations (CRUD, joining, leaving)
 */
@Injectable()
export class GameRoomsService {
  private readonly logger = new Logger(GameRoomsService.name);

  constructor(
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly ociRoomModel: Model<GameRoom>,
    private readonly gameRoomsMapper: GameRoomsMapper,
    private readonly gameRoomsRematchService: GameRoomsRematchService,
    private readonly gameRoomsChatService: GameRoomsChatService,
    private readonly engineRegistry: GameEngineRegistry,
    @Optional()
    @InjectModel(GameRoom.name, ATLAS_CONNECTION)
    private readonly atlasRoomModel?: Model<GameRoom>,
    @Optional()
    @InjectModel(User.name, ATLAS_CONNECTION)
    private readonly userModel?: Model<User>,
  ) {}
  async createRoom(
    userId: string,
    dto: CreateGameRoomDto,
  ): Promise<GameRoomSummary> {
    const inviteCode = await generateUniqueInviteCode(this.ociRoomModel);

    validateGameOptions(this.engineRegistry, dto.gameId, dto.gameOptions);

    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS)
      : undefined;

    const room = await this.ociRoomModel.create({
      gameId: dto.gameId,
      name: dto.name,
      hostId: userId,
      visibility: dto.visibility,
      maxPlayers: dto.maxPlayers || null,
      notes: dto.notes ? sanitizeNotes(dto.notes) : undefined,
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

    // Mirror room to Atlas for history queries
    // toObject() returns the class-typed doc shape; widen via unknown to fit
    // the helper's plain-record patch parameter.
    await mirrorRoomToAtlas(
      this.atlasRoomModel,
      this.logger,
      room._id.toString(),
      room.toObject() as unknown as Record<string, unknown>,
      true,
    );

    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
  }

  async countHostRooms(userId: string): Promise<number> {
    return this.ociRoomModel.countDocuments({ hostId: userId }).exec();
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
      this.ociRoomModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.ociRoomModel.countDocuments(query).exec(),
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
    if (typeof code !== 'string') {
      throw new NotFoundException('Invalid invite code');
    }
    const normalized = code.trim().toUpperCase();
    if (!normalized) throw new NotFoundException('Room not found');
    const room = await this.ociRoomModel
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
    const room = await loadRoomEntity(this.ociRoomModel, roomId, {
      lean: true,
      select: '-password',
    });
    if (!canViewRoom(room, userId)) {
      throw new ForbiddenException('Cannot view this room');
    }
    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
  }

  async joinRoom(
    dto: JoinGameRoomDto,
    userId: string,
  ): Promise<JoinGameRoomResult> {
    validateRoomId(dto.roomId);
    const room = await this.ociRoomModel
      .findById(new Types.ObjectId(dto.roomId))
      .select('+password')
      .exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${dto.roomId}`);
    }

    // Check if already a participant (allow rejoining even if game started)
    const isParticipant = isRoomParticipant(room.participants, userId);

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
    addRoomParticipant(room, userId);
    room.updatedAt = new Date();

    await room.save();

    return {
      room: await this.gameRoomsMapper.prepareRoomSummary(room, userId),
      added: true,
    };
  }

  async ensureParticipant(roomId: string, userId: string): Promise<boolean> {
    if (typeof roomId !== 'string' || typeof userId !== 'string') {
      throw new BadRequestException('Invalid roomId or userId');
    }
    const room = await loadRoomEntity(this.ociRoomModel, roomId);
    if (addRoomParticipant(room, userId)) {
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
    if (typeof userId !== 'string') {
      throw new BadRequestException('Invalid userId');
    }
    validateRoomId(dto.roomId);
    const room = await this.ociRoomModel
      .findById(new Types.ObjectId(dto.roomId))
      .exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${dto.roomId}`);
    }

    const isHost = room.hostId === userId;
    const isParticipant = isRoomParticipant(room.participants, userId);

    if (!isHost && !isParticipant) {
      throw new BadRequestException('Not a member of this room');
    }

    validateKick(room, userId, dto.kickedBy);

    // If it's the last player, delete the room
    if (room.participants.length === 1) {
      await this.ociRoomModel
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
    removeRoomParticipant(room, userId);

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
    const room = await this.ociRoomModel
      .findById(new Types.ObjectId(dto.roomId))
      .lean()
      .exec();

    if (!room) {
      throw new NotFoundException(`Room not found: ${dto.roomId}`);
    }

    validateHost(room.hostId, userId);

    await this.ociRoomModel
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
    const room = await loadRoomEntity(this.ociRoomModel, roomId);

    room.status = status;
    room.updatedAt = new Date();
    await room.save();

    await mirrorRoomToAtlas(this.atlasRoomModel, this.logger, roomId, {
      status,
      updatedAt: room.updatedAt,
    });

    return room;
  }

  async getRoomParticipants(roomId: string): Promise<string[]> {
    const room = await loadRoomEntity(this.ociRoomModel, roomId, {
      lean: true,
    });
    return getRoomParticipantIds(room);
  }

  async getRoomRaw(roomId: string): Promise<GameRoom | null> {
    return this.ociRoomModel
      .findById(roomId)
      .lean()
      .exec() as Promise<GameRoom | null>;
  }

  async updateRoomOptions(
    roomId: string,
    userId: string,
    options: Record<string, unknown>,
  ): Promise<GameRoomSummary> {
    if (typeof roomId !== 'string' || typeof userId !== 'string')
      throw new BadRequestException('Invalid roomId or userId');
    const room = await loadRoomEntity(this.ociRoomModel, roomId);
    if (room.hostId !== userId)
      throw new ForbiddenException('Only the host can update room options');
    if (room.status !== 'lobby')
      throw new BadRequestException(
        'Cannot update options after game has started',
      );
    room.gameOptions = { ...room.gameOptions, ...options };
    room.updatedAt = new Date();
    await room.save();
    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
  }

  async reorderParticipants(
    roomId: string,
    userId: string,
    newOrder: string[],
  ): Promise<GameRoomSummary> {
    if (typeof roomId !== 'string' || typeof userId !== 'string')
      throw new BadRequestException('Invalid roomId or userId');
    const room = await loadRoomEntity(this.ociRoomModel, roomId);
    reorderRoomParticipants(room, userId, newOrder);
    room.updatedAt = new Date();
    await room.save();
    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
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

  async postRoomChat(
    roomId: string,
    userId: string,
    senderName: string,
    message: string,
    scope: string,
  ) {
    return this.gameRoomsChatService.postRoomChat(
      roomId,
      userId,
      senderName,
      message,
      scope,
    );
  }

  async deleteRoomChatMessage(
    roomId: string,
    callerId: string,
    messageId: string,
  ) {
    return this.gameRoomsChatService.deleteRoomChatMessage(
      roomId,
      callerId,
      messageId,
    );
  }
}
