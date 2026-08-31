import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GameRoom } from '../schemas/game-room.schema';
import {
  PlayerStatRecord,
  type PlayerStatRecordDocument,
} from '../schemas/player-stat-record.schema';
import { User, type UserDocument } from '../../auth/schemas/user.schema';
import {
  SocialRewardClaim,
  type SocialRewardClaimDocument,
} from '../../social-rewards/schemas/social-reward-claim.schema';
import { GamesRealtimeService } from '../games.realtime.service';
import {
  OCI_CONNECTION,
  ATLAS_CONNECTION,
} from '../../common/providers/mongo-connections.provider';
import { GameRoomsMatchmakingService } from '../rooms/game-rooms.matchmaking.service';
import type {
  LiveStatsResponse,
  LivePopularGame,
  LiveRoomItem,
  LiveActivityItem,
} from './live-stats.types';

const POPULAR_GAME_IDS = [
  'sea_battle_v1',
  'chess_v1',
  'cascade_v1',
  'hearts_v1',
  'texas_holdem_v1',
  'glimworm_v1',
  'checkers_v1',
  'backgammon_v1',
  'tic_tac_toe_v1',
];

@Injectable()
export class LiveStatsService {
  private readonly logger = new Logger(LiveStatsService.name);

  constructor(
    @InjectModel(GameRoom.name, OCI_CONNECTION)
    private readonly roomModel: Model<GameRoom>,
    @InjectModel(PlayerStatRecord.name, OCI_CONNECTION)
    private readonly playerStatModel: Model<PlayerStatRecordDocument>,
    private readonly realtimeService: GamesRealtimeService,
    @Optional()
    @InjectModel(User.name, ATLAS_CONNECTION)
    private readonly userModel?: Model<UserDocument>,
    @Optional()
    @InjectModel(SocialRewardClaim.name)
    private readonly claimModel?: Model<SocialRewardClaimDocument>,
    @Optional()
    private readonly matchmakingService?: GameRoomsMatchmakingService,
  ) {}

  async getLiveStats(): Promise<LiveStatsResponse> {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const oneDayAgoDate = new Date(oneDayAgo);
    const oneWeekAgoDate = new Date(oneWeekAgo);
    const twoHoursAgoDate = new Date(twoHoursAgo);

    const publicHostFilter = { $not: /^anon_/ };
    const baseRoomFilter = {
      visibility: { $ne: 'private' },
      hostId: publicHostFilter,
      updatedAt: { $gte: twoHoursAgoDate },
    };

    const [
      activeGames,
      waitingRooms,
      statMatchesToday,
      completedRoomsToday,
      openRoomsDocs,
      recentRecords,
      gameAggregation,
      gameWeekAggregation,
      roomDayAggregation,
      roomWeekAggregation,
      inProgressByGameAgg,
      totalUsers,
      totalMatches,
      totalSubscribers,
      socialClaimAgg,
    ] = await Promise.all([
      this.roomModel
        .countDocuments({ ...baseRoomFilter, status: 'in_progress' })
        .exec(),
      this.roomModel
        .countDocuments({ ...baseRoomFilter, status: 'lobby' })
        .exec(),
      this.playerStatModel
        .countDocuments({ timestamp: { $gte: oneDayAgo } })
        .exec(),
      this.roomModel
        .countDocuments({
          status: 'completed',
          updatedAt: { $gte: oneDayAgoDate },
        })
        .exec(),
      this.roomModel
        .find({
          ...baseRoomFilter,
          status: { $in: ['lobby', 'in_progress'] },
        })
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(8)
        .lean()
        .exec(),
      this.playerStatModel
        .find({ result: 'won' })
        .sort({ timestamp: -1 })
        .limit(6)
        .lean()
        .exec(),
      this.playerStatModel
        .aggregate<{ _id: string; matches: number }>([
          { $match: { timestamp: { $gte: oneDayAgo } } },
          { $group: { _id: '$gameId', matches: { $sum: 1 } } },
          { $sort: { matches: -1 } },
        ])
        .exec(),
      this.playerStatModel
        .aggregate<{ _id: string; matches: number }>([
          { $match: { timestamp: { $gte: oneWeekAgo } } },
          { $group: { _id: '$gameId', matches: { $sum: 1 } } },
          { $sort: { matches: -1 } },
        ])
        .exec(),
      this.roomModel
        .aggregate<{ _id: string; matches: number }>([
          {
            $match: {
              updatedAt: { $gte: oneDayAgoDate },
              status: { $in: ['in_progress', 'completed'] },
            },
          },
          { $group: { _id: '$gameId', matches: { $sum: 1 } } },
        ])
        .exec(),
      this.roomModel
        .aggregate<{ _id: string; matches: number }>([
          {
            $match: {
              updatedAt: { $gte: oneWeekAgoDate },
              status: { $in: ['in_progress', 'completed'] },
            },
          },
          { $group: { _id: '$gameId', matches: { $sum: 1 } } },
        ])
        .exec(),
      this.roomModel
        .aggregate<{ _id: string; count: number }>([
          { $match: { ...baseRoomFilter, status: 'in_progress' } },
          { $group: { _id: '$gameId', count: { $sum: 1 } } },
        ])
        .exec(),
      this.userModel
        ? this.userModel
            .countDocuments()
            .exec()
            .catch(() => 0)
        : Promise.resolve(0),
      this.playerStatModel
        .countDocuments()
        .exec()
        .catch(() => 0),
      this.claimModel
        ? this.claimModel
            .countDocuments()
            .exec()
            .catch(() => 0)
        : Promise.resolve(0),
      this.claimModel
        ? this.claimModel
            .aggregate<{ _id: string; count: number }>([
              { $group: { _id: '$platform', count: { $sum: 1 } } },
            ])
            .exec()
            .catch(() => [])
        : Promise.resolve([]),
    ]);

    const matchesToday = Math.max(statMatchesToday, completedRoomsToday);

    const userIdsToFetch = new Set<string>();
    for (const room of openRoomsDocs) {
      if (room.hostId) {
        userIdsToFetch.add(room.hostId);
      }
    }
    for (const rec of recentRecords) {
      if (rec.userId) {
        userIdsToFetch.add(rec.userId);
      }
    }

    const isMongoId = (id: string) =>
      Types.ObjectId.isValid(id) &&
      !id.startsWith('anon_') &&
      !id.startsWith('guest_') &&
      !id.startsWith('temp_') &&
      !id.startsWith('unreg_') &&
      !id.startsWith('bot_');

    const validMongoIds = Array.from(userIdsToFetch).filter(isMongoId);

    const userNamesMap = new Map<string, string>();
    if (this.userModel && validMongoIds.length > 0) {
      const users = await this.userModel
        .find({ _id: { $in: validMongoIds } })
        .select('_id username displayName')
        .lean()
        .exec();
      for (const u of users) {
        const id = String(u._id);
        const name = u.displayName || u.username || 'Player';
        userNamesMap.set(id, name);
      }
    }

    const resolveDisplayName = (id?: string): string => {
      if (!id) return 'Player';
      if (userNamesMap.has(id)) return userNamesMap.get(id)!;
      if (id.startsWith('bot_')) return 'Arcadeum AI';
      if (id.startsWith('anon_') || id.startsWith('guest_'))
        return 'Guest Player';
      return 'Player';
    };

    const openRooms: LiveRoomItem[] = openRoomsDocs.map((r) => ({
      id: String(r._id),
      gameId: r.gameId,
      name: r.name || `${r.gameId} Arena`,
      hostId: String(r.hostId),
      hostName: resolveDisplayName(r.hostId),
      currentPlayers: Array.isArray(r.participants) ? r.participants.length : 1,
      maxPlayers: r.maxPlayers || 2,
      status: r.status === 'in_progress' ? 'in_progress' : 'lobby',
      hasPassword: Boolean(r.password),
      visibility: r.visibility,
      createdAt: r.createdAt
        ? new Date(r.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    const recentActivity: LiveActivityItem[] = recentRecords.map((rec) => ({
      id: String(rec._id),
      type: 'victory',
      gameId: rec.gameId,
      username: resolveDisplayName(rec.userId),
      detail: 'won a competitive match',
      timestamp: new Date(rec.timestamp).toISOString(),
    }));

    const gameMatchesMap = new Map<string, number>();
    for (const agg of [...gameAggregation, ...roomDayAggregation]) {
      if (agg._id) {
        gameMatchesMap.set(
          agg._id,
          (gameMatchesMap.get(agg._id) ?? 0) + agg.matches,
        );
      }
    }

    const gameWeekMatchesMap = new Map<string, number>();
    for (const agg of [...gameWeekAggregation, ...roomWeekAggregation]) {
      if (agg._id) {
        gameWeekMatchesMap.set(
          agg._id,
          (gameWeekMatchesMap.get(agg._id) ?? 0) + agg.matches,
        );
      }
    }

    const popularGames: LivePopularGame[] = POPULAR_GAME_IDS.map((gameId) => {
      const matchCount = gameMatchesMap.get(gameId) ?? 0;
      const matchesWeekCount = gameWeekMatchesMap.get(gameId) ?? matchCount;
      return {
        gameId,
        activePlayers: matchCount > 0 ? matchCount * 2 : 0,
        matchesCount: matchCount,
        matchesWeekCount,
      };
    });

    const realUsers = this.realtimeService.getConnectedUsersCount();
    const realSockets = this.realtimeService.getConnectedSocketsCount();
    const onlineUsers = Math.max(realUsers, realSockets);

    const platformSubscribers: Record<string, number> = {};
    for (const item of socialClaimAgg) {
      if (item._id) {
        platformSubscribers[item._id] = item.count;
      }
    }

    let waitingPlayers = 0;
    let waitingQueues: Record<string, number> = {};
    if (this.matchmakingService) {
      waitingQueues = this.matchmakingService.getQueueOverview();
      waitingPlayers = Object.values(waitingQueues).reduce(
        (sum, n) => sum + n,
        0,
      );
    }

    const activeGamesByGame: Record<string, number> = {};
    for (const item of inProgressByGameAgg) {
      if (item._id) {
        activeGamesByGame[item._id] = item.count;
      }
    }

    return {
      onlineUsers,
      totalUsers: totalUsers ?? 0,
      totalMatches: totalMatches ?? 0,
      totalSubscribers: totalSubscribers ?? 0,
      platformSubscribers,
      activeGames,
      activeGamesByGame,
      waitingRooms,
      waitingPlayers,
      waitingQueues,
      matchesToday,
      popularGames,
      openRooms,
      recentActivity,
    };
  }

  broadcastLiveStats(stats: LiveStatsResponse): void {
    this.realtimeService.emitToRoom(
      this.realtimeService.lobbyChannel(),
      'games.live_stats',
      stats,
    );
  }
}
