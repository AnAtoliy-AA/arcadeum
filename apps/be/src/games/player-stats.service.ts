import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type PipelineStage } from 'mongoose';
import { PlayerStats } from './schemas/player-stats.schema';
import { PlayerStatRecord } from './schemas/player-stat-record.schema';

interface SyncRecord {
  gameId: string;
  result: 'won' | 'lost' | 'draw';
  timestamp: number;
  sessionId: string;
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

  async recordGameResult(
    playerIds: string[],
    gameId: string,
    winners: string[],
  ): Promise<void> {
    const humanIds = playerIds.filter((id) => !id.startsWith('anon_'));

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
  }

  async getPlayerStats(userId: string): Promise<{
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    byGameType: Array<{
      gameId: string;
      totalGames: number;
      wins: number;
      winRate: number;
    }>;
    currentStreak: number;
    currentStreakType: 'won' | 'lost' | null;
    bestWinStreak: number;
    favoriteGame: string | null;
  }> {
    if (userId.startsWith('anon_')) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        byGameType: [],
        currentStreak: 0,
        currentStreakType: null,
        bestWinStreak: 0,
        favoriteGame: null,
      };
    }

    const docs = await this.statsModel
      .find({ userId: { $eq: userId } })
      .lean<
        {
          gameId: string;
          totalGames: number;
          wins: number;
          losses: number;
          elo?: number;
        }[]
      >()
      .exec();

    const byGameType = docs.map((d) => ({
      gameId: d.gameId,
      totalGames: d.totalGames,
      wins: d.wins,
      elo: d.elo ?? 1200,
      winRate:
        d.totalGames > 0
          ? Math.round((d.wins / d.totalGames) * 10000) / 100
          : 0,
    }));

    const totalGames = docs.reduce((s, d) => s + d.totalGames, 0);
    const totalWins = docs.reduce((s, d) => s + d.wins, 0);

    const records = await this.recordModel
      .find({ userId: { $eq: userId } })
      .sort({ timestamp: -1 })
      .limit(200)
      .lean<{ result: string; gameId: string }[]>()
      .exec();

    let currentStreak = 0;
    let currentStreakType: 'won' | 'lost' | null = null;
    let bestWinStreak = 0;
    let tempWinStreak = 0;
    const gameCounts = new Map<string, number>();

    for (const record of records) {
      const r = record.result as 'won' | 'lost' | 'draw';
      gameCounts.set(record.gameId, (gameCounts.get(record.gameId) ?? 0) + 1);

      if (r === 'won') {
        tempWinStreak++;
        if (tempWinStreak > bestWinStreak) {
          bestWinStreak = tempWinStreak;
        }
      } else {
        tempWinStreak = 0;
      }

      if (currentStreakType === null && r !== 'draw') {
        currentStreakType = r;
        currentStreak = 1;
      } else if (currentStreakType === r) {
        currentStreak++;
      } else if (currentStreakType !== null) {
        break;
      }
    }

    let favoriteGame: string | null = null;
    let maxCount = 0;
    for (const [gameId, count] of gameCounts) {
      if (count > maxCount) {
        maxCount = count;
        favoriteGame = gameId;
      }
    }

    return {
      totalGames,
      wins: totalWins,
      losses: totalGames - totalWins,
      winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
      byGameType,
      currentStreak,
      currentStreakType,
      bestWinStreak,
      favoriteGame,
    };
  }

  async getLeaderboard(
    limit: number,
    offset: number,
    gameId?: string,
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

    const pipeline: PipelineStage[] = [
      ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
      {
        $group: {
          _id: '$userId',
          totalGames: { $sum: '$totalGames' },
          wins: { $sum: '$wins' },
          losses: { $sum: '$losses' },
          elo: { $max: '$elo' },
        },
      },
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

  async getHeadToHead(
    userId1: string,
    userId2: string,
    gameId?: string,
  ): Promise<{
    player1: { wins: number; losses: number; draws: number };
    player2: { wins: number; losses: number; draws: number };
    totalGames: number;
  }> {
    const match: Record<string, unknown> = {
      userId: { $in: [userId1, userId2] },
    };
    if (gameId) match.gameId = gameId;

    const records = await this.recordModel
      .find(match)
      .sort({ timestamp: -1 })
      .lean<{ userId: string; result: string }[]>()
      .exec();

    const player1 = { wins: 0, losses: 0, draws: 0 };
    const player2 = { wins: 0, losses: 0, draws: 0 };

    for (const record of records) {
      const r = record.result as 'won' | 'lost' | 'draw';
      if (record.userId === userId1) {
        if (r === 'won') player1.wins++;
        else if (r === 'lost') player1.losses++;
        else player1.draws++;
      } else if (record.userId === userId2) {
        if (r === 'won') player2.wins++;
        else if (r === 'lost') player2.losses++;
        else player2.draws++;
      }
    }

    return {
      player1,
      player2,
      totalGames: Math.min(
        player1.wins + player1.losses + player1.draws,
        player2.wins + player2.losses + player2.draws,
      ),
    };
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
    if (userId.startsWith('anon_')) {
      return {
        records: [],
        winRate: 0,
        currentStreak: 0,
        currentStreakType: null,
      };
    }

    const match: Record<string, unknown> = { userId: { $eq: userId } };
    if (gameId) match.gameId = gameId;

    const records = await this.recordModel
      .find(match)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean<{ result: string; timestamp: number; sessionId: string }[]>()
      .exec();

    const mapped = records.map((r) => ({
      result: r.result as 'won' | 'lost' | 'draw',
      timestamp: r.timestamp,
      sessionId: r.sessionId,
    }));

    const wins = mapped.filter((r) => r.result === 'won').length;
    const winRate =
      mapped.length > 0 ? Math.round((wins / mapped.length) * 100) : 0;

    let currentStreak = 0;
    let currentStreakType: 'won' | 'lost' | null = null;
    for (const record of mapped) {
      if (record.result === 'draw') break;
      if (currentStreakType === null) {
        currentStreakType = record.result;
        currentStreak = 1;
      } else if (record.result === currentStreakType) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { records: mapped, winRate, currentStreak, currentStreakType };
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
          },
        },
        upsert: true,
      },
    }));

    try {
      await this.recordModel.bulkWrite(recordOps);
      await this.statsModel.bulkWrite(statsOps);
      return { synced: newRecords.length, duplicates };
    } catch (err) {
      this.logger.warn(
        `Failed to batch sync records for ${userId}: ${(err as Error).message}`,
      );
      return { synced: 0, duplicates };
    }
  }
}
