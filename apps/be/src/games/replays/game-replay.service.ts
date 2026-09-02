import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GameReplay,
  type ReplayAction,
  type ReplayPlayer,
  type ReplayResult,
} from '../schemas/game-replay.schema';
import {
  OCI_CONNECTION,
  ATLAS_CONNECTION,
} from '../../common/providers/mongo-connections.provider';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import type { BaseGameState } from '../engines/base/game-engine.interface';
import type { GameRoom } from '../schemas/game-room.schema';
import { User } from '../../auth/schemas/user.schema';
import { validateGameId } from '../game-validation.util';

export interface ReplaySummary {
  replayId: string;
  roomId: string;
  gameId: string;
  players: ReplayPlayer[];
  result?: ReplayResult;
  totalMoves: number;
  durationMs: number;
  createdAt: string;
}

export interface ReplayDetail extends ReplaySummary {
  sessionId: string;
  playerIds: string[];
  initialState: Record<string, unknown>;
  actions: ReplayAction[];
  gameOptions?: Record<string, unknown>;
}

@Injectable()
export class GameReplayService {
  private readonly logger = new Logger(GameReplayService.name);

  constructor(
    @InjectModel(GameReplay.name, OCI_CONNECTION)
    private readonly replayModel: Model<GameReplay>,
    @Optional()
    @InjectModel(User.name, ATLAS_CONNECTION)
    private readonly userModel?: Model<User>,
  ) {}

  async createReplay(
    session: GameSessionSummary,
    room: GameRoom,
  ): Promise<ReplaySummary | null> {
    try {
      const state = session.state as unknown as BaseGameState;
      if (!state || !state.logs) return null;

      const actionLogs = state.logs.filter((log) => log.type === 'action');

      if (actionLogs.length === 0) return null;

      const actions: ReplayAction[] = actionLogs.map((log) => ({
        action: log.kind ?? log.type,
        userId: log.senderId ?? '',
        payload: { message: log.message, targetId: log.targetId },
        timestamp: log.createdAt,
      }));

      const playerIds = room.participants.map((p) => p.userId);
      const players = await this.resolvePlayerNames(playerIds, room);

      const initialState = this.extractInitialState(state, session.gameId);

      const result = state.gameResult
        ? {
            winnerIds: state.gameResult.winnerIds,
            isDraw: state.gameResult.isDraw,
          }
        : undefined;

      const startTime = new Date(session.createdAt).getTime();
      const endTime = new Date(session.updatedAt).getTime();
      const durationMs = Math.max(0, endTime - startTime);

      const replayId = globalThis.crypto.randomUUID();

      const replay = await this.replayModel.create({
        replayId,
        roomId: session.roomId,
        sessionId: session.id,
        gameId: session.gameId,
        playerIds,
        players,
        initialState,
        actions,
        result,
        gameOptions: room.gameOptions,
        totalMoves: actions.length,
        durationMs,
      });

      this.logger.log(
        `Created replay ${replayId} for session ${session.id} (${session.gameId})`,
      );

      return this.toSummary(replay);
    } catch (err) {
      this.logger.error(
        `Failed to create replay for session ${session.id}: ${(err as Error).message}`,
      );
      return null;
    }
  }

  async getReplay(replayId: string): Promise<ReplayDetail | null> {
    if (!replayId || typeof replayId !== 'string') return null;
    const safeReplayId = String(replayId).trim();
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(safeReplayId)) return null;

    const replay = await this.replayModel
      .findOne({ replayId: safeReplayId })
      .lean()
      .exec();

    if (!replay) return null;

    return this.toDetail(replay as unknown as GameReplay);
  }

  async listReplaysForUser(
    userId: string,
    _page = 0,
    limit = 20,
    cursor?: string,
  ): Promise<{
    entries: ReplaySummary[];
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  }> {
    if (!userId || typeof userId !== 'string') {
      return { entries: [], total: 0, hasMore: false };
    }
    const safeUserId = String(userId).trim();
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(safeUserId)) {
      return { entries: [], total: 0, hasMore: false };
    }

    const filter: Record<string, unknown> = { playerIds: safeUserId };
    if (cursor) {
      filter._id = {
        $lt: new (await import('mongoose')).Types.ObjectId(cursor),
      };
    }

    const [total, replays] = await Promise.all([
      this.replayModel.countDocuments({ playerIds: safeUserId }).exec(),
      this.replayModel
        .find(filter)
        .select(
          'replayId roomId gameId players result totalMoves durationMs createdAt',
        )
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean()
        .exec(),
    ]);

    const hasMore = replays.length > limit;
    if (hasMore) replays.pop();

    return {
      entries: (replays as unknown as GameReplay[]).map((r) =>
        this.toSummary(r),
      ),
      total,
      hasMore,
      nextCursor:
        hasMore && replays.length > 0
          ? replays[replays.length - 1]._id.toString()
          : undefined,
    };
  }

  async listReplays(
    gameId?: string,
    _page = 0,
    limit = 20,
    cursor?: string,
  ): Promise<{
    entries: ReplaySummary[];
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  }> {
    const filter: Record<string, unknown> = {};

    if (gameId && typeof gameId === 'string') {
      try {
        validateGameId(gameId);
        filter.gameId = gameId;
      } catch {
        return { entries: [], total: 0, hasMore: false };
      }
    }

    const countFilter = { ...filter };
    if (cursor) {
      filter._id = {
        $lt: new (await import('mongoose')).Types.ObjectId(cursor),
      };
    }

    const [total, replays] = await Promise.all([
      this.replayModel.countDocuments(countFilter).exec(),
      this.replayModel
        .find(filter)
        .select(
          'replayId roomId gameId players result totalMoves durationMs createdAt',
        )
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean()
        .exec(),
    ]);

    const hasMore = replays.length > limit;
    if (hasMore) replays.pop();

    return {
      entries: (replays as unknown as GameReplay[]).map((r) =>
        this.toSummary(r),
      ),
      total,
      hasMore,
      nextCursor:
        hasMore && replays.length > 0
          ? replays[replays.length - 1]._id.toString()
          : undefined,
    };
  }

  async getReplayByRoom(roomId: string): Promise<ReplaySummary | null> {
    if (!roomId || typeof roomId !== 'string') return null;
    const safeRoomId = String(roomId).trim();
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(safeRoomId)) return null;

    const replay = await this.replayModel
      .findOne({ roomId: safeRoomId })
      .select(
        'replayId roomId gameId players result totalMoves durationMs createdAt',
      )
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!replay) return null;

    return this.toSummary(replay as unknown as GameReplay);
  }

  private extractInitialState(
    state: BaseGameState,
    gameId: string,
  ): Record<string, unknown> {
    const clone = structuredClone(state) as Record<string, unknown>;

    delete clone.logs;
    delete clone.stateHistory;
    delete clone.gameResult;

    if (gameId === 'chess_v1') {
      const chessState = clone;
      chessState.moveHistory = [];
      if (Array.isArray(chessState.positionHistory)) {
        chessState.positionHistory = [chessState.positionHistory[0]];
      }
    }

    return clone;
  }

  private async resolvePlayerNames(
    playerIds: string[],
    _room: GameRoom,
  ): Promise<ReplayPlayer[]> {
    const players: ReplayPlayer[] = [];

    const userMap = new Map<string, { displayName: string; role?: string }>();

    if (this.userModel) {
      try {
        const users = await this.userModel
          .find({
            _id: { $in: playerIds.filter((id) => !id.startsWith('bot-')) },
          })
          .select('displayName username role')
          .lean()
          .exec();

        for (const user of users) {
          const u = user as unknown as {
            _id: { toString(): string };
            displayName?: string;
            username?: string;
            role?: string;
          };
          userMap.set(u._id.toString(), {
            displayName: u.displayName ?? u.username ?? 'Player',
            role: u.role,
          });
        }
      } catch {
        this.logger.warn('Failed to resolve player names for replay');
      }
    }

    for (const playerId of playerIds) {
      if (playerId.startsWith('bot-')) {
        players.push({ id: playerId, displayName: 'Bot' });
      } else {
        const resolved = userMap.get(playerId);
        players.push({
          id: playerId,
          displayName: resolved?.displayName ?? 'Player',
          role: resolved?.role,
        });
      }
    }

    return players;
  }

  private toSummary(replay: GameReplay): ReplaySummary {
    return {
      replayId: replay.replayId,
      roomId: replay.roomId,
      gameId: replay.gameId,
      players: replay.players,
      result: replay.result,
      totalMoves: replay.totalMoves,
      durationMs: replay.durationMs,
      createdAt: replay.createdAt?.toISOString?.() ?? new Date().toISOString(),
    };
  }

  private toDetail(replay: GameReplay): ReplayDetail {
    return {
      ...this.toSummary(replay),
      sessionId: replay.sessionId,
      playerIds: replay.playerIds,
      initialState: replay.initialState,
      actions: replay.actions,
      gameOptions: replay.gameOptions,
    };
  }
}
