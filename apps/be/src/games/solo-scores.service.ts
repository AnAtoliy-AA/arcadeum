import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type PipelineStage } from 'mongoose';
import { SoloScore } from './schemas/solo-score.schema';
import { User } from '../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';

interface SyncSoloScoreRecord {
  gameId: string;
  difficulty: string;
  score: number;
  moves: number;
  durationMs: number;
  result: 'won' | 'lost';
  sessionId: string;
  timestamp: number;
}

@Injectable()
export class SoloScoresService {
  private readonly logger = new Logger(SoloScoresService.name);

  constructor(
    @InjectModel(SoloScore.name, OCI_CONNECTION)
    private readonly soloScoreModel: Model<SoloScore>,
    @InjectModel(User.name, OCI_CONNECTION)
    private readonly userModel: Model<User>,
  ) {}

  async getLeaderboard(
    gameId: string,
    difficulty: string,
    _sortBy: 'score' | 'durationMs' = 'score',
    order: 'asc' | 'desc' = 'desc',
    limit = 20,
    offset = 0,
  ): Promise<{
    entries: Array<{
      rank: number;
      playerId: string;
      username: string;
      displayName: string | null;
      score: number;
      moves: number;
      durationMs: number;
      equippedAvatarId: string | null;
      equippedBadgeId: string | null;
      equippedNameColorId: string | null;
      equippedFrameId: string | null;
    }>;
    total: number;
  }> {
    const sortDirection = order === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          gameId,
          difficulty,
          result: 'won',
        },
      },
      {
        $sort: {
          score: sortDirection,
          durationMs: 1,
        },
      },
      {
        $group: {
          _id: '$userId',
          bestScore: { $first: '$score' },
          bestMoves: { $first: '$moves' },
          bestDurationMs: { $first: '$durationMs' },
          totalGames: { $sum: 1 },
        },
      },
      {
        $sort: {
          bestScore: sortDirection,
          bestDurationMs: 1,
        },
      },
      {
        $facet: {
          entries: [
            { $skip: offset },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      displayName: 1,
                      equippedAvatarId: 1,
                      equippedBadgeId: 1,
                      equippedNameColorId: 1,
                      equippedFrameId: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 0,
                playerId: '$_id',
                username: { $ifNull: ['$user.username', 'Unknown'] },
                displayName: { $ifNull: ['$user.displayName', null] },
                score: '$bestScore',
                moves: '$bestMoves',
                durationMs: '$bestDurationMs',
                totalGames: 1,
                equippedAvatarId: {
                  $ifNull: ['$user.equippedAvatarId', null],
                },
                equippedBadgeId: {
                  $ifNull: ['$user.equippedBadgeId', null],
                },
                equippedNameColorId: {
                  $ifNull: ['$user.equippedNameColorId', null],
                },
                equippedFrameId: {
                  $ifNull: ['$user.equippedFrameId', null],
                },
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.soloScoreModel
      .aggregate<{
        entries: Array<{
          playerId: string;
          username: string;
          displayName: string | null;
          score: number;
          moves: number;
          durationMs: number;
          totalGames: number;
          equippedAvatarId: string | null;
          equippedBadgeId: string | null;
          equippedNameColorId: string | null;
          equippedFrameId: string | null;
        }>;
        total: Array<{ count: number }>;
      }>(pipeline)
      .exec();

    return {
      entries: result.entries.map((e, i) => ({
        ...e,
        rank: offset + i + 1,
      })),
      total: result.total[0]?.count ?? 0,
    };
  }

  async getPersonalBests(
    userId: string,
    gameId?: string,
  ): Promise<
    Array<{
      gameId: string;
      difficulty: string;
      bestScore: number;
      bestMoves: number;
      bestDurationMs: number;
      totalGames: number;
      wins: number;
    }>
  > {
    const match: Record<string, unknown> = { userId };
    if (gameId) match.gameId = gameId;

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: { gameId: '$gameId', difficulty: '$difficulty' },
          bestScore: { $max: '$score' },
          bestMoves: {
            $min: { $cond: [{ $eq: ['$result', 'won'] }, '$moves', Infinity] },
          },
          bestDurationMs: {
            $min: {
              $cond: [{ $eq: ['$result', 'won'] }, '$durationMs', Infinity],
            },
          },
          totalGames: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$result', 'won'] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          gameId: '$_id.gameId',
          difficulty: '$_id.difficulty',
          bestScore: 1,
          bestMoves: {
            $cond: [{ $eq: ['$bestMoves', Infinity] }, 0, '$bestMoves'],
          },
          bestDurationMs: {
            $cond: [
              { $eq: ['$bestDurationMs', Infinity] },
              0,
              '$bestDurationMs',
            ],
          },
          totalGames: 1,
          wins: 1,
        },
      },
      { $sort: { gameId: 1, difficulty: 1 } },
    ];

    interface PersonalBest {
      gameId: string;
      difficulty: string;
      bestScore: number;
      bestMoves: number;
      bestDurationMs: number;
      totalGames: number;
      wins: number;
    }

    return this.soloScoreModel.aggregate<PersonalBest>(pipeline).exec();
  }

  async syncScores(
    userId: string,
    records: SyncSoloScoreRecord[],
  ): Promise<{ synced: number; duplicates: number }> {
    if (records.length === 0) return { synced: 0, duplicates: 0 };

    const sessionIds = records.map((r) => r.sessionId);
    const existing = await this.soloScoreModel
      .find({
        userId,
        sessionId: { $in: sessionIds },
      })
      .select('sessionId')
      .lean<{ sessionId: string }[]>()
      .exec();
    const existingSet = new Set(existing.map((e) => e.sessionId));

    const newRecords = records.filter((r) => !existingSet.has(r.sessionId));
    const duplicates = records.length - newRecords.length;

    if (newRecords.length === 0) return { synced: 0, duplicates };

    const ops = newRecords.map((r) => ({
      updateOne: {
        filter: {
          userId,
          gameId: r.gameId,
          difficulty: r.difficulty,
          sessionId: r.sessionId,
        },
        update: {
          $set: {
            score: r.score,
            moves: r.moves,
            durationMs: r.durationMs,
            result: r.result,
            timestamp: r.timestamp,
          },
        },
        upsert: true,
      },
    }));

    try {
      await this.soloScoreModel.bulkWrite(ops, { ordered: false });
      return { synced: newRecords.length, duplicates };
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return { synced: 0, duplicates: records.length };
      }
      this.logger.warn(
        `Failed to sync solo scores for ${userId}: ${(err as Error).message}`,
      );
      return { synced: 0, duplicates };
    }
  }

  async getRecentGames(
    userId: string,
    gameId?: string,
    difficulty?: string,
    limit = 20,
  ): Promise<
    Array<{
      gameId: string;
      difficulty: string;
      score: number;
      moves: number;
      durationMs: number;
      result: 'won' | 'lost';
      timestamp: number;
    }>
  > {
    const match: Record<string, unknown> = { userId };
    if (gameId) match.gameId = gameId;
    if (difficulty) match.difficulty = difficulty;

    interface RecentGame {
      gameId: string;
      difficulty: string;
      score: number;
      moves: number;
      durationMs: number;
      result: 'won' | 'lost';
      timestamp: number;
    }

    return this.soloScoreModel
      .find(match)
      .sort({ timestamp: -1 })
      .limit(limit)
      .select(' gameId difficulty score moves durationMs result timestamp -_id')
      .lean<RecentGame[]>()
      .exec();
  }
}
