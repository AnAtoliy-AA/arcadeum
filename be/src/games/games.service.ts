import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { GameRoom, type GameRoomStatus } from './schemas/game-room.schema';

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
}

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
  ) {}

  async createRoom(
    hostId: string,
    dto: CreateGameRoomDto,
  ): Promise<GameRoomSummary> {
    const trimmedHostId = hostId.trim();
    if (!trimmedHostId) {
      throw new BadRequestException('Host identifier is required.');
    }

    const trimmedGameId = dto.gameId.trim();
    if (!trimmedGameId) {
      throw new BadRequestException('Game ID is required.');
    }

    const trimmedName = dto.name.trim();
    if (!trimmedName) {
      throw new BadRequestException('Room name is required.');
    }

    if (
      typeof dto.maxPlayers === 'number' &&
      Number.isFinite(dto.maxPlayers) &&
      dto.maxPlayers < 2
    ) {
      throw new BadRequestException('Max players must be at least 2.');
    }

    const visibility: GameRoom['visibility'] = dto.visibility ?? 'public';
    const inviteCode = await this.generateInviteCode();

    const room = new this.gameRoomModel({
      gameId: trimmedGameId,
      name: trimmedName,
      hostId: trimmedHostId,
      visibility,
      maxPlayers:
        typeof dto.maxPlayers === 'number'
          ? Math.floor(dto.maxPlayers)
          : undefined,
      notes: dto.notes?.trim() || undefined,
      status: 'lobby',
      inviteCode,
      playerIds: [trimmedHostId],
    });

    const saved = await room.save();
    return this.toSummary(saved);
  }

  async listRooms(userId: string, gameId?: string): Promise<GameRoomSummary[]> {
    const query: FilterQuery<GameRoom> = {};
    if (gameId) {
      query.gameId = gameId;
    }

    const rooms = await this.gameRoomModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    const normalizedUserId = userId.trim();

    return rooms
      .filter((room) => {
        if (room.visibility === 'public') {
          return true;
        }
        const members = Array.isArray(room.playerIds) ? room.playerIds : [];
        return (
          room.hostId === normalizedUserId || members.includes(normalizedUserId)
        );
      })
      .map((room) => this.toSummary(room));
  }

  async joinRoom(
    userId: string,
    dto: JoinGameRoomDto,
  ): Promise<GameRoomSummary> {
    if (!dto.roomId && !dto.inviteCode) {
      throw new BadRequestException('Provide either roomId or inviteCode.');
    }

    const filters: FilterQuery<GameRoom>[] = [];
    if (dto.roomId) {
      filters.push({ _id: dto.roomId.trim() });
    }
    if (dto.inviteCode) {
      filters.push({ inviteCode: dto.inviteCode.trim().toUpperCase() });
    }

    let room: GameRoom | null = null;
    if (filters.length === 1) {
      room = await this.gameRoomModel.findOne(filters[0]).exec();
    } else if (filters.length > 1) {
      room = await this.gameRoomModel.findOne({ $or: filters }).exec();
    }

    if (!room) {
      throw new NotFoundException('Game room not found.');
    }

    const normalizedUserId = userId.trim();
    const members = Array.isArray(room.playerIds) ? room.playerIds : [];
    const alreadyJoined = members.includes(normalizedUserId);

    if (room.visibility === 'private' && room.hostId !== normalizedUserId) {
      if (
        !dto.inviteCode ||
        dto.inviteCode.trim().toUpperCase() !== room.inviteCode
      ) {
        throw new ForbiddenException('Invite code required to join this room.');
      }
    }

    if (!alreadyJoined) {
      if (room.status !== 'lobby') {
        throw new BadRequestException('Room is no longer accepting players.');
      }
      if (typeof room.maxPlayers === 'number' && room.maxPlayers > 0) {
        const nextCount = members.length + 1;
        if (nextCount > room.maxPlayers) {
          throw new BadRequestException('Room is full.');
        }
      }

      room.playerIds = [...members, normalizedUserId];
      await room.save();
    }

    return this.toSummary(room);
  }

  private toSummary(room: GameRoom): GameRoomSummary {
    const createdAt =
      room.createdAt instanceof Date
        ? room.createdAt.toISOString()
        : new Date(room.createdAt ?? Date.now()).toISOString();

    const members = Array.isArray(room.playerIds) ? room.playerIds : [];

    return {
      id: room._id?.toString?.() ?? String(room._id),
      gameId: room.gameId,
      name: room.name,
      hostId: room.hostId,
      visibility: room.visibility,
      playerCount: members.length,
      maxPlayers:
        typeof room.maxPlayers === 'number' && room.maxPlayers > 0
          ? room.maxPlayers
          : members.length || 0,
      createdAt,
      status: room.status ?? 'lobby',
      inviteCode: room.inviteCode,
    };
  }

  private async generateInviteCode(): Promise<string> {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    // Attempt a few times to avoid collisions
    for (let attempt = 0; attempt < 5; attempt += 1) {
      let code = '';
      for (let i = 0; i < 6; i += 1) {
        const index = Math.floor(Math.random() * alphabet.length);
        code += alphabet[index];
      }

      const existing = await this.gameRoomModel
        .exists({ inviteCode: code })
        .exec();
      if (!existing) {
        return code;
      }
    }

    // Fallback to timestamp-based code to guarantee uniqueness
    return `ROOM-${Date.now().toString(36).toUpperCase()}`;
  }
}
