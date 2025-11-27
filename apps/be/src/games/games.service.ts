import { randomUUID } from 'crypto';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateGameRoomDto } from './dtos/create-game-room.dto';
import { JoinGameRoomDto } from './dtos/join-game-room.dto';
import { GameRoom, type GameRoomStatus } from './schemas/game-room.schema';
import {
  GameSession,
  type GameSessionStatus,
} from './schemas/game-session.schema';
import { GameHistoryHidden } from './schemas/game-history-hidden.schema';
import {
  createInitialExplodingCatsState,
  type ExplodingCatsCard,
  type ExplodingCatsCatCard,
  type ExplodingCatsLogEntry as ExplodingCatsEngineLogEntry,
  type ExplodingCatsLogVisibility,
  type ExplodingCatsPlayerState,
  type ExplodingCatsState,
} from './exploding-cats/exploding-cats.state';
import { GamesRealtimeService } from './games.realtime.service';
import { User } from '../auth/schemas/user.schema';

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
  host?: GameRoomMemberSummary;
  members?: GameRoomMemberSummary[];
  viewerRole?: 'host' | 'participant' | 'none';
  viewerHasJoined?: boolean;
  viewerIsHost?: boolean;
}

export interface GameSessionSummary {
  id: string;
  roomId: string;
  gameId: string;
  engine: string;
  status: GameSessionStatus;
  state: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface StartExplodingCatsSessionResult {
  room: GameRoomSummary;
  session: GameSessionSummary;
}

export interface LeaveGameRoomResult {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  deleted: boolean;
  removedPlayerId: string;
}

export interface DeleteGameRoomResult {
  roomId: string;
  deleted: boolean;
}

export interface HistoryParticipantSummary {
  id: string;
  username: string;
  email: string | null;
  isHost: boolean;
}

export type GameHistoryStatus = GameRoomStatus | GameSessionStatus;

export interface GameHistorySummary {
  roomId: string;
  sessionId: string | null;
  gameId: string;
  roomName: string;
  status: GameHistoryStatus;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string;
  host: HistoryParticipantSummary;
  participants: HistoryParticipantSummary[];
  roundCount: number;
  rounds: GameHistoryRoundSummary[];
  winnerStats: GameHistoryWinnerSummary[];
}

export interface GameHistoryLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: ExplodingCatsLogVisibility;
  sender?: HistoryParticipantSummary;
  roundNumber: number;
  roundRoomId: string;
}

export interface GameHistoryDetail {
  summary: GameHistorySummary;
  logs: GameHistoryLogEntry[];
}

export interface GameHistoryRoundSummary {
  roundNumber: number;
  roomId: string;
  sessionId: string | null;
  status: GameHistoryStatus;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string;
  winnerUserIds: string[];
}

export interface GameHistoryWinnerSummary {
  userId: string;
  wins: number;
}

export const GAME_ROOM_PARTICIPATION_FILTERS = [
  'all',
  'hosting',
  'joined',
  'not_joined',
] as const;

export type GameRoomParticipationFilter =
  (typeof GAME_ROOM_PARTICIPATION_FILTERS)[number];

type ListRoomsFilters = {
  userId?: string | null;
  gameId?: string;
  statuses?: GameRoomStatus[];
  visibility?: GameRoom['visibility'][];
  participation?: GameRoomParticipationFilter;
};

type RoomUserProfile = {
  username?: string;
  email?: string | null;
  displayName?: string | null;
};

const EXPLODING_CATS_GAME_ID = 'exploding-kittens';
const EXPLODING_CATS_ENGINE_ID = 'exploding_cats_v1';
const EXPLODING_CATS_ACTION_CARDS = [
  'skip',
  'attack',
  'favor',
  'shuffle',
  'see_the_future',
] as const;
type ExplodingCatsActionCard = (typeof EXPLODING_CATS_ACTION_CARDS)[number];
const EXPLODING_CATS_CAT_CARDS = [
  'tacocat',
  'hairy_potato_cat',
  'rainbow_ralphing_cat',
  'cattermelon',
  'bearded_cat',
] as const satisfies ReadonlyArray<ExplodingCatsCatCard>;

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSession>,
    @InjectModel(GameHistoryHidden.name)
    private readonly historyHiddenModel: Model<GameHistoryHidden>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly realtime: GamesRealtimeService,
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
      historyHiddenForAll: false,
      parentRoomId: null,
    });

    const newRoomId = room._id?.toString?.();
    if (newRoomId) {
      room.rootRoomId = newRoomId;
    }

    const saved = await room.save();
    const summary = await this.prepareRoomSummary(saved);
    return this.applyViewerContext(summary, saved, trimmedHostId);
  }

  async listRooms(params: ListRoomsFilters = {}): Promise<GameRoomSummary[]> {
    const { userId, gameId, statuses, visibility, participation } = params;

    const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';

    const query: FilterQuery<GameRoom> = {};
    if (gameId?.trim()) {
      query.gameId = gameId.trim();
    }

    const rooms = await this.gameRoomModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();

    const filtered = rooms.filter((room) => {
      if (!this.canViewRoom(room, normalizedUserId || undefined)) {
        return false;
      }

      if (Array.isArray(statuses) && statuses.length > 0) {
        if (!statuses.includes(room.status ?? 'lobby')) {
          return false;
        }
      }

      if (Array.isArray(visibility) && visibility.length > 0) {
        if (!visibility.includes(room.visibility)) {
          return false;
        }
      }

      const participationFilter = participation ?? 'all';
      return this.matchesParticipationFilter(
        room,
        normalizedUserId || null,
        participationFilter,
      );
    });

    const userLookup = await this.buildUserLookupForRooms(filtered);

    return filtered.map((room) => {
      const baseSummary = this.toSummary(room, userLookup);
      return this.applyViewerContext(
        baseSummary,
        room,
        normalizedUserId || undefined,
      );
    });
  }

  async getRoom(roomId: string, userId?: string): Promise<GameRoomSummary> {
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const room = await this.gameRoomModel.findById(normalizedRoomId).exec();
    if (!room) {
      throw new NotFoundException('Game room not found.');
    }

    if (!this.canViewRoom(room, userId)) {
      throw new ForbiddenException('Access to this room is not permitted.');
    }

    const summary = await this.prepareRoomSummary(room);
    return this.applyViewerContext(summary, room, userId);
  }

  async getRoomSession(
    roomId: string,
    userId?: string,
  ): Promise<GameSessionSummary | null> {
    const summary = await this.getRoom(roomId, userId);
    return this.findSessionByRoom(summary.id);
  }

  private canViewRoom(room: GameRoom, userId?: string | null): boolean {
    if (room.visibility === 'public') {
      return true;
    }

    const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
    if (!normalizedUserId) {
      return false;
    }

    const members = Array.isArray(room.playerIds)
      ? room.playerIds
          .map((value) =>
            typeof value === 'string' ? value.trim() : String(value ?? ''),
          )
          .filter((value) => value.length > 0)
      : [];

    const hostId = typeof room.hostId === 'string' ? room.hostId.trim() : '';

    if (hostId && hostId === normalizedUserId) {
      return true;
    }

    return members.includes(normalizedUserId);
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
      const savedRoom = await room.save();
      const summary = await this.prepareRoomSummary(savedRoom);
      this.realtime.emitRoomUpdate(summary);
      return this.applyViewerContext(summary, savedRoom, normalizedUserId);
    }

    const summary = await this.prepareRoomSummary(room);
    return this.applyViewerContext(summary, room, normalizedUserId);
  }

  async ensureParticipant(
    roomId: string,
    userId: string,
  ): Promise<GameRoomSummary> {
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const room = await this.gameRoomModel.findById(normalizedRoomId).exec();
    if (!room) {
      throw new NotFoundException('Game room not found.');
    }

    const members = Array.isArray(room.playerIds)
      ? room.playerIds.map((id) => id.trim())
      : [];
    const host = (room.hostId ?? '').trim();

    if (host !== normalizedUserId && !members.includes(normalizedUserId)) {
      throw new ForbiddenException('Access to this room is not permitted.');
    }

    const summary = await this.prepareRoomSummary(room);
    return this.applyViewerContext(summary, room, normalizedUserId);
  }

  async findSessionByRoom(roomId: string): Promise<GameSessionSummary | null> {
    const trimmedRoomId = roomId.trim();
    if (!trimmedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const session = await this.gameSessionModel
      .findOne({ roomId: trimmedRoomId })
      .exec();

    if (!session) {
      return null;
    }

    return this.enrichSessionSummary(this.toSessionSummary(session));
  }

  async createSession(options: {
    roomId: string;
    gameId: string;
    engine: string;
    status?: GameSessionStatus;
    state: Record<string, any>;
  }): Promise<GameSessionSummary> {
    const roomId = options.roomId?.trim?.();
    const gameId = options.gameId?.trim?.();
    const engine = options.engine?.trim?.();

    if (!roomId) {
      throw new BadRequestException('Room ID is required.');
    }
    if (!gameId) {
      throw new BadRequestException('Game ID is required.');
    }
    if (!engine) {
      throw new BadRequestException('Engine identifier is required.');
    }

    const existing = await this.gameSessionModel.findOne({ roomId }).exec();
    if (existing) {
      throw new BadRequestException(
        'An active session already exists for this room.',
      );
    }

    const session = new this.gameSessionModel({
      roomId,
      gameId,
      engine,
      status: options.status ?? 'waiting',
      state: options.state,
    });

    const saved = await session.save();
    return this.enrichSessionSummary(this.toSessionSummary(saved));
  }

  async upsertSessionState(options: {
    roomId: string;
    state?: Record<string, any>;
    status?: GameSessionStatus;
  }): Promise<GameSessionSummary> {
    const roomId = options.roomId?.trim?.();
    if (!roomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const update: Partial<GameSession> = {};
    if (options.state !== undefined) {
      update.state = options.state;
    }
    if (options.status !== undefined) {
      update.status = options.status;
    }

    const updated = await this.gameSessionModel
      .findOneAndUpdate({ roomId }, update, {
        new: true,
        upsert: false,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException('Game session not found for room.');
    }

    const baseSummary = this.toSessionSummary(updated);
    const summary = await this.enrichSessionSummary(baseSummary);
    this.realtime.emitSessionSnapshot(roomId, summary);
    return summary;
  }

  async startExplodingCatsSession(
    hostId: string,
    roomId: string,
    engineOverride?: string,
  ): Promise<StartExplodingCatsSessionResult> {
    const normalizedHostId = hostId.trim();
    if (!normalizedHostId) {
      throw new BadRequestException('Host identifier is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const room = await this.gameRoomModel.findById(normalizedRoomId).exec();
    if (!room) {
      throw new NotFoundException('Game room not found.');
    }

    if ((room.hostId ?? '').trim() !== normalizedHostId) {
      throw new ForbiddenException('Only the host can start this game.');
    }

    if (room.status !== 'lobby') {
      throw new BadRequestException(
        'This room is no longer in the lobby phase.',
      );
    }

    if (room.gameId !== EXPLODING_CATS_GAME_ID) {
      throw new BadRequestException(
        'Exploding Cats is not enabled for this room.',
      );
    }

    const uniquePlayerIds = Array.from(
      new Set(
        (Array.isArray(room.playerIds) ? room.playerIds : [])
          .map((playerId) => playerId.trim())
          .filter((value) => value.length > 0),
      ),
    );

    if (!uniquePlayerIds.includes(normalizedHostId)) {
      uniquePlayerIds.unshift(normalizedHostId);
    }

    if (uniquePlayerIds.length < 2) {
      throw new BadRequestException(
        'At least two players are required to start.',
      );
    }

    let explodingCatsState: ExplodingCatsState;
    try {
      explodingCatsState = createInitialExplodingCatsState(uniquePlayerIds);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to start game.';
      throw new BadRequestException(message);
    }

    const engineId = engineOverride?.trim?.() || EXPLODING_CATS_ENGINE_ID;

    const session = await this.createSession({
      roomId: normalizedRoomId,
      gameId: room.gameId,
      engine: engineId,
      status: 'active',
      state: {
        engine: 'exploding-cats',
        version: 1,
        snapshot: explodingCatsState,
        lastUpdatedAt: new Date().toISOString(),
      },
    });

    room.playerIds = uniquePlayerIds;
    room.status = 'in_progress';
    const updatedRoom = await room.save();
    const summary = await this.prepareRoomSummary(updatedRoom);

    this.realtime.emitRoomUpdate(summary);
    this.realtime.emitSessionSnapshot(normalizedRoomId, session);

    return {
      room: this.applyViewerContext(summary, updatedRoom, normalizedHostId),
      session,
    };
  }

  async drawExplodingCatsCard(
    userId: string,
    roomId: string,
  ): Promise<GameSessionSummary> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const room = await this.ensureParticipant(
      normalizedRoomId,
      normalizedUserId,
    );
    if (room.status !== 'in_progress') {
      throw new BadRequestException('The game has not started for this room.');
    }

    const sessionDoc = await this.gameSessionModel
      .findOne({ roomId: normalizedRoomId })
      .exec();
    if (!sessionDoc) {
      throw new NotFoundException('Game session not found for this room.');
    }

    if (sessionDoc.engine !== EXPLODING_CATS_ENGINE_ID) {
      throw new BadRequestException(
        'Draw action is only supported for Exploding Cats sessions.',
      );
    }

    const state = sessionDoc.state ?? {};
    const snapshotRaw = state.snapshot as ExplodingCatsState | undefined;
    if (!snapshotRaw) {
      throw new NotFoundException('Exploding Cats snapshot is unavailable.');
    }

    const snapshot = this.cloneExplodingCatsState(snapshotRaw);
    const player = this.findExplodingCatsPlayer(snapshot, normalizedUserId);

    if (!player) {
      throw new ForbiddenException('Player is not part of this session.');
    }

    if (!player.alive) {
      throw new ForbiddenException('Player has already been eliminated.');
    }

    if (!snapshot.playerOrder.length) {
      throw new BadRequestException(
        'There are no active players in this session.',
      );
    }

    const currentPlayerId =
      snapshot.playerOrder[snapshot.currentTurnIndex] ?? '';
    if (currentPlayerId !== normalizedUserId) {
      throw new ForbiddenException('It is not your turn to draw.');
    }

    if (snapshot.pendingDraws < 1) {
      snapshot.pendingDraws = 1;
    }

    const { card, deckRefilled } = this.drawExplodingCatsCardFromDeck(snapshot);
    const nowIso = new Date().toISOString();

    const logEntries: ExplodingCatsState['logs'] = [
      {
        id: randomUUID(),
        type: 'action',
        message:
          card === 'exploding_cat'
            ? `${normalizedUserId} drew an Exploding Cat!`
            : `${normalizedUserId} drew a card.`,
        createdAt: nowIso,
        scope: 'all',
      },
    ];

    if (deckRefilled) {
      logEntries.push({
        id: randomUUID(),
        type: 'system',
        message: 'Deck was reshuffled from the discard pile.',
        createdAt: nowIso,
        scope: 'all',
      });
    }

    let sessionStatus: GameSessionStatus | undefined;
    let playerEliminated = false;

    if (card === 'exploding_cat') {
      const defuseIndex = player.hand.findIndex((item) => item === 'defuse');

      if (defuseIndex >= 0) {
        player.hand.splice(defuseIndex, 1);
        const insertIndex = Math.floor(
          Math.random() * (snapshot.deck.length + 1),
        );
        snapshot.deck.splice(insertIndex, 0, 'exploding_cat');

        logEntries.push({
          id: randomUUID(),
          type: 'action',
          message: `${normalizedUserId} used a Defuse card.`,
          createdAt: nowIso,
          scope: 'all',
        });
      } else {
        player.alive = false;
        player.hand = [];
        snapshot.discardPile.push('exploding_cat');
        snapshot.playerOrder = snapshot.playerOrder.filter(
          (id) => id !== normalizedUserId,
        );
        playerEliminated = true;

        logEntries.push({
          id: randomUUID(),
          type: 'system',
          message: `${normalizedUserId} exploded and has been eliminated.`,
          createdAt: nowIso,
          scope: 'all',
        });

        if (snapshot.playerOrder.length <= 1) {
          sessionStatus = 'completed';
          if (snapshot.playerOrder.length === 1) {
            const winnerId = snapshot.playerOrder[0];
            logEntries.push({
              id: randomUUID(),
              type: 'system',
              message: `${winnerId} wins the game!`,
              createdAt: nowIso,
              scope: 'all',
            });
          }
        }
      }
    } else {
      player.hand.push(card);
    }

    snapshot.logs.push(...logEntries);

    if (sessionStatus !== 'completed') {
      if (snapshot.pendingDraws > 1 && !playerEliminated) {
        snapshot.pendingDraws -= 1;
      } else {
        snapshot.pendingDraws = 1;

        if (playerEliminated && snapshot.playerOrder.length > 0) {
          if (snapshot.currentTurnIndex >= snapshot.playerOrder.length) {
            snapshot.currentTurnIndex = snapshot.playerOrder.length - 1;
          } else {
            snapshot.currentTurnIndex =
              (snapshot.currentTurnIndex - 1 + snapshot.playerOrder.length) %
              snapshot.playerOrder.length;
          }
        }

        this.advanceExplodingCatsTurn(snapshot);
      }
    }

    const nextState = {
      ...state,
      snapshot,
      lastUpdatedAt: nowIso,
    };

    const summary = await this.upsertSessionState({
      roomId: normalizedRoomId,
      state: nextState,
      status: sessionStatus,
    });

    if (sessionStatus === 'completed') {
      const roomDoc = await this.gameRoomModel
        .findById(normalizedRoomId)
        .exec();
      if (roomDoc && roomDoc.status !== 'completed') {
        roomDoc.status = 'completed';
        const savedRoom = await roomDoc.save();
        this.realtime.emitRoomUpdate(this.toSummary(savedRoom));
      }
    }

    return summary;
  }

  private cloneExplodingCatsState(
    state: ExplodingCatsState,
  ): ExplodingCatsState {
    return JSON.parse(JSON.stringify(state)) as ExplodingCatsState;
  }

  async leaveRoom(
    userId: string,
    roomId: string,
  ): Promise<LeaveGameRoomResult> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const room = await this.gameRoomModel.findById(normalizedRoomId).exec();
    if (!room) {
      throw new NotFoundException('Game room not found.');
    }

    const members = Array.isArray(room.playerIds)
      ? room.playerIds.map((id) => id.trim())
      : [];

    if (!members.includes(normalizedUserId)) {
      throw new ForbiddenException('You are not a participant of this room.');
    }

    const remainingIds = members.filter((id) => id !== normalizedUserId);

    const sessionDoc = await this.gameSessionModel
      .findOne({ roomId: normalizedRoomId })
      .exec();

    let sessionSummary: GameSessionSummary | null = null;

    const handleExplodingCatsDeparture = async () => {
      if (!sessionDoc || sessionDoc.engine !== EXPLODING_CATS_ENGINE_ID) {
        return;
      }

      const state = sessionDoc.state ?? {};
      const snapshotRaw = state.snapshot as ExplodingCatsState | undefined;
      if (!snapshotRaw) {
        return;
      }

      const snapshot = this.cloneExplodingCatsState(snapshotRaw);
      const removalIndex = snapshot.playerOrder.findIndex(
        (id) => id === normalizedUserId,
      );

      snapshot.playerOrder = snapshot.playerOrder.filter(
        (id) => id !== normalizedUserId,
      );
      snapshot.players = snapshot.players.filter(
        (player) => player.playerId !== normalizedUserId,
      );

      if (removalIndex >= 0) {
        if (snapshot.currentTurnIndex > removalIndex) {
          snapshot.currentTurnIndex -= 1;
        } else if (snapshot.currentTurnIndex === removalIndex) {
          if (snapshot.currentTurnIndex >= snapshot.playerOrder.length) {
            snapshot.currentTurnIndex = snapshot.playerOrder.length - 1;
          }
          if (snapshot.currentTurnIndex < 0) {
            snapshot.currentTurnIndex = 0;
          }
        }
      }

      if (snapshot.currentTurnIndex < 0) {
        snapshot.currentTurnIndex = 0;
      }

      const nowIso = new Date().toISOString();
      snapshot.logs.push({
        id: randomUUID(),
        type: 'system',
        message: `${normalizedUserId} left the game.`,
        createdAt: nowIso,
        scope: 'all',
      });

      let sessionStatus: GameSessionStatus | undefined;
      if (
        snapshot.playerOrder.length <= 1 &&
        sessionDoc.status !== 'completed'
      ) {
        sessionStatus = 'completed';
        if (snapshot.playerOrder.length === 1) {
          const winnerId = snapshot.playerOrder[0];
          snapshot.logs.push({
            id: randomUUID(),
            type: 'system',
            message: `${winnerId} wins the game!`,
            createdAt: nowIso,
            scope: 'all',
          });
        }
      }

      if (snapshot.currentTurnIndex >= snapshot.playerOrder.length) {
        snapshot.currentTurnIndex = 0;
      }

      const nextState = {
        ...state,
        snapshot,
        lastUpdatedAt: nowIso,
      };

      sessionSummary = await this.upsertSessionState({
        roomId: normalizedRoomId,
        state: nextState,
        status: sessionStatus,
      });

      this.realtime.emitSessionSnapshot(normalizedRoomId, sessionSummary);

      if (sessionStatus === 'completed' && room.status !== 'completed') {
        room.status = 'completed';
      }
    };

    if (remainingIds.length === 0) {
      if (sessionDoc) {
        await this.gameSessionModel
          .deleteOne({ roomId: normalizedRoomId })
          .exec();
      }

      await this.gameRoomModel.deleteOne({ _id: normalizedRoomId }).exec();

      this.realtime.emitRoomRemoved(normalizedRoomId);

      return {
        room: null,
        session: null,
        deleted: true,
        removedPlayerId: normalizedUserId,
      };
    }

    room.playerIds = room.playerIds.filter(
      (id) => id.trim() !== normalizedUserId,
    );

    if ((room.hostId ?? '').trim() === normalizedUserId) {
      const nextHost = room.playerIds.find((id) => id && id.trim().length > 0);
      if (nextHost) {
        room.hostId = nextHost;
      }
    }

    await handleExplodingCatsDeparture();

    const savedRoom = await room.save();
    const summary = await this.prepareRoomSummary(savedRoom);
    this.realtime.emitRoomUpdate(summary);

    return {
      room: this.applyViewerContext(summary, savedRoom, normalizedUserId),
      session: sessionSummary,
      deleted: false,
      removedPlayerId: normalizedUserId,
    };
  }

  async deleteRoom(
    userId: string,
    roomId: string,
  ): Promise<DeleteGameRoomResult> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const room = await this.gameRoomModel.findById(normalizedRoomId).exec();
    if (!room) {
      throw new NotFoundException('Game room not found.');
    }

    if ((room.hostId ?? '').trim() !== normalizedUserId) {
      throw new ForbiddenException('Only the host can delete this room.');
    }

    await this.gameSessionModel.deleteOne({ roomId: normalizedRoomId }).exec();

    await this.gameRoomModel.deleteOne({ _id: normalizedRoomId }).exec();

    this.realtime.emitRoomRemoved(normalizedRoomId);

    return {
      roomId: normalizedRoomId,
      deleted: true,
    };
  }

  async playExplodingCatsAction(
    userId: string,
    roomId: string,
    card: ExplodingCatsActionCard,
  ): Promise<GameSessionSummary> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    if (!EXPLODING_CATS_ACTION_CARDS.includes(card)) {
      throw new BadRequestException('Unsupported action card.');
    }

    const room = await this.ensureParticipant(
      normalizedRoomId,
      normalizedUserId,
    );
    if (room.status !== 'in_progress') {
      throw new BadRequestException('The game has not started for this room.');
    }

    const sessionDoc = await this.gameSessionModel
      .findOne({ roomId: normalizedRoomId })
      .exec();
    if (!sessionDoc) {
      throw new NotFoundException('Game session not found for this room.');
    }

    if (sessionDoc.engine !== EXPLODING_CATS_ENGINE_ID) {
      throw new BadRequestException(
        'Play action is only supported for Exploding Cats sessions.',
      );
    }

    const state = sessionDoc.state ?? {};
    const snapshotRaw = state.snapshot as ExplodingCatsState | undefined;
    if (!snapshotRaw) {
      throw new NotFoundException('Exploding Cats snapshot is unavailable.');
    }

    const snapshot = this.cloneExplodingCatsState(snapshotRaw);
    const player = this.findExplodingCatsPlayer(snapshot, normalizedUserId);

    if (!player) {
      throw new ForbiddenException('Player is not part of this session.');
    }

    if (!player.alive) {
      throw new ForbiddenException('Player has already been eliminated.');
    }

    const cardIndex = player.hand.findIndex((value) => value === card);
    if (cardIndex === -1) {
      throw new BadRequestException('Card is not available in hand.');
    }

    if (!snapshot.playerOrder.length) {
      throw new BadRequestException(
        'There are no active players in this session.',
      );
    }

    const currentPlayerId =
      snapshot.playerOrder[snapshot.currentTurnIndex] ?? '';
    if (currentPlayerId !== normalizedUserId) {
      throw new ForbiddenException('It is not your turn to play.');
    }

    player.hand.splice(cardIndex, 1);
    snapshot.discardPile.push(card);

    const nowIso = new Date().toISOString();
    let capitalizedCard = 'Unknown';
    if (card === 'attack') capitalizedCard = 'Attack';
    else if (card === 'skip') capitalizedCard = 'Skip';
    else if (card === 'shuffle') capitalizedCard = 'Shuffle';
    else if (card === 'favor') capitalizedCard = 'Favor';
    else if (card === 'see_the_future') capitalizedCard = 'See the Future';

    const logEntries: ExplodingCatsState['logs'] = [
      {
        id: randomUUID(),
        type: 'action',
        message: `${normalizedUserId} played a ${capitalizedCard} card.`,
        createdAt: nowIso,
        scope: 'all',
      },
    ];

    const pendingBefore = Math.max(snapshot.pendingDraws, 1);

    if (card === 'skip') {
      if (pendingBefore > 1) {
        snapshot.pendingDraws = pendingBefore - 1;
      } else {
        snapshot.pendingDraws = 1;
        this.advanceExplodingCatsTurn(snapshot);
      }
    } else if (card === 'attack') {
      const nextPending = pendingBefore + 1;
      this.advanceExplodingCatsTurn(snapshot);
      snapshot.pendingDraws = nextPending;
    } else if (card === 'shuffle') {
      // Shuffle the deck
      this.shuffleInPlace(snapshot.deck);
      logEntries.push({
        id: randomUUID(),
        type: 'system',
        message: 'The draw pile has been shuffled.',
        createdAt: nowIso,
        scope: 'all',
      });
    } else if (card === 'favor' || card === 'see_the_future') {
      throw new BadRequestException(
        `${capitalizedCard} card requires special handling. Use the dedicated endpoint.`,
      );
    }

    snapshot.logs.push(...logEntries);

    const nextState = {
      ...state,
      snapshot,
      lastUpdatedAt: nowIso,
    };

    return this.upsertSessionState({
      roomId: normalizedRoomId,
      state: nextState,
    });
  }

  async playExplodingCatsCatCombo(
    userId: string,
    roomId: string,
    catCard: ExplodingCatsCatCard,
    options: {
      mode: 'pair' | 'trio';
      targetPlayerId: string;
      desiredCard?: ExplodingCatsCard;
    },
  ): Promise<GameSessionSummary> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    if (!EXPLODING_CATS_CAT_CARDS.includes(catCard)) {
      throw new BadRequestException('Unsupported cat card.');
    }

    const mode = options.mode;
    if (mode !== 'pair' && mode !== 'trio') {
      throw new BadRequestException('Unsupported combo mode.');
    }

    const targetPlayerId = options.targetPlayerId?.trim();
    if (!targetPlayerId) {
      throw new BadRequestException('Target player is required.');
    }

    if (targetPlayerId === normalizedUserId) {
      throw new BadRequestException(
        'Target player must be different from actor.',
      );
    }

    const room = await this.ensureParticipant(
      normalizedRoomId,
      normalizedUserId,
    );
    if (room.status !== 'in_progress') {
      throw new BadRequestException('The game has not started for this room.');
    }

    const sessionDoc = await this.gameSessionModel
      .findOne({ roomId: normalizedRoomId })
      .exec();
    if (!sessionDoc) {
      throw new NotFoundException('Game session not found for this room.');
    }

    if (sessionDoc.engine !== EXPLODING_CATS_ENGINE_ID) {
      throw new BadRequestException(
        'Cat combos are only supported for Exploding Cats sessions.',
      );
    }

    const state = sessionDoc.state ?? {};
    const snapshotRaw = state.snapshot as ExplodingCatsState | undefined;
    if (!snapshotRaw) {
      throw new NotFoundException('Exploding Cats snapshot is unavailable.');
    }

    const snapshot = this.cloneExplodingCatsState(snapshotRaw);
    const player = this.findExplodingCatsPlayer(snapshot, normalizedUserId);

    if (!player) {
      throw new ForbiddenException('Player is not part of this session.');
    }

    if (!player.alive) {
      throw new ForbiddenException('Player has already been eliminated.');
    }

    const targetPlayer = this.findExplodingCatsPlayer(snapshot, targetPlayerId);
    if (!targetPlayer || !targetPlayer.alive) {
      throw new BadRequestException('Target player is not available.');
    }

    const requiredCount = mode === 'pair' ? 2 : 3;
    const availableCount = player.hand.filter(
      (value) => value === catCard,
    ).length;
    if (availableCount < requiredCount) {
      throw new BadRequestException('Card combo is not available.');
    }

    if (mode === 'trio') {
      const desiredCard = options.desiredCard;
      if (!desiredCard) {
        throw new BadRequestException(
          'Desired card is required for trio combo.',
        );
      }
    }

    let desiredCard: ExplodingCatsCard | undefined = undefined;
    if (mode === 'trio') {
      desiredCard = options.desiredCard;
      if (!desiredCard) {
        throw new BadRequestException(
          'Desired card is required for trio combo.',
        );
      }
    }

    // Remove the combo cards from the acting player and discard them.
    let removed = 0;
    for (
      let i = player.hand.length - 1;
      i >= 0 && removed < requiredCount;
      i -= 1
    ) {
      if (player.hand[i] === catCard) {
        player.hand.splice(i, 1);
        snapshot.discardPile.push(catCard);
        removed += 1;
      }
    }

    if (removed < requiredCount) {
      throw new BadRequestException('Unable to remove combo cards from hand.');
    }

    const nowIso = new Date().toISOString();
    const logEntries: ExplodingCatsState['logs'] = [];

    if (mode === 'pair') {
      if (!targetPlayer.hand.length) {
        logEntries.push({
          id: randomUUID(),
          type: 'action',
          message: `${normalizedUserId} used a ${catCard} pair on ${targetPlayerId}, but they had no cards.`,
          createdAt: nowIso,
          scope: 'all',
        });
      } else {
        const stolenIndex = Math.floor(
          Math.random() * targetPlayer.hand.length,
        );
        const [stolenCard] = targetPlayer.hand.splice(stolenIndex, 1);
        if (stolenCard) {
          player.hand.push(stolenCard);
        }

        logEntries.push({
          id: randomUUID(),
          type: 'action',
          message: `${normalizedUserId} stole a card from ${targetPlayerId} with a ${catCard} pair.`,
          createdAt: nowIso,
          scope: 'all',
        });
      }
    } else {
      let resolved = false;
      if (desiredCard && targetPlayer.hand.includes(desiredCard)) {
        const cardIndex = targetPlayer.hand.findIndex(
          (value) => value === desiredCard,
        );
        if (cardIndex !== -1) {
          const [givenCard] = targetPlayer.hand.splice(cardIndex, 1);
          if (givenCard) {
            player.hand.push(givenCard);
            resolved = true;
          }
        }
      }

      logEntries.push({
        id: randomUUID(),
        type: 'action',
        message: resolved
          ? `${normalizedUserId} named ${desiredCard} and received it from ${targetPlayerId} with a ${catCard} trio.`
          : `${normalizedUserId} named ${desiredCard ?? 'a card'} with a ${catCard} trio, but ${targetPlayerId} did not have it.`,
        createdAt: nowIso,
        scope: 'all',
      });
    }

    snapshot.logs.push(...logEntries);

    const nextState = {
      ...state,
      snapshot,
      lastUpdatedAt: nowIso,
    };

    return this.upsertSessionState({
      roomId: normalizedRoomId,
      state: nextState,
    });
  }

  async playExplodingCatsFavor(
    userId: string,
    roomId: string,
    targetPlayerId: string,
    desiredCard: ExplodingCatsCard,
  ): Promise<GameSessionSummary> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const normalizedTargetId = targetPlayerId.trim();
    if (!normalizedTargetId) {
      throw new BadRequestException('Target player ID is required.');
    }

    if (normalizedUserId === normalizedTargetId) {
      throw new BadRequestException('You cannot favor yourself.');
    }

    const room = await this.ensureParticipant(
      normalizedRoomId,
      normalizedUserId,
    );
    if (room.status !== 'in_progress') {
      throw new BadRequestException('The game has not started for this room.');
    }

    const sessionDoc = await this.gameSessionModel
      .findOne({ roomId: normalizedRoomId })
      .exec();
    if (!sessionDoc) {
      throw new NotFoundException('Game session not found for this room.');
    }

    if (sessionDoc.engine !== EXPLODING_CATS_ENGINE_ID) {
      throw new BadRequestException(
        'Favor is only supported for Exploding Cats sessions.',
      );
    }

    const state = sessionDoc.state ?? {};
    const snapshotRaw = state.snapshot as ExplodingCatsState | undefined;
    if (!snapshotRaw) {
      throw new NotFoundException('Exploding Cats snapshot is unavailable.');
    }

    const snapshot = this.cloneExplodingCatsState(snapshotRaw);
    const player = this.findExplodingCatsPlayer(snapshot, normalizedUserId);
    const targetPlayer = this.findExplodingCatsPlayer(
      snapshot,
      normalizedTargetId,
    );

    if (!player) {
      throw new ForbiddenException('Player is not part of this session.');
    }

    if (!player.alive) {
      throw new ForbiddenException('Player has already been eliminated.');
    }

    if (!targetPlayer) {
      throw new BadRequestException(
        'Target player is not part of this session.',
      );
    }

    if (!targetPlayer.alive) {
      throw new BadRequestException('Target player has been eliminated.');
    }

    const cardIndex = player.hand.findIndex((value) => value === 'favor');
    if (cardIndex === -1) {
      throw new BadRequestException('Favor card is not available in hand.');
    }

    if (!snapshot.playerOrder.length) {
      throw new BadRequestException(
        'There are no active players in this session.',
      );
    }

    const currentPlayerId =
      snapshot.playerOrder[snapshot.currentTurnIndex] ?? '';
    if (currentPlayerId !== normalizedUserId) {
      throw new ForbiddenException('It is not your turn to play.');
    }

    // Remove favor card from player's hand
    player.hand.splice(cardIndex, 1);
    snapshot.discardPile.push('favor');

    const nowIso = new Date().toISOString();
    const logEntries: ExplodingCatsState['logs'] = [
      {
        id: randomUUID(),
        type: 'action',
        message: `${normalizedUserId} played a Favor card on ${normalizedTargetId}.`,
        createdAt: nowIso,
        scope: 'all',
      },
    ];

    // Check if target has the desired card
    const targetCardIndex = targetPlayer.hand.findIndex(
      (value) => value === desiredCard,
    );

    if (targetCardIndex !== -1) {
      // Transfer the card
      targetPlayer.hand.splice(targetCardIndex, 1);
      player.hand.push(desiredCard);

      logEntries.push({
        id: randomUUID(),
        type: 'action',
        message: `${normalizedTargetId} gave ${desiredCard} to ${normalizedUserId}.`,
        createdAt: nowIso,
        scope: 'all',
      });
    } else {
      logEntries.push({
        id: randomUUID(),
        type: 'action',
        message: `${normalizedTargetId} does not have ${desiredCard}.`,
        createdAt: nowIso,
        scope: 'all',
      });
    }

    snapshot.logs.push(...logEntries);

    const nextState = {
      ...state,
      snapshot,
      lastUpdatedAt: nowIso,
    };

    return this.upsertSessionState({
      roomId: normalizedRoomId,
      state: nextState,
    });
  }

  async playExplodingCatsSeeTheFuture(
    userId: string,
    roomId: string,
  ): Promise<{
    summary: GameSessionSummary;
    topCards: ExplodingCatsCard[];
  }> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const room = await this.ensureParticipant(
      normalizedRoomId,
      normalizedUserId,
    );
    if (room.status !== 'in_progress') {
      throw new BadRequestException('The game has not started for this room.');
    }

    const sessionDoc = await this.gameSessionModel
      .findOne({ roomId: normalizedRoomId })
      .exec();
    if (!sessionDoc) {
      throw new NotFoundException('Game session not found for this room.');
    }

    if (sessionDoc.engine !== EXPLODING_CATS_ENGINE_ID) {
      throw new BadRequestException(
        'See the Future is only supported for Exploding Cats sessions.',
      );
    }

    const state = sessionDoc.state ?? {};
    const snapshotRaw = state.snapshot as ExplodingCatsState | undefined;
    if (!snapshotRaw) {
      throw new NotFoundException('Exploding Cats snapshot is unavailable.');
    }

    const snapshot = this.cloneExplodingCatsState(snapshotRaw);
    const player = this.findExplodingCatsPlayer(snapshot, normalizedUserId);

    if (!player) {
      throw new ForbiddenException('Player is not part of this session.');
    }

    if (!player.alive) {
      throw new ForbiddenException('Player has already been eliminated.');
    }

    const cardIndex = player.hand.findIndex(
      (value) => value === 'see_the_future',
    );
    if (cardIndex === -1) {
      throw new BadRequestException(
        'See the Future card is not available in hand.',
      );
    }

    if (!snapshot.playerOrder.length) {
      throw new BadRequestException(
        'There are no active players in this session.',
      );
    }

    const currentPlayerId =
      snapshot.playerOrder[snapshot.currentTurnIndex] ?? '';
    if (currentPlayerId !== normalizedUserId) {
      throw new ForbiddenException('It is not your turn to play.');
    }

    // Remove see_the_future card from player's hand
    player.hand.splice(cardIndex, 1);
    snapshot.discardPile.push('see_the_future');

    const nowIso = new Date().toISOString();

    // Get top 3 cards (or fewer if deck is small)
    const topCards = snapshot.deck.slice(-3).reverse();

    const logEntries: ExplodingCatsState['logs'] = [
      {
        id: randomUUID(),
        type: 'action',
        message: `${normalizedUserId} played a See the Future card.`,
        createdAt: nowIso,
        scope: 'all',
      },
      {
        id: randomUUID(),
        type: 'system',
        message: `${normalizedUserId} saw the top ${topCards.length} card(s) of the deck.`,
        createdAt: nowIso,
        scope: 'players',
        senderId: normalizedUserId,
        senderName: normalizedUserId,
      },
    ];

    snapshot.logs.push(...logEntries);

    const nextState = {
      ...state,
      snapshot,
      lastUpdatedAt: nowIso,
    };

    const summary = await this.upsertSessionState({
      roomId: normalizedRoomId,
      state: nextState,
    });

    return {
      summary,
      topCards,
    };
  }

  async postExplodingCatsHistoryNote(
    userId: string,
    roomId: string,
    message: string,
    visibility: ExplodingCatsLogVisibility = 'all',
  ): Promise<GameSessionSummary> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new BadRequestException('Message must not be empty.');
    }

    const safeMessage = trimmedMessage.slice(0, 500);
    const scope: ExplodingCatsLogVisibility =
      visibility === 'players' ? 'players' : 'all';

    const room = await this.ensureParticipant(
      normalizedRoomId,
      normalizedUserId,
    );
    if (room.status !== 'in_progress') {
      throw new BadRequestException('The game has not started for this room.');
    }

    const sessionDoc = await this.gameSessionModel
      .findOne({ roomId: normalizedRoomId })
      .exec();
    if (!sessionDoc) {
      throw new NotFoundException('Game session not found for this room.');
    }

    if (sessionDoc.engine !== EXPLODING_CATS_ENGINE_ID) {
      throw new BadRequestException(
        'History notes are only supported for Exploding Cats sessions.',
      );
    }

    const state = sessionDoc.state ?? {};
    const snapshotRaw = state.snapshot as ExplodingCatsState | undefined;
    if (!snapshotRaw) {
      throw new NotFoundException('Exploding Cats snapshot is unavailable.');
    }

    const snapshot = this.cloneExplodingCatsState(snapshotRaw);
    const player = this.findExplodingCatsPlayer(snapshot, normalizedUserId);
    if (!player) {
      throw new ForbiddenException('Player is not part of this session.');
    }

    const nowIso = new Date().toISOString();
    snapshot.logs.push({
      id: randomUUID(),
      type: 'message',
      message: safeMessage,
      createdAt: nowIso,
      senderId: normalizedUserId,
      scope,
    });

    if (snapshot.logs.length > 200) {
      snapshot.logs = snapshot.logs.slice(-200);
    }

    const nextState = {
      ...state,
      snapshot,
      lastUpdatedAt: nowIso,
    };

    return this.upsertSessionState({
      roomId: normalizedRoomId,
      state: nextState,
    });
  }

  async listHistoryForUser(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: GameHistoryStatus;
    },
  ): Promise<{
    entries: GameHistorySummary[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const page = options?.page && options.page > 0 ? options.page : 1;
    const limit = options?.limit && options.limit > 0 ? options.limit : 20;
    const search = options?.search?.trim().toLowerCase();
    const status = options?.status?.trim() as GameHistoryStatus | undefined;

    const rooms = await this.gameRoomModel
      .find({
        $or: [{ hostId: normalizedUserId }, { playerIds: normalizedUserId }],
      })
      .sort({ createdAt: 1 })
      .exec();

    if (!rooms.length) {
      return { entries: [], total: 0, page, limit, hasMore: false };
    }

    const hiddenEntries = await this.historyHiddenModel
      .find({ userId: normalizedUserId })
      .select(['roomId'])
      .lean()
      .exec();
    const hiddenRoomIds = new Set<string>(
      hiddenEntries
        .map((entry) =>
          typeof entry.roomId === 'string'
            ? entry.roomId.trim()
            : String(entry.roomId),
        )
        .filter((roomId) => roomId.length > 0),
    );

    const groups = new Map<
      string,
      { rootRoom: GameRoom | null; rooms: GameRoom[] }
    >();

    for (const room of rooms) {
      if (room.historyHiddenForAll) {
        continue;
      }

      const rootId =
        room.rootRoomId?.toString?.() ??
        room._id?.toString?.() ??
        String(room._id);
      const existing = groups.get(rootId);
      if (existing) {
        existing.rooms.push(room);
        if (!existing.rootRoom || !room.parentRoomId) {
          existing.rootRoom = room;
        }
      } else {
        groups.set(rootId, {
          rootRoom: room.parentRoomId ? null : room,
          rooms: [room],
        });
      }
    }

    if (groups.size === 0) {
      return { entries: [], total: 0, page, limit, hasMore: false };
    }

    const roomIds: string[] = [];
    for (const group of groups.values()) {
      for (const groupRoom of group.rooms) {
        roomIds.push(this.getRoomDocumentId(groupRoom));
      }
    }

    const sessionDocs = roomIds.length
      ? await this.gameSessionModel.find({ roomId: { $in: roomIds } }).exec()
      : [];
    const sessionLookup = new Map<string, GameSession>();
    for (const session of sessionDocs) {
      const sessionRoomId = this.normalizeDocumentId(session.roomId as unknown);
      if (sessionRoomId) {
        sessionLookup.set(sessionRoomId, session);
      }
    }

    const participantIds = new Set<string>();
    for (const group of groups.values()) {
      for (const groupRoom of group.rooms) {
        this.normalizeUserIds([
          groupRoom.hostId,
          ...(Array.isArray(groupRoom.playerIds) ? groupRoom.playerIds : []),
        ]).forEach((id) => participantIds.add(id));
      }
    }

    const userLookup = await this.fetchUserSummaries(
      Array.from(participantIds),
    );

    const summaries: GameHistorySummary[] = [];

    for (const [rootId, group] of groups.entries()) {
      if (hiddenRoomIds.has(rootId)) {
        continue;
      }

      let rootRoom = group.rootRoom;
      if (!rootRoom) {
        rootRoom = await this.gameRoomModel.findById(rootId).exec();
        if (!rootRoom) {
          continue;
        }
        if (rootRoom.historyHiddenForAll) {
          continue;
        }
        group.rooms.push(rootRoom);
      }

      const participatesInAny = group.rooms.some((room) =>
        this.normalizeUserIds([
          room.hostId,
          ...(Array.isArray(room.playerIds) ? room.playerIds : []),
        ]).includes(normalizedUserId),
      );

      if (!participatesInAny) {
        continue;
      }

      const { summary } = this.computeHistoryGroupSummary({
        rootRoom,
        rooms: group.rooms,
        sessionLookup,
        userLookup,
      });
      summaries.push(summary);
    }

    summaries.sort((a, b) => {
      const aTime = new Date(a.lastActivityAt).getTime();
      const bTime = new Date(b.lastActivityAt).getTime();
      return bTime - aTime;
    });

    // Apply search filter
    let filteredSummaries = summaries;
    if (search) {
      filteredSummaries = summaries.filter((summary) => {
        const roomNameMatch = summary.roomName.toLowerCase().includes(search);
        const participantMatch = summary.participants.some((p) => {
          const username = p.username?.toLowerCase() || '';
          const email = p.email?.toLowerCase() || '';
          return username.includes(search) || email.includes(search);
        });
        return roomNameMatch || participantMatch;
      });
    }

    // Apply status filter
    if (status) {
      filteredSummaries = filteredSummaries.filter(
        (summary) => summary.status === status,
      );
    }

    // Calculate pagination
    const total = filteredSummaries.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const entries = filteredSummaries.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    return {
      entries,
      total,
      page,
      limit,
      hasMore,
    };
  }

  async getHistoryEntry(
    userId: string,
    roomId: string,
  ): Promise<GameHistoryDetail> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const initialRoom = await this.gameRoomModel
      .findById(normalizedRoomId)
      .exec();
    if (!initialRoom) {
      throw new NotFoundException('Game room not found.');
    }

    const rootRoomId = initialRoom.rootRoomId?.toString?.() ?? normalizedRoomId;

    const rooms = await this.gameRoomModel
      .find({
        $or: [{ _id: rootRoomId }, { rootRoomId }],
      })
      .exec();

    if (!rooms.length) {
      throw new NotFoundException('Game room not found.');
    }

    const rootRoom =
      rooms.find(
        (candidate) => this.getRoomDocumentId(candidate) === rootRoomId,
      ) ?? initialRoom;

    if (rootRoom.historyHiddenForAll) {
      throw new NotFoundException('Game room not found.');
    }

    const isHidden = await this.historyHiddenModel
      .exists({ userId: normalizedUserId, roomId: rootRoomId })
      .lean();
    if (isHidden) {
      throw new NotFoundException('Game room not found.');
    }

    const participatesInAny = rooms.some((room) =>
      this.normalizeUserIds([
        room.hostId,
        ...(Array.isArray(room.playerIds) ? room.playerIds : []),
      ]).includes(normalizedUserId),
    );

    if (!participatesInAny) {
      throw new ForbiddenException(
        'Access to this history entry is not permitted.',
      );
    }

    const roomIds = rooms.map((room) => this.getRoomDocumentId(room));
    const sessionDocs = await this.gameSessionModel
      .find({ roomId: { $in: roomIds } })
      .exec();
    const sessionLookup = new Map<string, GameSession>();
    for (const session of sessionDocs) {
      const sessionRoomId = this.normalizeDocumentId(session.roomId as unknown);
      if (sessionRoomId) {
        sessionLookup.set(sessionRoomId, session);
      }
    }

    const participantIds = new Set<string>();
    for (const room of rooms) {
      this.normalizeUserIds([
        room.hostId,
        ...(Array.isArray(room.playerIds) ? room.playerIds : []),
      ]).forEach((id) => participantIds.add(id));
    }

    const userLookup = await this.fetchUserSummaries(
      Array.from(participantIds),
    );

    const historyGroup = this.computeHistoryGroupSummary({
      rootRoom,
      rooms,
      sessionLookup,
      userLookup,
    });

    const extraLogUserIds = new Set<string>();
    const roundLogEntries: Array<{
      metadata: GameHistoryRoundSummary;
      entries: ExplodingCatsEngineLogEntry[];
    }> = [];

    for (const context of historyGroup.rounds) {
      const sessionDoc = context.session;
      if (!sessionDoc || sessionDoc.engine !== EXPLODING_CATS_ENGINE_ID) {
        continue;
      }

      const state = sessionDoc.state ?? {};
      const snapshot = state.snapshot as ExplodingCatsState | undefined;
      if (!snapshot || !Array.isArray(snapshot.logs)) {
        continue;
      }

      const roundLogs: ExplodingCatsEngineLogEntry[] = [];
      snapshot.logs.forEach((entry) => {
        if (!entry) {
          return;
        }
        roundLogs.push(entry);
        const senderId =
          typeof entry.senderId === 'string' ? entry.senderId.trim() : '';
        if (senderId && !userLookup.has(senderId)) {
          extraLogUserIds.add(senderId);
        }
      });

      if (roundLogs.length) {
        roundLogEntries.push({
          metadata: context.metadata,
          entries: roundLogs,
        });
      }
    }

    if (extraLogUserIds.size) {
      const additionalUsers = await this.fetchUserSummaries(
        Array.from(extraLogUserIds),
      );
      additionalUsers.forEach((value, key) => {
        userLookup.set(key, value);
      });
    }

    const displayNameLookup = new Map<string, string>();

    const deriveDisplayName = (id: string, fallbackName?: string | null) => {
      const normalizedId = id.trim();
      if (!normalizedId) {
        return id;
      }

      const user = userLookup.get(normalizedId);
      const normalizedFallback = fallbackName?.trim();
      if (user?.username?.trim()) {
        return user.username.trim();
      }
      if (normalizedFallback) {
        return normalizedFallback;
      }
      const trimmedEmail = user?.email?.trim();
      if (trimmedEmail) {
        const [localPart] = trimmedEmail.split('@');
        if (localPart?.trim()) {
          return localPart.trim();
        }
        return trimmedEmail;
      }
      return normalizedId;
    };

    const registerDisplayName = (
      id: string | undefined,
      fallback?: string | null,
    ) => {
      const normalizedId = id?.trim();
      if (!normalizedId) {
        return;
      }
      const existing = displayNameLookup.get(normalizedId);
      if (existing && existing !== normalizedId) {
        return;
      }
      displayNameLookup.set(
        normalizedId,
        deriveDisplayName(normalizedId, fallback),
      );
    };

    historyGroup.summary.participants.forEach((participant) => {
      registerDisplayName(
        participant.id,
        participant.username ?? participant.email,
      );
    });

    const logs: GameHistoryLogEntry[] = [];

    for (const roundLog of roundLogEntries) {
      for (const entry of roundLog.entries) {
        const id =
          typeof entry.id === 'string' && entry.id.trim().length > 0
            ? entry.id
            : randomUUID();
        const createdAt =
          typeof entry.createdAt === 'string'
            ? entry.createdAt
            : new Date().toISOString();
        const scope: ExplodingCatsLogVisibility =
          entry.scope === 'players' ? 'players' : 'all';
        const senderId =
          typeof entry.senderId === 'string'
            ? entry.senderId.trim()
            : undefined;

        registerDisplayName(senderId, entry.senderName ?? null);

        let sender: HistoryParticipantSummary | undefined;
        if (senderId) {
          const user = userLookup.get(senderId);
          const username = displayNameLookup.get(senderId) ?? senderId;
          sender = {
            id: senderId,
            username,
            email: user?.email ?? null,
            isHost: historyGroup.summary.host.id === senderId,
          };
        }

        let message = typeof entry.message === 'string' ? entry.message : '';
        const replacements = Array.from(displayNameLookup.entries()).sort(
          (a, b) => b[0].length - a[0].length,
        );
        replacements.forEach(([userId, name]) => {
          if (!name || name === userId || !message.includes(userId)) {
            return;
          }
          message = message.split(userId).join(name);
        });

        logs.push({
          id,
          type:
            entry.type === 'action' || entry.type === 'message'
              ? entry.type
              : 'system',
          message,
          createdAt,
          scope,
          sender,
          roundNumber: roundLog.metadata.roundNumber,
          roundRoomId: roundLog.metadata.roomId,
        });
      }
    }

    logs.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return {
      summary: historyGroup.summary,
      logs,
    };
  }

  async hideHistoryEntry(userId: string, roomId: string): Promise<void> {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId) {
      throw new BadRequestException('User ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const initialRoom = await this.gameRoomModel
      .findById(normalizedRoomId)
      .exec();
    if (!initialRoom) {
      throw new NotFoundException('Game room not found.');
    }

    const rootRoomId = initialRoom.rootRoomId?.toString?.() ?? normalizedRoomId;

    const rooms = await this.gameRoomModel
      .find({
        $or: [{ _id: rootRoomId }, { rootRoomId }],
      })
      .exec();

    if (!rooms.length) {
      throw new NotFoundException('Game room not found.');
    }

    const rootRoom =
      rooms.find(
        (candidate) => this.getRoomDocumentId(candidate) === rootRoomId,
      ) ?? initialRoom;

    if (rootRoom.historyHiddenForAll) {
      return;
    }

    const participants = new Set<string>();
    for (const room of rooms) {
      this.normalizeUserIds([
        room.hostId,
        ...(Array.isArray(room.playerIds) ? room.playerIds : []),
      ]).forEach((id) => participants.add(id));
    }

    if (!participants.has(normalizedUserId)) {
      throw new ForbiddenException(
        'Access to this history entry is not permitted.',
      );
    }

    const isHost = (rootRoom.hostId ?? '').trim() === normalizedUserId;

    if (isHost) {
      await this.gameRoomModel
        .updateMany(
          { $or: [{ _id: rootRoomId }, { rootRoomId }] },
          { $set: { historyHiddenForAll: true } },
        )
        .exec();

      await this.historyHiddenModel.deleteMany({ roomId: rootRoomId }).exec();
      return;
    }

    await this.historyHiddenModel
      .updateOne(
        { userId: normalizedUserId, roomId: rootRoomId },
        {
          $set: {
            userId: normalizedUserId,
            roomId: rootRoomId,
          },
        },
        { upsert: true },
      )
      .exec();
  }

  async createRematchFromHistory(
    hostId: string,
    roomId: string,
    participantIds: string[] = [],
    options?: {
      gameId?: string;
      name?: string;
      visibility?: GameRoom['visibility'];
    },
  ): Promise<GameRoomSummary> {
    const normalizedHostId = hostId.trim();
    if (!normalizedHostId) {
      throw new BadRequestException('Host ID is required.');
    }

    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const sourceRoom = await this.gameRoomModel
      .findById(normalizedRoomId)
      .exec();
    if (!sourceRoom) {
      throw new NotFoundException('Game room not found.');
    }

    if (sourceRoom.hostId !== normalizedHostId) {
      throw new ForbiddenException(
        'Only the original host may initiate a rematch.',
      );
    }

    const eligibleParticipants = this.normalizeUserIds([
      sourceRoom.hostId,
      ...(Array.isArray(sourceRoom.playerIds) ? sourceRoom.playerIds : []),
    ]);

    const selected = new Set<string>();
    selected.add(normalizedHostId);

    for (const raw of participantIds ?? []) {
      if (typeof raw !== 'string') {
        continue;
      }
      const trimmed = raw.trim();
      if (trimmed && eligibleParticipants.includes(trimmed)) {
        selected.add(trimmed);
      }
    }

    if (selected.size < 2) {
      throw new BadRequestException(
        'At least one consenting participant is required for a rematch.',
      );
    }

    const inviteCode = await this.generateInviteCode();
    const name = options?.name?.trim() || `${sourceRoom.name} Rematch`;
    const gameId = options?.gameId?.trim() || sourceRoom.gameId;
    if (!gameId) {
      throw new BadRequestException('Game ID is required for rematch.');
    }

    const visibility: GameRoom['visibility'] = options?.visibility ?? 'private';

    const baseMaxPlayers =
      typeof sourceRoom.maxPlayers === 'number' && sourceRoom.maxPlayers > 0
        ? sourceRoom.maxPlayers
        : undefined;
    const maxPlayers = Math.max(baseMaxPlayers ?? selected.size, selected.size);

    const newRoom = new this.gameRoomModel({
      gameId,
      name,
      hostId: normalizedHostId,
      visibility,
      maxPlayers,
      status: 'lobby',
      inviteCode,
      notes: sourceRoom.notes,
      playerIds: Array.from(selected),
      historyHiddenForAll: false,
      parentRoomId: sourceRoom._id?.toString?.() ?? String(sourceRoom._id),
    });

    const rootRoomId =
      sourceRoom.rootRoomId?.toString?.() ?? sourceRoom._id?.toString?.();
    if (rootRoomId) {
      newRoom.rootRoomId = rootRoomId;
    }

    const saved = await newRoom.save();
    const summary = await this.prepareRoomSummary(saved);
    this.realtime.emitRoomUpdate(summary);
    return this.applyViewerContext(summary, saved, normalizedHostId);
  }

  private applyViewerContext(
    baseSummary: GameRoomSummary,
    room: GameRoom,
    viewerId?: string | null,
  ): GameRoomSummary {
    const context = this.resolveViewerContext(room, viewerId);
    return {
      ...baseSummary,
      viewerRole: context.viewerRole,
      viewerHasJoined: context.viewerHasJoined,
      viewerIsHost: context.viewerIsHost,
    };
  }

  private resolveViewerContext(
    room: GameRoom,
    viewerId?: string | null,
  ): {
    viewerRole: 'host' | 'participant' | 'none';
    viewerHasJoined: boolean;
    viewerIsHost: boolean;
  } {
    const normalizedViewerId =
      typeof viewerId === 'string' ? viewerId.trim() : '';
    if (!normalizedViewerId) {
      return {
        viewerRole: 'none',
        viewerHasJoined: false,
        viewerIsHost: false,
      };
    }

    const hostId = (room.hostId ?? '').trim();
    if (hostId && hostId === normalizedViewerId) {
      return {
        viewerRole: 'host',
        viewerHasJoined: true,
        viewerIsHost: true,
      };
    }

    const participantIds = this.normalizeUserIds(
      Array.isArray(room.playerIds) ? room.playerIds : [],
    );
    if (participantIds.includes(normalizedViewerId)) {
      return {
        viewerRole: 'participant',
        viewerHasJoined: true,
        viewerIsHost: false,
      };
    }

    return {
      viewerRole: 'none',
      viewerHasJoined: false,
      viewerIsHost: false,
    };
  }

  private buildRoomMemberSummaries(
    room: GameRoom,
    userLookup: Map<string, RoomUserProfile>,
  ): {
    host?: GameRoomMemberSummary;
    members: GameRoomMemberSummary[];
  } {
    const hostId = (room.hostId ?? '').trim();
    const playerIds = this.normalizeUserIds(
      Array.isArray(room.playerIds) ? room.playerIds : [],
    );

    const members: GameRoomMemberSummary[] = [];
    let hostSummary: GameRoomMemberSummary | undefined;

    if (hostId) {
      const profile = userLookup.get(hostId);
      const displayName = this.deriveDisplayName(hostId, profile);
      hostSummary = {
        id: hostId,
        displayName,
        username: profile?.username ?? null,
        email: profile?.email ?? null,
        isHost: true,
      };
      members.push(hostSummary);
    }

    for (const playerId of playerIds) {
      if (playerId === hostId) {
        continue;
      }
      const profile = userLookup.get(playerId);
      const displayName = this.deriveDisplayName(playerId, profile);
      members.push({
        id: playerId,
        displayName,
        username: profile?.username ?? null,
        email: profile?.email ?? null,
        isHost: false,
      });
    }

    return {
      host: hostSummary,
      members,
    };
  }

  private deriveDisplayName(userId: string, profile?: RoomUserProfile): string {
    const normalizedId = userId.trim();
    if (!normalizedId) {
      return '';
    }

    const profileDisplay = profile?.displayName?.trim?.();
    if (profileDisplay) {
      return profileDisplay;
    }

    const username = profile?.username?.trim?.();
    if (username) {
      return username;
    }

    const email = profile?.email?.trim?.();
    if (email) {
      const [localPart] = email.split('@');
      if (localPart && localPart.trim().length > 0) {
        return localPart.trim();
      }
      return email;
    }

    if (normalizedId.length <= 6) {
      return normalizedId;
    }

    const prefix = normalizedId.slice(0, 4);
    const suffix = normalizedId.slice(-2);
    return `${prefix}...${suffix}`;
  }

  private async buildUserLookupForRooms(
    rooms: GameRoom[],
  ): Promise<Map<string, RoomUserProfile>> {
    const candidateIds = new Set<string>();
    for (const room of rooms) {
      this.normalizeUserIds([
        room.hostId,
        ...(Array.isArray(room.playerIds) ? room.playerIds : []),
      ]).forEach((id) => candidateIds.add(id));
    }

    if (candidateIds.size === 0) {
      return new Map();
    }

    return this.fetchUserSummaries(Array.from(candidateIds));
  }

  private async prepareRoomSummary(room: GameRoom): Promise<GameRoomSummary> {
    const userLookup = await this.buildUserLookupForRooms([room]);
    return this.toSummary(room, userLookup);
  }

  private matchesParticipationFilter(
    room: GameRoom,
    viewerId: string | null,
    filter: GameRoomParticipationFilter,
  ): boolean {
    if (!filter || filter === 'all') {
      return true;
    }

    const normalizedViewer = viewerId?.trim() ?? '';
    if (!normalizedViewer) {
      return false;
    }

    const context = this.resolveViewerContext(room, normalizedViewer);
    switch (filter) {
      case 'hosting':
        return context.viewerIsHost;
      case 'joined':
        return context.viewerHasJoined;
      case 'not_joined':
        return !context.viewerHasJoined;
      default:
        return true;
    }
  }

  private normalizeUserIds(values: unknown[]): string[] {
    const seen = new Set<string>();
    for (const value of values) {
      let parsed = '';
      if (typeof value === 'string') {
        parsed = value.trim();
      } else if (value instanceof Types.ObjectId) {
        parsed = value.toHexString();
      } else if (typeof value === 'number' || typeof value === 'bigint') {
        parsed = value.toString();
      }

      const trimmed = parsed.trim();
      if (trimmed) {
        seen.add(trimmed);
      }
    }
    return Array.from(seen);
  }

  private normalizeDocumentId(value: unknown): string | null {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    }

    if (value instanceof Types.ObjectId) {
      return value.toHexString();
    }

    if (typeof value === 'number' || typeof value === 'bigint') {
      const trimmed = value.toString().trim();
      return trimmed.length ? trimmed : null;
    }

    if (
      value &&
      typeof value === 'object' &&
      'toString' in value &&
      typeof (value as { toString: () => unknown }).toString === 'function'
    ) {
      const result = (value as { toString: () => unknown }).toString();
      if (typeof result === 'string') {
        const trimmed = result.trim();
        if (trimmed.length) {
          return trimmed;
        }
      }
    }

    return null;
  }

  private async fetchUserSummaries(
    userIds: string[],
  ): Promise<Map<string, RoomUserProfile>> {
    const normalized = Array.from(
      new Set(
        userIds
          .map((id) => (typeof id === 'string' ? id.trim() : ''))
          .filter((id) => id.length > 0),
      ),
    );

    const lookup = new Map<string, RoomUserProfile>();
    if (!normalized.length) {
      return lookup;
    }

    const users = await this.userModel
      .find({ _id: { $in: normalized } })
      .select(['username', 'email', 'displayName'])
      .exec();

    for (const user of users) {
      const id = user._id?.toString?.();
      if (id) {
        lookup.set(id, {
          username: user.username ?? undefined,
          email: user.email ?? null,
          displayName: user.displayName ?? null,
        });
      }
    }

    return lookup;
  }

  private computeHistoryGroupSummary(params: {
    rootRoom: GameRoom;
    rooms: GameRoom[];
    sessionLookup: Map<string, GameSession>;
    userLookup: Map<string, RoomUserProfile>;
  }): {
    summary: GameHistorySummary;
    rounds: Array<{
      metadata: GameHistoryRoundSummary;
      session: GameSession | null;
      room: GameRoom;
    }>;
  } {
    const { rootRoom, rooms, sessionLookup, userLookup } = params;
    const rootRoomId = this.getRoomDocumentId(rootRoom);

    const roomSet = [...rooms];
    if (
      !roomSet.some(
        (candidate) => this.getRoomDocumentId(candidate) === rootRoomId,
      )
    ) {
      roomSet.push(rootRoom);
    }

    const sortedRooms = roomSet.sort((a, b) => {
      const aTime =
        a.createdAt instanceof Date
          ? a.createdAt.getTime()
          : new Date(a.createdAt ?? Date.now()).getTime();
      const bTime =
        b.createdAt instanceof Date
          ? b.createdAt.getTime()
          : new Date(b.createdAt ?? Date.now()).getTime();
      return aTime - bTime;
    });

    const participantIds = new Set<string>();
    for (const room of sortedRooms) {
      this.normalizeUserIds([
        room.hostId,
        ...(Array.isArray(room.playerIds) ? room.playerIds : []),
      ]).forEach((id) => participantIds.add(id));
    }

    const participantSummaries: HistoryParticipantSummary[] = Array.from(
      participantIds,
    ).map((id) => {
      const user = userLookup.get(id);
      return {
        id,
        username: user?.displayName ?? user?.username ?? id,
        email: user?.email ?? null,
        isHost: id === rootRoom.hostId,
      };
    });

    let hostSummary = participantSummaries.find((entry) => entry.isHost);
    if (!hostSummary) {
      const hostUser = userLookup.get(rootRoom.hostId);
      hostSummary = {
        id: rootRoom.hostId,
        username: hostUser?.username ?? rootRoom.hostId,
        email: hostUser?.email ?? null,
        isHost: true,
      };
      participantSummaries.unshift(hostSummary);
    }

    participantSummaries.sort((a, b) => {
      if (a.isHost && !b.isHost) {
        return -1;
      }
      if (b.isHost && !a.isHost) {
        return 1;
      }
      return a.username.localeCompare(b.username);
    });

    const roundContexts: Array<{
      metadata: GameHistoryRoundSummary;
      session: GameSession | null;
      room: GameRoom;
    }> = [];

    sortedRooms.forEach((room, index) => {
      const roomId = this.getRoomDocumentId(room);
      const sessionDoc = sessionLookup.get(roomId) ?? null;
      const sessionSummary = sessionDoc
        ? this.toSessionSummary(sessionDoc)
        : null;
      const status = sessionSummary?.status ?? room.status ?? 'lobby';
      const startedAt = sessionSummary?.createdAt ?? null;
      const completedAt =
        status === 'completed' ? (sessionSummary?.updatedAt ?? null) : null;
      const roomUpdatedAt =
        room.updatedAt instanceof Date
          ? room.updatedAt.toISOString()
          : room.createdAt instanceof Date
            ? room.createdAt.toISOString()
            : new Date().toISOString();
      const lastActivityAt = sessionSummary?.updatedAt ?? roomUpdatedAt;

      const winnerUserIds = this.extractRoundWinnerUserIds(sessionDoc);

      roundContexts.push({
        metadata: {
          roundNumber: index + 1,
          roomId,
          sessionId: sessionSummary?.id ?? null,
          status,
          startedAt,
          completedAt,
          lastActivityAt,
          winnerUserIds,
        },
        session: sessionDoc,
        room,
      });
    });

    const latestRound =
      roundContexts[roundContexts.length - 1]?.metadata ?? null;
    const overallLastActivity = roundContexts.reduce<string | null>(
      (latest, context) => {
        const timestamp = context.metadata.lastActivityAt;
        if (!latest) {
          return timestamp;
        }
        return new Date(timestamp).getTime() > new Date(latest).getTime()
          ? timestamp
          : latest;
      },
      null,
    );

    const winnerAggregate = new Map<string, number>();
    for (const context of roundContexts) {
      for (const winnerId of context.metadata.winnerUserIds) {
        if (!winnerId) {
          continue;
        }
        winnerAggregate.set(winnerId, (winnerAggregate.get(winnerId) ?? 0) + 1);
      }
    }

    const winnerStats: GameHistoryWinnerSummary[] = Array.from(
      winnerAggregate.entries(),
    )
      .map(([userId, wins]) => ({ userId, wins }))
      .sort((a, b) => b.wins - a.wins || a.userId.localeCompare(b.userId));

    const summary: GameHistorySummary = {
      roomId: rootRoomId,
      sessionId: latestRound?.sessionId ?? null,
      gameId: rootRoom.gameId,
      roomName: rootRoom.name,
      status: latestRound?.status ?? rootRoom.status ?? 'lobby',
      startedAt: roundContexts[0]?.metadata.startedAt ?? null,
      completedAt: latestRound?.completedAt ?? null,
      lastActivityAt: overallLastActivity ?? new Date().toISOString(),
      host: hostSummary,
      participants: participantSummaries,
      roundCount: roundContexts.length,
      rounds: roundContexts.map((context) => context.metadata),
      winnerStats,
    };

    return { summary, rounds: roundContexts };
  }

  private extractRoundWinnerUserIds(session: GameSession | null): string[] {
    if (!session) {
      return [];
    }

    if (session.engine === EXPLODING_CATS_ENGINE_ID) {
      const snapshot = session.state?.snapshot as
        | ExplodingCatsState
        | undefined;
      if (
        session.status === 'completed' &&
        snapshot &&
        Array.isArray(snapshot.playerOrder) &&
        snapshot.playerOrder.length === 1
      ) {
        const winner = snapshot.playerOrder[0]?.trim?.();
        return winner ? [winner] : [];
      }
    }

    return [];
  }

  private getRoomDocumentId(room: GameRoom): string {
    return room._id?.toString?.() ?? String(room._id);
  }

  private findExplodingCatsPlayer(
    snapshot: ExplodingCatsState,
    playerId: string,
  ): ExplodingCatsPlayerState | undefined {
    return snapshot.players.find((entry) => entry.playerId === playerId);
  }

  private drawExplodingCatsCardFromDeck(snapshot: ExplodingCatsState): {
    card: ExplodingCatsCard;
    deckRefilled: boolean;
  } {
    let deckRefilled = false;

    if (snapshot.deck.length === 0) {
      if (snapshot.discardPile.length === 0) {
        throw new BadRequestException('The deck has no cards remaining.');
      }

      const reshuffled = [...snapshot.discardPile];
      this.shuffleInPlace(reshuffled);
      snapshot.deck = reshuffled;
      snapshot.discardPile = [];
      deckRefilled = true;
    }

    const card = snapshot.deck.pop();
    if (!card) {
      throw new BadRequestException('The deck has no cards remaining.');
    }

    return { card, deckRefilled };
  }

  private advanceExplodingCatsTurn(snapshot: ExplodingCatsState): void {
    const playerCount = snapshot.playerOrder.length;

    if (playerCount === 0) {
      snapshot.currentTurnIndex = 0;
      return;
    }

    if (snapshot.currentTurnIndex >= playerCount) {
      snapshot.currentTurnIndex = playerCount - 1;
    }

    for (let offset = 1; offset <= playerCount; offset += 1) {
      const candidateIndex = (snapshot.currentTurnIndex + offset) % playerCount;
      const candidateId = snapshot.playerOrder[candidateIndex];
      const candidate = this.findExplodingCatsPlayer(snapshot, candidateId);
      if (candidate?.alive) {
        snapshot.currentTurnIndex = candidateIndex;
        return;
      }
    }
  }

  private shuffleInPlace<T>(items: T[]): void {
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = items[i];
      items[i] = items[j];
      items[j] = temp;
    }
  }

  private toSummary(
    room: GameRoom,
    userLookup?: Map<string, RoomUserProfile>,
  ): GameRoomSummary {
    const createdAt =
      room.createdAt instanceof Date
        ? room.createdAt.toISOString()
        : new Date(room.createdAt ?? Date.now()).toISOString();

    const members = Array.isArray(room.playerIds) ? room.playerIds : [];

    const summary: GameRoomSummary = {
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

    if (userLookup) {
      const { host, members: playerSummaries } = this.buildRoomMemberSummaries(
        room,
        userLookup,
      );
      if (host) {
        summary.host = host;
      }
      if (playerSummaries.length > 0) {
        summary.members = playerSummaries;
      }
    }

    return summary;
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

  private async enrichSessionSummary(
    summary: GameSessionSummary,
  ): Promise<GameSessionSummary> {
    const state = summary.state ?? {};
    const snapshot = state.snapshot as Record<string, any> | undefined;

    const candidateIds: string[] = [];
    if (snapshot && typeof snapshot === 'object') {
      const order = Array.isArray(snapshot.playerOrder)
        ? (snapshot.playerOrder as unknown[])
        : [];
      for (const value of order) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed.length > 0) {
            candidateIds.push(trimmed);
          }
        }
      }

      const playerStates = Array.isArray(snapshot.players)
        ? (snapshot.players as Array<{ playerId?: string }>)
        : [];
      for (const item of playerStates) {
        const rawId = item?.playerId;
        if (typeof rawId === 'string') {
          const trimmed = rawId.trim();
          if (trimmed.length > 0) {
            candidateIds.push(trimmed);
          }
        }
      }
    }

    const uniqueIds = Array.from(
      new Set(
        candidateIds.filter((id) => typeof id === 'string' && id.length > 0),
      ),
    );

    if (!uniqueIds.length) {
      if (Array.isArray(state.players)) {
        return summary;
      }

      return {
        ...summary,
        state: {
          ...state,
          players: [],
        },
      };
    }

    try {
      const users = await this.userModel
        .find({ _id: { $in: uniqueIds } })
        .select(['username', 'email'])
        .exec();

      const lookup = new Map<string, { username?: string; email?: string }>();
      for (const user of users) {
        const id = user._id?.toString?.();
        if (id) {
          lookup.set(id, {
            username: user.username ?? undefined,
            email: user.email ?? undefined,
          });
        }
      }

      const players = uniqueIds.map((id) => {
        const user = lookup.get(id);
        return {
          id,
          username: user?.username,
          email: user?.email ?? null,
        };
      });

      return {
        ...summary,
        state: {
          ...state,
          players,
        },
      };
    } catch {
      return {
        ...summary,
        state: {
          ...state,
          players: uniqueIds.map((id) => ({
            id,
            username: undefined,
            email: null,
          })),
        },
      };
    }
  }

  private toSessionSummary(session: GameSession): GameSessionSummary {
    const createdAt =
      session.createdAt instanceof Date
        ? session.createdAt.toISOString()
        : new Date(session.createdAt ?? Date.now()).toISOString();
    const updatedAt =
      session.updatedAt instanceof Date
        ? session.updatedAt.toISOString()
        : new Date(session.updatedAt ?? Date.now()).toISOString();

    return {
      id: session._id?.toString?.() ?? String(session._id),
      roomId: session.roomId,
      gameId: session.gameId,
      engine: session.engine,
      status: session.status ?? 'waiting',
      state: session.state ?? {},
      createdAt,
      updatedAt,
    };
  }
}
