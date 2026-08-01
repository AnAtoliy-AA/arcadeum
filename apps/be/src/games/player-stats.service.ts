import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type PipelineStage } from 'mongoose';
import {
  PlayerStats,
  PlayerStatsDocument,
} from './schemas/player-stats.schema';
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

    // If it's a 2-player human-vs-human game, we calculate ELO
    if (humanIds.length === 2) {
      const p1 = humanIds[0];
      const p2 = humanIds[1];

      try {
        const getOrCreateStats = async (userId: string) => {
          let stats = await this.statsModel
            .findOne({ userId: { $eq: userId }, gameId: { $eq: gameId } })
            .exec();
          if (!stats) {
            stats = new this.statsModel({
              userId,
              gameId,
              totalGames: 0,
              wins: 0,
              losses: 0,
              draws: 0,
              elo: 1200,
            });
          }
          return stats;
        };

        const stats1 = await getOrCreateStats(p1);
        const stats2 = await getOrCreateStats(p2);

        const r1 = stats1.elo ?? 1200;
        const r2 = stats2.elo ?? 1200;

        const e1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
        const e2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));

        let s1 = 0.5;
        let s2 = 0.5;
        if (winners.includes(p1) && !winners.includes(p2)) {
          s1 = 1;
          s2 = 0;
        } else if (winners.includes(p2) && !winners.includes(p1)) {
          s1 = 0;
          s2 = 1;
        }

        const k = 32;
        stats1.elo = Math.round(r1 + k * (s1 - e1));
        stats2.elo = Math.round(r2 + k * (s2 - e2));

        const updateDocStats = (
          stats: PlayerStatsDocument,
          isWinner: boolean,
          isLoser: boolean,
          isDraw: boolean,
        ) => {
          stats.totalGames = (stats.totalGames || 0) + 1;
          stats.wins = (stats.wins || 0) + (isWinner ? 1 : 0);
          stats.losses = (stats.losses || 0) + (isLoser ? 1 : 0);
          stats.draws = (stats.draws || 0) + (isDraw ? 1 : 0);
        };

        updateDocStats(
          stats1,
          winners.includes(p1),
          !winners.includes(p1) && winners.length > 0,
          winners.length === 0,
        );
        updateDocStats(
          stats2,
          winners.includes(p2),
          !winners.includes(p2) && winners.length > 0,
          winners.length === 0,
        );

        await Promise.all([stats1.save(), stats2.save()]);
        return;
      } catch (err) {
        this.logger.error(`Failed to calculate ELO for match: ${String(err)}`);
      }
    }

    for (const userId of humanIds) {
      try {
        const isWinner = winners.includes(userId);
        const isLoser = !isWinner && winners.length > 0;
        const isDraw = winners.length === 0;

        await this.statsModel.findOneAndUpdate(
          { userId: { $eq: userId }, gameId: { $eq: gameId } },
          {
            $inc: {
              totalGames: 1,
              wins: isWinner ? 1 : 0,
              losses: isLoser ? 1 : 0,
              draws: isDraw ? 1 : 0,
            },
          },
          { upsert: true },
        );
      } catch (err) {
        this.logger.warn(
          `Failed to record stats for ${userId}: ${(err as Error).message}`,
        );
      }
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

  async syncRecords(
    userId: string,
    records: SyncRecord[],
  ): Promise<{ synced: number; duplicates: number }> {
    let synced = 0;
    let duplicates = 0;

    for (const record of records) {
      try {
        const existing = await this.recordModel.findOne({
          userId: { $eq: userId },
          sessionId: { $eq: record.sessionId },
        });

        if (existing) {
          duplicates++;
          continue;
        }

        await this.recordModel.create({
          userId,
          gameId: record.gameId,
          result: record.result,
          sessionId: record.sessionId,
          timestamp: record.timestamp,
        });

        await this.statsModel.findOneAndUpdate(
          { userId: { $eq: userId }, gameId: { $eq: record.gameId } },
          {
            $inc: {
              totalGames: 1,
              wins: record.result === 'won' ? 1 : 0,
              losses: record.result === 'lost' ? 1 : 0,
              draws: record.result === 'draw' ? 1 : 0,
            },
          },
          { upsert: true },
        );

        synced++;
      } catch (err) {
        this.logger.warn(
          `Failed to sync record for ${userId}: ${(err as Error).message}`,
        );
      }
    }

    return { synced, duplicates };
  }
}
