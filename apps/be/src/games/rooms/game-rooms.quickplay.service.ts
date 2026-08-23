import { randomBytes } from 'crypto';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import { GameRoomsMapper } from './game-rooms.mapper';
import { GameRoomsService } from './game-rooms.service';
import { GamesRealtimeService } from '../games.realtime.service';
import { GameEngineRegistry } from '../engines/registry/game-engine.registry';
import type { GameRoomSummary } from './game-rooms.types';
import { GAME_CATALOG } from '../../games/games.catalog';
import { OCI_CONNECTION } from '../../common/providers/mongo-connections.provider';

const VALID_GAME_IDS = new Set(GAME_CATALOG.map((g) => g.gameId));

function validateGameId(gameId: string): void {
  if (!VALID_GAME_IDS.has(gameId)) {
    throw new BadRequestException(`Invalid gameId: ${gameId}`);
  }
}

const MATCHMAKING_CANDIDATE_LIMIT = 20;
// Rooms younger than this are accepted without a socket-presence
// check — the host may still be in the middle of router-push'ing to
// the lobby URL when a second matchmaker hits the endpoint.
const PRESENCE_GRACE_MS = 30_000;

/**
 * One-tap entry into a game from SEO landing pages.
 * - createQuickplayRoom(): lobby vs AI bots (Play vs AI). Seats are
 *   filled with bots from the game engine's metadata, so a 4-player
 *   game like Hearts gets a full table of 3 opponents.
 * - findHumanMatch(): find an open public lobby for this game; if
 *   none exists, create one (Play vs Human).
 * Each path emits the appropriate realtime event so the rooms list
 * updates for other clients.
 */
@Injectable()
export class GameRoomsQuickplayService {
  private readonly logger = new Logger(GameRoomsQuickplayService.name);

  constructor(
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly gameRoomModel: Model<GameRoom>,
    private readonly gameRoomsMapper: GameRoomsMapper,
    private readonly gameRoomsService: GameRoomsService,
    private readonly realtimeService: GamesRealtimeService,
    private readonly engineRegistry: GameEngineRegistry,
  ) {}

  async createQuickplayRoom(
    userId: string,
    gameId: string,
    variant?: string,
    theme?: string,
  ): Promise<GameRoomSummary> {
    validateGameId(gameId);
    const { minPlayers, maxPlayers } = this.engineRegistry.getMetadata(gameId);
    // Fill every seat short of the host with a bot so "Play vs AI" is
    // instantly playable regardless of the game's player count.
    const botsToSeed = Math.max(1, minPlayers - 1);
    const botIds = Array.from(
      { length: botsToSeed },
      () => `bot-${randomBytes(5).toString('hex')}`,
    );
    const now = new Date();
    const effectiveTheme = theme || 'adventure';
    const gameOptions: Record<string, unknown> = {
      ...(variant ? { variant } : {}),
      theme: effectiveTheme,
    };
    const room = await this.gameRoomModel.create({
      gameId,
      name: 'Quick Match',
      hostId: userId,
      visibility: 'public',
      maxPlayers,
      participants: [
        { userId, joinedAt: now },
        ...botIds.map((botId) => ({ userId: botId, joinedAt: now })),
      ],
      status: 'lobby',
      gameOptions,
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
    variant?: string,
    theme?: string,
  ): Promise<GameRoomSummary> {
    if (typeof userId !== 'string') {
      throw new BadRequestException('Invalid userId');
    }
    validateGameId(gameId);
    if (typeof gameId !== 'string' || !VALID_GAME_IDS.has(gameId)) {
      throw new BadRequestException(`Invalid gameId: ${gameId}`);
    }
    // Tight pool: only matchmaking-created rooms ("Open Match"), and
    // only those that don't already contain an AI bot. Sorted
    // newest-first so a room just created by another matchmaker sits
    // at the top of the candidate list. The not-full check stays in
    // JS — $expr/$size + Mongoose schema casting silently dropped
    // rows in earlier attempts.
    const candidates = await this.gameRoomModel
      .find({
        gameId,
        name: 'Open Match',
        visibility: 'public',
        status: 'lobby',
        'participants.userId': { $ne: userId },
        participants: {
          $not: { $elemMatch: { userId: { $regex: '^bot-' } } },
        },
      })
      .sort({ createdAt: -1 })
      .limit(MATCHMAKING_CANDIDATE_LIMIT)
      .exec();

    // Walk newest-first, taking the first not-full room whose host is
    // still connected (or whose room is too young to have wired up
    // sockets yet). Skipping abandoned lobbies is what stops the
    // second matchmaker from joining a tab the first one already
    // closed.
    const now = Date.now();
    let picked: (typeof candidates)[number] | null = null;
    let pickedReason: 'fresh' | 'present' | null = null;
    const skipped: Array<{ id: string; reason: string }> = [];

    for (const c of candidates) {
      const notFull =
        typeof c.maxPlayers === 'number' &&
        c.participants.length < c.maxPlayers;
      if (!notFull) {
        skipped.push({ id: String(c._id), reason: 'full' });
        continue;
      }
      const age = now - new Date(c.createdAt).getTime();
      if (age < PRESENCE_GRACE_MS) {
        picked = c;
        pickedReason = 'fresh';
        break;
      }
      const hostPresent = await this.realtimeService.isUserPresentInRoom(
        String(c._id),
        c.hostId,
      );
      if (hostPresent) {
        picked = c;
        pickedReason = 'present';
        break;
      }
      skipped.push({ id: String(c._id), reason: 'host-absent' });
    }

    this.logger.log(
      `Matchmaking[${userId}] gameId=${gameId} scanned=${candidates.length} ` +
        `skipped=${JSON.stringify(skipped)} ` +
        `picked=${picked ? `${String(picked._id)}(${pickedReason})` : 'none'}`,
    );

    if (picked) {
      const joined = await this.gameRoomsService.joinRoom(
        { roomId: String(picked._id) },
        userId,
      );
      this.realtimeService.emitPlayerJoined(joined.room, userId);
      return joined.room;
    }

    const effectiveTheme = theme || 'adventure';
    const gameOptions: Record<string, unknown> = {
      ...(variant ? { variant } : {}),
      theme: effectiveTheme,
    };
    const { maxPlayers } = this.engineRegistry.getMetadata(gameId);
    const room = await this.gameRoomsService.createRoom(userId, {
      gameId,
      name: 'Open Match',
      visibility: 'public',
      maxPlayers,
      gameOptions,
    });
    this.realtimeService.emitRoomCreated(room);
    return room;
  }
}
