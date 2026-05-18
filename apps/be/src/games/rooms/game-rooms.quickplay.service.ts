import { randomBytes } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomsService } from './game-rooms.service';
import { GamesRealtimeService } from '../games.realtime.service';
import type { GameRoomSummary } from './game-rooms.types';

const MATCHMAKING_CANDIDATE_LIMIT = 20;

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
  private readonly logger = new Logger(GameRoomsQuickplayService.name);

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
    // Oldest open public lobby the user isn't already in AND that has
    // no AI bot. Excluding rooms with bot participants is what keeps
    // matchmaking from "matching" the second human into an already-
    // running 1v1-vs-AI room. The "not full" check stays in JS to
    // sidestep $expr/$size casting edge cases with Mongoose.
    const candidates = await this.gameRoomModel
      .find({
        gameId,
        visibility: 'public',
        status: 'lobby',
        $and: [
          { 'participants.userId': { $ne: userId } },
          { 'participants.userId': { $not: /^bot-/ } },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(MATCHMAKING_CANDIDATE_LIMIT)
      .exec();

    const candidate = candidates.find(
      (r) =>
        typeof r.maxPlayers === 'number' &&
        r.participants.length < r.maxPlayers,
    );

    if (candidate) {
      this.logger.log(
        `Matchmaking: ${userId} joining room ${String(candidate._id)} (${candidates.length} candidates scanned)`,
      );
      const joined = await this.gameRoomsService.joinRoom(
        { roomId: String(candidate._id) },
        userId,
      );
      this.realtimeService.emitPlayerJoined(joined.room, userId);
      return joined.room;
    }

    this.logger.log(
      `Matchmaking: no open room for ${gameId} (${candidates.length} scanned), creating new for ${userId}`,
    );
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
