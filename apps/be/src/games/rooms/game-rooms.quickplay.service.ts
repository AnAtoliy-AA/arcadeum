import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomsMapper } from './game-rooms.mapper';
import type { GameRoomSummary } from './game-rooms.types';

/**
 * Quickplay rooms: a 1v1 lobby pre-populated with the user as host
 * and a single AI bot opponent. Used by SEO landing pages so visitors
 * skip the room-config form and get into the lobby in one tap.
 */
@Injectable()
export class GameRoomsQuickplayService {
  constructor(
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    private readonly gameRoomsMapper: GameRoomsMapper,
  ) {}

  async createQuickplayRoom(
    userId: string,
    gameId: string,
  ): Promise<GameRoomSummary> {
    const botId = `bot-${randomBytes(5).toString('hex')}`;
    const now = new Date();
    const room = await this.gameRoomModel.create({
      gameId,
      name: 'Quick Match',
      hostId: userId,
      visibility: 'public',
      maxPlayers: 2,
      participants: [
        { userId, joinedAt: now },
        { userId: botId, joinedAt: now },
      ],
      status: 'lobby',
      gameOptions: {},
      createdAt: now,
      updatedAt: now,
    });

    return this.gameRoomsMapper.prepareRoomSummary(room, userId);
  }
}
