import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type PipelineStage } from 'mongoose';
import { PlayerStats } from './schemas/player-stats.schema';
import { PlayerStatRecord } from './schemas/player-stat-record.schema';
import { validateGameId } from './game-validation.util';
import {
  executeHeadToHead,
  executePlayerStats,
  executeTrends,
} from './player-stats-trends.util';

interface SyncRecord {
  gameId: string;
  result: 'won' | 'lost' | 'draw';
  timestamp: number;
  sessionId: string;
  hasBots?: boolean;
}

@Injectable()
export class PlayerStatsService {
  private readonly logger = new Logger(PlayerStatsService.name);

  constructor(
    @InjectModel(PlayerStats.name)
    private readonly statsModel: Model<PlayerStats>,
    @InjectModel(PlayerStatRecord.name)
    private readonly recordModel: Model<PlayerStatRecord>,
  ) {}

  private sanitizeGameIdFilter(
    gameId: string | undefined,
  ): Record<string, unknown> | undefined {
    if (!gameId || typeof gameId !== 'string') return undefined;
    validateGameId(gameId);
    return { $eq: gameId };
  }

  async recordGameResult(
    playerIds: string[],
    gameId: string,
    winners: string[],
    hasBots = false,
    sessionId?: string,
  ): Promise<void> {
    const humanIds = playerIds.filter(
      (id) => !id.startsWith('anon_') && !id.startsWith('bot-'),
    );

    const bulkOps = humanIds.map((userId) => {
      const isWinner = winners.includes(userId);
      const isLoser = !isWinner && winners.length > 0;
      const isDraw = winners.length === 0;
      return {
        updateOne: {
          filter: { userId: { $eq: userId }, gameId: { $eq: gameId } },
          update: {
            $inc: {
              totalGames: 1,
              wins: isWinner ? 1 : 0,
              losses: isLoser ? 1 : 0,
              draws: isDraw ? 1 : 0,
              pvpGames: !hasBots ? 1 : 0,
              pvpWins: !hasBots && isWinner ? 1 : 0,
              pvpLosses: !hasBots && isLoser ? 1 : 0,
              pvpDraws: !hasBots && isDraw ? 1 : 0,
              botGames: hasBots ? 1 : 0,
              botWins: hasBots && isWinner ? 1 : 0,
              botLosses: hasBots && isLoser ? 1 : 0,
              botDraws: hasBots && isDraw ? 1 : 0,
            },
          },
          upsert: true,
        },
      };
    });

    try {
      await this.statsModel.bulkWrite(bulkOps);
    } catch (err) {
      this.logger.warn(
        `Failed to record stats in batch: ${(err as Error).message}`,
      );
    }

    if (sessionId) {
      const timestamp = Date.now();
      const recordOps = humanIds.map((userId) => {
        const isWinner = winners.includes(userId);
        const result = isWinner
          ? 'won'
          : winners.length === 0
            ? 'draw'
            : 'lost';
        return {
          updateOne: {
            filter: { userId: { $eq: userId }, sessionId: { $eq: sessionId } },
            update: {
              $set: {
                userId,
                gameId,
                result,
                sessionId,
                timestamp,
                hasBots,
              },
            },
            upsert: true,
          },
        };
      });
      try {
        await this.recordModel.bulkWrite(recordOps);
      } catch (err) {
        this.logger.warn(
          `Failed to record player stat records in batch: ${(err as Error).message}`,
        );
      }
    }
  }

  async getPlayerStats(userId: string) {
    return executePlayerStats(this.statsModel, this.recordModel, userId);
  }

  async getLeaderboard(
    limit: number,
    offset: number,
    gameId?: string,
    opponentType: 'all' | 'pvp' | 'bot' = 'all',
  ): Promise<{
    entries: Array<{
      playerId: string;
      totalGames: number;
      wins: number;
      winRate: number;
      losses: number;
    }>;
    total: number;
  }> {
    const match: Record<string, unknown> = {};
    if (gameId) match.gameId = gameId;

    const isPvp = opponentType === 'pvp';
    const isBot = opponentType === 'bot';

    const gamesExpr = isPvp
      ? {
          $cond: [
            { $gt: ['$pvpGames', 0] },
            '$pvpGames',
            { $cond: [{ $eq: ['$botGames', 0] }, '$totalGames', 0] },
          ],
        }
      : isBot
        ? '$botGames'
        : '$totalGames';

    const winsExpr = isPvp
      ? {
          $cond: [
            { $gt: ['$pvpWins', 0] },
            '$pvpWins',
            { $cond: [{ $eq: ['$botGames', 0] }, '$wins', 0] },
          ],
        }
      : isBot
        ? '$botWins'
        : '$wins';

    const lossesExpr = isPvp
      ? {
          $cond: [
            { $gt: ['$pvpLosses', 0] },
            '$pvpLosses',
            { $cond: [{ $eq: ['$botGames', 0] }, '$losses', 0] },
          ],
        }
      : isBot
        ? '$botLosses'
        : '$losses';

    const pipeline: PipelineStage[] = [
      ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
      {
        $group: {
          _id: '$userId',
          totalGames: { $sum: gamesExpr },
          wins: { $sum: winsExpr },
          losses: { $sum: lossesExpr },
          elo: { $max: '$elo' },
        },
      },
      ...(opponentType !== 'all'
        ? [{ $match: { totalGames: { $gt: 0 } } }]
        : []),
      {
        $addFields: {
          winRate: {
            $cond: {
              if: { $gt: ['$totalGames', 0] },
              then: {
                $multiply: [{ $divide: ['$wins', '$totalGames'] }, 100],
              },
              else: 0,
            },
          },
          elo: { $ifNull: ['$elo', 1200] },
        },
      },
      { $sort: gameId ? { elo: -1, wins: -1 } : { wins: -1, winRate: -1 } },
      {
        $facet: {
          entries: [
            { $skip: offset },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                playerId: '$_id',
                totalGames: 1,
                wins: 1,
                losses: 1,
                winRate: 1,
                elo: 1,
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.statsModel
      .aggregate<{
        entries: Array<{
          playerId: string;
          totalGames: number;
          wins: number;
          winRate: number;
          losses: number;
          elo: number;
        }>;
        total: Array<{ count: number }>;
      }>(pipeline)
      .exec();

    return {
      entries: result.entries.map((e) => ({
        ...e,
        winRate: Math.round(e.winRate * 100) / 100,
      })),
      total: result.total[0]?.count ?? 0,
    };
  }

  async getRecentForms(
    userIds: string[],
    gameId?: string,
  ): Promise<
    Map<string, { recentForm: Array<'W' | 'L' | 'D'>; currentStreak: number }>
  > {
    const map = new Map<
      string,
      { recentForm: Array<'W' | 'L' | 'D'>; currentStreak: number }
    >();
    if (userIds.length === 0) return map;

    const match: Record<string, unknown> = { userId: { $in: userIds } };
    if (gameId) {
      const sanitized = this.sanitizeGameIdFilter(gameId);
      if (sanitized) match.gameId = sanitized;
    }

    const records = await this.recordModel
      .find(match)
      .sort({ timestamp: -1 })
      .limit(userIds.length * 15)
      .lean<Array<{ userId: string; result: string }>>()
      .exec();

    const byUser = new Map<string, Array<'W' | 'L' | 'D'>>();
    for (const rec of records) {
      const list = byUser.get(rec.userId) ?? [];
      if (list.length < 12) {
        const res: 'W' | 'L' | 'D' =
          rec.result === 'won' ? 'W' : rec.result === 'draw' ? 'D' : 'L';
        list.push(res);
        byUser.set(rec.userId, list);
      }
    }

    for (const userId of userIds) {
      const form = byUser.get(userId) ?? [];
      let streak = 0;
      for (const r of form) {
        if (r === 'W') streak++;
        else break;
      }
      map.set(userId, { recentForm: form, currentStreak: streak });
    }

    return map;
  }

  async getHeadToHead(
    userId1: string,
    userId2: string,
    gameId?: string,
  ): Promise<{
    player1: { wins: number; losses: number; draws: number };
    player2: { wins: number; losses: number; draws: number };
    totalGames: number;
  }> {
    return executeHeadToHead(
      this.recordModel,
      userId1,
      userId2,
      this.sanitizeGameIdFilter(gameId),
    );
  }

  async getTrends(
    userId: string,
    gameId?: string,
    limit = 10,
  ): Promise<{
    records: Array<{
      result: 'won' | 'lost' | 'draw';
      timestamp: number;
      sessionId: string;
    }>;
    winRate: number;
    currentStreak: number;
    currentStreakType: 'won' | 'lost' | null;
  }> {
    return executeTrends(
      this.recordModel,
      userId,
      this.sanitizeGameIdFilter(gameId),
      limit,
    );
  }

  async syncRecords(
    userId: string,
    records: SyncRecord[],
  ): Promise<{ synced: number; duplicates: number }> {
    if (records.length === 0) return { synced: 0, duplicates: 0 };

    const sessionIds = records.map((r) => r.sessionId);
    const existing = await this.recordModel
      .find({
        userId: { $eq: userId },
        sessionId: { $in: sessionIds },
      })
      .select('sessionId')
      .lean<{ sessionId: string }[]>()
      .exec();
    const existingSet = new Set(existing.map((e) => e.sessionId));

    const newRecords = records.filter((r) => !existingSet.has(r.sessionId));
    const duplicates = records.length - newRecords.length;

    if (newRecords.length === 0) return { synced: 0, duplicates };

    const recordOps = newRecords.map((r) => ({
      insertOne: {
        document: {
          userId,
          gameId: r.gameId,
          result: r.result,
          sessionId: r.sessionId,
          timestamp: r.timestamp,
          hasBots: r.hasBots ?? false,
        },
      },
    }));

    const statsOps = newRecords.map((r) => ({
      updateOne: {
        filter: { userId: { $eq: userId }, gameId: { $eq: r.gameId } },
        update: {
          $inc: {
            totalGames: 1,
            wins: r.result === 'won' ? 1 : 0,
            losses: r.result === 'lost' ? 1 : 0,
            draws: r.result === 'draw' ? 1 : 0,
            pvpGames: !r.hasBots ? 1 : 0,
            pvpWins: !r.hasBots && r.result === 'won' ? 1 : 0,
            pvpLosses: !r.hasBots && r.result === 'lost' ? 1 : 0,
            pvpDraws: !r.hasBots && r.result === 'draw' ? 1 : 0,
            botGames: r.hasBots ? 1 : 0,
            botWins: r.hasBots && r.result === 'won' ? 1 : 0,
            botLosses: r.hasBots && r.result === 'lost' ? 1 : 0,
            botDraws: r.hasBots && r.result === 'draw' ? 1 : 0,
          },
        },
        upsert: true,
      },
    }));

    try {
      await this.recordModel.bulkWrite(recordOps, { ordered: false });
      await this.statsModel.bulkWrite(statsOps, { ordered: false });
      return { synced: newRecords.length, duplicates };
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return { synced: 0, duplicates: records.length };
      }
      this.logger.warn(
        `Failed to batch sync records for ${userId}: ${(err as Error).message}`,
      );
      return { synced: 0, duplicates };
    }
  }
}
