import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type PipelineStage } from 'mongoose';
import { PlayerStats } from './schemas/player-stats.schema';

@Injectable()
export class PlayerStatsService {
  private readonly logger = new Logger(PlayerStatsService.name);

  constructor(
    @InjectModel(PlayerStats.name)
    private readonly statsModel: Model<PlayerStats>,
  ) {}

  async recordGameResult(
    playerIds: string[],
    gameId: string,
    winners: string[],
  ): Promise<void> {
    const humanIds = playerIds.filter((id) => !id.startsWith('anon_'));

    for (const userId of humanIds) {
      try {
        const isWinner = winners.includes(userId);
        const isLoser = !isWinner && winners.length > 0;
        const isDraw = winners.length === 0;

        await this.statsModel.findOneAndUpdate(
          { userId, gameId },
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
  }> {
    if (userId.startsWith('anon_')) {
      return {
        totalGames: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        byGameType: [],
      };
    }

    const docs = await this.statsModel
      .find({ userId })
      .lean<
        { gameId: string; totalGames: number; wins: number; losses: number }[]
      >()
      .exec();

    const byGameType = docs.map((d) => ({
      gameId: d.gameId,
      totalGames: d.totalGames,
      wins: d.wins,
      winRate:
        d.totalGames > 0
          ? Math.round((d.wins / d.totalGames) * 10000) / 100
          : 0,
    }));

    const totalGames = docs.reduce((s, d) => s + d.totalGames, 0);
    const totalWins = docs.reduce((s, d) => s + d.wins, 0);

    return {
      totalGames,
      wins: totalWins,
      losses: totalGames - totalWins,
      winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0,
      byGameType,
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
        },
      },
      { $sort: { wins: -1, winRate: -1 } },
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
}
