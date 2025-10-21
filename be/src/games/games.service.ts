import { randomUUID } from 'crypto';
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
import {
  GameSession,
  type GameSessionStatus,
} from './schemas/game-session.schema';
import {
  createInitialExplodingCatsState,
  type ExplodingCatsCard,
  type ExplodingCatsPlayerState,
  type ExplodingCatsState,
} from './exploding-cats/exploding-cats.state';
import { GamesRealtimeService } from './games.realtime.service';

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

const EXPLODING_CATS_GAME_ID = 'exploding-kittens';
const EXPLODING_CATS_ENGINE_ID = 'exploding_cats_v1';
const EXPLODING_CATS_ACTION_CARDS = ['skip', 'attack'] as const;
type ExplodingCatsActionCard = (typeof EXPLODING_CATS_ACTION_CARDS)[number];

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(GameRoom.name)
    private readonly gameRoomModel: Model<GameRoom>,
    @InjectModel(GameSession.name)
    private readonly gameSessionModel: Model<GameSession>,
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
      const summary = this.toSummary(room);
      this.realtime.emitRoomUpdate(summary);
      return summary;
    }

    return this.toSummary(room);
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

    return this.toSummary(room);
  }

  async findSessionByRoom(roomId: string): Promise<GameSessionSummary | null> {
    const trimmedRoomId = roomId.trim();
    if (!trimmedRoomId) {
      throw new BadRequestException('Room ID is required.');
    }

    const session = await this.gameSessionModel
      .findOne({ roomId: trimmedRoomId })
      .exec();

    return session ? this.toSessionSummary(session) : null;
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
    return this.toSessionSummary(saved);
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

    const summary = this.toSessionSummary(updated);
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
    const roomSummary = this.toSummary(updatedRoom);

    this.realtime.emitRoomUpdate(roomSummary);
    this.realtime.emitSessionSnapshot(normalizedRoomId, session);

    return {
      room: roomSummary,
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
      },
    ];

    if (deckRefilled) {
      logEntries.push({
        id: randomUUID(),
        type: 'system',
        message: 'Deck was reshuffled from the discard pile.',
        createdAt: nowIso,
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
    const capitalizedCard = card === 'attack' ? 'Attack' : 'Skip';
    const logEntries: ExplodingCatsState['logs'] = [
      {
        id: randomUUID(),
        type: 'action',
        message: `${normalizedUserId} played a ${capitalizedCard} card.`,
        createdAt: nowIso,
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
    } else {
      const nextPending = pendingBefore + 1;
      this.advanceExplodingCatsTurn(snapshot);
      snapshot.pendingDraws = nextPending;
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
