import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomsService } from './game-rooms.service';
import { GamesRealtimeService } from '../games.realtime.service';
import type { GameRoomSummary } from './game-rooms.types';

/**
 * One-tap entry into a game from SEO landing pages.
 * - createQuickplayRoom(): 1v1 lobby vs an AI bot (Play vs AI)
 * - findHumanMatch(): find an open public lobby for this game; if
 *   none exists, create one (Play vs Human).
 * Each path emits the appropriate realtime event so the rooms list
 * updates for other clients.
 */
@Injectable()
export class GameRoomsQuickplayService {
  constructor(
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    private readonly gameRoomsMapper: GameRoomsMapper,
    private readonly gameRoomsService: GameRoomsService,
    private readonly realtimeService: GamesRealtimeService,
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
    const summary = await this.gameRoomsMapper.prepareRoomSummary(room, userId);
    this.realtimeService.emitRoomCreated(summary);
    return summary;
  }

  async findHumanMatch(
    userId: string,
    gameId: string,
  ): Promise<GameRoomSummary> {
    // Oldest open public lobby with a free seat the user isn't in.
    const candidate = await this.gameRoomModel
      .findOne({
        gameId,
        visibility: 'public',
        status: 'lobby',
        'participants.userId': { $ne: userId },
        $expr: { $lt: [{ $size: '$participants' }, '$maxPlayers'] },
      })
      .sort({ createdAt: 1 })
      .exec();

    if (candidate) {
      const joined = await this.gameRoomsService.joinRoom(
        { roomId: String(candidate._id) },
        userId,
      );
      this.realtimeService.emitPlayerJoined(joined.room, userId);
      return joined.room;
    }

    const room = await this.gameRoomsService.createRoom(userId, {
      gameId,
      name: 'Open Match',
      visibility: 'public',
      maxPlayers: 2,
    });
    this.realtimeService.emitRoomCreated(room);
    return room;
  }
}
