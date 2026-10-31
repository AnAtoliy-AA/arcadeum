import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type PipelineStage } from 'mongoose';
import { SoloScore } from './schemas/solo-score.schema';
import { User } from '../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import { SoloRatingService } from './solo-rating.service';
import { XpSettingsService } from '../xp/xp-settings.service';

interface SyncSoloScoreRecord {
  gameId: string;
  difficulty: string;
  score: number;
  moves: number;
  durationMs: number;
  result: 'won' | 'lost';
  sessionId: string;
  timestamp: number;
  usedUndo?: boolean;
}

@Injectable()
export class SoloScoresService {
  private readonly logger = new Logger(SoloScoresService.name);

  constructor(
    @InjectModel(SoloScore.name, OCI_CONNECTION)
    private readonly soloScoreModel: Model<SoloScore>,
    @InjectModel(User.name, OCI_CONNECTION)
    private readonly userModel: Model<User>,
    private readonly soloRatingService: SoloRatingService,
    private readonly xpSettings: XpSettingsService,
  ) {}

  async getLeaderboard(
    gameId: string,
    difficulty: string,
    sortBy: 'score' | 'durationMs' = 'score',
    order: 'asc' | 'desc' = 'desc',
    limit = 20,
    offset = 0,
    usedUndo?: boolean,
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
    const byDuration = sortBy === 'durationMs';
    // Rank by the requested metric, use the other one only as a tiebreaker in
    // its "better" direction (higher score, faster time).
    const recordSort: Record<string, 1 | -1> = byDuration
      ? { durationMs: sortDirection, score: -1 }
      : { score: sortDirection, durationMs: 1 };
    const rankingSort: Record<string, 1 | -1> = byDuration
      ? { bestDurationMs: sortDirection, bestScore: -1 }
      : { bestScore: sortDirection, bestDurationMs: 1 };

    const matchStage: Record<string, unknown> = {
      gameId,
      difficulty,
      result: 'won',
    };
    if (usedUndo !== undefined) {
      matchStage.usedUndo = usedUndo;
    }

    const pipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $sort: recordSort,
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
        $sort: rankingSort,
      },
      {
        $facet: {
          entries: [
            { $skip: offset },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                playerId: '$_id',
                score: '$bestScore',
                moves: '$bestMoves',
                durationMs: '$bestDurationMs',
                totalGames: 1,
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
          score: number;
          moves: number;
          durationMs: number;
          totalGames: number;
        }>;
        total: Array<{ count: number }>;
      }>(pipeline)
      .exec();

    const rawEntries = result?.entries ?? [];
    const totalCount = result?.total?.[0]?.count ?? 0;

    const userIds = rawEntries.map((e) => e.playerId);
    const users =
      userIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: userIds } })
            .select(
              '_id username displayName role equippedAvatarId equippedBadgeId equippedNameColorId equippedFrameId',
            )
            .lean<
              Array<{
                _id: unknown;
                username?: string;
                displayName?: string;
                role?: string;
                equippedAvatarId?: string;
                equippedBadgeId?: string;
                equippedNameColorId?: string;
                equippedFrameId?: string;
              }>
            >()
            .exec()
        : [];

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const entries = rawEntries.map((e, i) => {
      const user = userMap.get(e.playerId);
      return {
        rank: offset + i + 1,
        playerId: e.playerId,
        username: user?.username ?? 'Unknown',
        displayName: user?.displayName ?? null,
        role: user?.role ?? null,
        score: e.score,
        moves: e.moves,
        durationMs: e.durationMs,
        totalGames: e.totalGames,
        equippedAvatarId: user?.equippedAvatarId ?? null,
        equippedBadgeId: user?.equippedBadgeId ?? null,
        equippedNameColorId: user?.equippedNameColorId ?? null,
        equippedFrameId: user?.equippedFrameId ?? null,
      };
    });

    return {
      entries,
      total: totalCount,
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
            usedUndo: r.usedUndo ?? false,
          },
        },
        upsert: true,
      },
    }));

    try {
      await this.soloScoreModel.bulkWrite(ops, { ordered: false });

      // Update solo rating for each completed game
      for (const r of newRecords) {
        if (r.result === 'won' || r.result === 'lost') {
          try {
            await this.soloRatingService.recordResult({
              userId,
              difficulty: r.difficulty,
              won: r.result === 'won',
              usedUndo: r.usedUndo ?? false,
            });
          } catch (err) {
            this.logger.warn(
              `Failed to update solo rating for ${userId}: ${(err as Error).message}`,
            );
          }
        }
      }

      // Award XP for solo games (0.1 coefficient by default, 0 if undo was used)
      for (const r of newRecords) {
        if (r.usedUndo) continue;
        try {
          const amount = await this.xpSettings.getXpReward(
            r.gameId,
            r.result === 'won' ? 'won' : 'lost',
            true,
            false,
          );
          if (amount > 0) {
            await this.xpSettings.awardXp(userId, this.userModel, amount);
          }
        } catch (err) {
          this.logger.warn(
            `Failed to award solo XP for ${userId}: ${(err as Error).message}`,
          );
        }
      }

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
