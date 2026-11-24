import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import type { GameRoomSummary } from './game-rooms.types';
import { GameRoomsMapper } from './game-rooms.mapper';
import { validateRoomId, validateHost } from './game-rooms.validation';
import { loadRoomEntity } from './game-rooms.helpers';
import { GameEngineRegistry } from '../engines/registry/game-engine.registry';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';

@Injectable()
export class GameRoomsBotService {
  constructor(
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly ociRoomModel: Model<GameRoom>,
    private readonly mapper: GameRoomsMapper,
    private readonly engineRegistry: GameEngineRegistry,
  ) {}

  /**
   * Seat cap for a room: the room's own limit, or the engine's maximum when
   * the room was created with "auto" players (maxPlayers = null).
   */
  private resolveSeatCap(room: { gameId: string; maxPlayers?: number | null }) {
    if (room.maxPlayers) return room.maxPlayers;
    try {
      return this.engineRegistry.getMetadata(room.gameId).maxPlayers;
    } catch {
      return null;
    }
  }

  async addBotToRoom(roomId: string, hostId: string): Promise<GameRoomSummary> {
    validateRoomId(roomId);
    const room = await loadRoomEntity(this.ociRoomModel, roomId);
    validateHost(room.hostId, hostId);
    if (room.status !== 'lobby')
      throw new BadRequestException('Cannot add bots after game started');
    const cap = this.resolveSeatCap(room);
    if (cap && room.participants.length >= cap)
      throw new BadRequestException('Room is full');
    const botId = `bot-${randomBytes(5).toString('hex')}`;
    room.participants.push({ userId: botId, joinedAt: new Date() });
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }

  async removeBotFromRoom(
    roomId: string,
    hostId: string,
    botId: string,
  ): Promise<GameRoomSummary> {
    validateRoomId(roomId);
    if (!botId || !botId.startsWith('bot-'))
      throw new BadRequestException('Invalid bot ID');
    const room = await loadRoomEntity(this.ociRoomModel, roomId);
    validateHost(room.hostId, hostId);
    if (room.status !== 'lobby')
      throw new BadRequestException('Cannot remove bots after game started');
    const idx = room.participants.findIndex((p) => p.userId === botId);
    if (idx === -1) throw new NotFoundException('Bot not found in room');
    room.participants.splice(idx, 1);
    room.updatedAt = new Date();
    await room.save();
    return this.mapper.prepareRoomSummary(room, hostId);
  }
}
