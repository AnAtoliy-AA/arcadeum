import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { RankingEntry } from './ranking.schema';
import { PlayerStats } from '../games/schemas/player-stats.schema';
import { User } from '../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import {
  STARTING_ELO,
  currentSeason,
  expectedScore,
  tierForRating,
} from './ranking.constants';
import type { RankingTier } from './ranking.constants';
import {
  seasonResetAnchor,
  seasonResetFactor,
  softResetRating,
} from '../seasons/seasons.constants';
import type {
  MyRankingDto,
  RankingDelta,
  RankingPlayerDto,
  RankingSnapshotDto,
} from './dtos/ranking.dto';

interface RankedOutcome {
  userId: string;
  score: number;
  elo: number;
  delta: number;
  tier: RankingTier;
}

const ELO_K = 32;

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(
    @InjectModel(RankingEntry.name, OCI_CONNECTION)
    private readonly rankingModel: Model<RankingEntry>,
    @InjectModel(PlayerStats.name, OCI_CONNECTION)
    private readonly statsModel: Model<PlayerStats>,
    @InjectModel(User.name, OCI_CONNECTION)
    private readonly userModel: Model<User>,
    private readonly config: ConfigService,
  ) {}

  /**
   * Applies ELO to a completed ranked match. Only 2 human players (no bots,
   * no anonymous) are eligible. Returns the per-user rating change so the
   * caller can surface it in the game result payload; an empty object means
   * the match was not ranked-eligible (e.g. vs a bot).
   */
  async recordRankedResult(
    playerIds: string[],
    gameId: string,
    winners: string[],
  ): Promise<Record<string, RankingDelta>> {
    const humans = playerIds.filter(
      (id) => !id.startsWith('bot-') && !id.startsWith('anon_'),
    );
    if (humans.length !== 2) return {};

    const [p1, p2] = humans;
    const season = currentSeason();
    const winnerSet = new Set(winners);
    const isDraw = winners.length === 0;

    const scoreFor = (playerId: string): number => {
      if (isDraw) return 0.5;
      if (winnerSet.has(playerId)) return 1;
      return 0;
    };

    const r1 = await this.currentRating(p1, gameId, season);
    const r2 = await this.currentRating(p2, gameId, season);

    const e1 = expectedScore(r1, r2);
    const e2 = expectedScore(r2, r1);

    const outcomes: RankedOutcome[] = [
      {
        userId: p1,
        score: scoreFor(p1),
        elo: Math.round(r1 + ELO_K * (scoreFor(p1) - e1)),
        delta: 0,
        tier: 'bronze',
      },
      {
        userId: p2,
        score: scoreFor(p2),
        elo: Math.round(r2 + ELO_K * (scoreFor(p2) - e2)),
        delta: 0,
        tier: 'bronze',
      },
    ];

    outcomes.forEach((o) => {
      const prev = o.userId === p1 ? r1 : r2;
      o.delta = o.elo - prev;
      o.tier = tierForRating(o.elo);
    });

    await Promise.all(outcomes.map((o) => this.applyRating(o, gameId, season)));

    const deltas: Record<string, RankingDelta> = {};
    for (const o of outcomes) {
      deltas[o.userId] = { elo: o.elo, delta: o.delta, tier: o.tier };
    }
    return deltas;
  }

  async getRankings(
    gameId: string,
    limit = 20,
    offset = 0,
  ): Promise<RankingSnapshotDto> {
    const season = currentSeason();
    const filter = { gameId, season };

    const [total, docs] = await Promise.all([
      this.rankingModel.countDocuments(filter).exec(),
      this.rankingModel
        .find(filter)
        .sort({ elo: -1, rankedGames: -1 })
        .skip(offset)
        .limit(limit)
        .lean<RankingEntry[]>()
        .exec(),
    ]);

    const userIds = docs.map((d) => d.userId);
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('_id username displayName')
      .lean<Array<{ _id: unknown; username?: string; displayName?: string }>>()
      .exec();
    const userMap = new Map(
      users.map((u) => [String(u._id), u.username ?? String(u._id)]),
    );

    const entries: RankingPlayerDto[] = docs.map((d, i) => ({
      rank: offset + i + 1,
      userId: d.userId,
      username: userMap.get(d.userId) ?? d.userId,
      elo: d.elo,
      tier: d.tier,
      wins: d.wins,
      losses: d.losses,
      draws: d.draws,
      peakElo: d.peakElo,
    }));

    return { gameId, season, total, entries };
  }

  async getMyRankings(userId: string): Promise<MyRankingDto[]> {
    const season = currentSeason();
    const docs = await this.rankingModel
      .find({ userId, season })
      .sort({ elo: -1 })
      .lean<RankingEntry[]>()
      .exec();

    if (docs.length === 0) return [];

    // A single grouped scan yields player counts per (gameId, elo) bucket so
    // ranks for every entry resolve in one round-trip instead of one
    // countDocuments query per game.
    const gameIds = [...new Set(docs.map((d) => d.gameId))];
    const eloBuckets = await this.rankingModel
      .aggregate<{ gameId: string; elo: number; count: number }>([
        { $match: { season, gameId: { $in: gameIds } } },
        {
          $group: {
            _id: { gameId: '$gameId', elo: '$elo' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            gameId: '$_id.gameId',
            elo: '$_id.elo',
            count: 1,
          },
        },
      ])
      .exec();

    const rows: MyRankingDto[] = docs.map((d) => {
      let ahead = 0;
      for (const bucket of eloBuckets) {
        if (bucket.gameId === d.gameId && bucket.elo > d.elo) {
          ahead += bucket.count;
        }
      }
      return {
        gameId: d.gameId,
        season,
        elo: d.elo,
        tier: d.tier,
        peakElo: d.peakElo,
        wins: d.wins,
        losses: d.losses,
        draws: d.draws,
        rankedGames: d.rankedGames,
        rank: ahead + 1,
      };
    });
    return rows;
  }

  /**
   * Rating used as the baseline for the current season. Resolution order:
   * 1. Existing entry for the current season.
   * 2. Most recent prior-season entry, soft-reset toward the season anchor
   *    (roadmap: pull toward 1500 with a configurable factor).
   * 3. All-time mirror from PlayerStats, also soft-reset for consistency.
   * 4. Starting Elo for brand-new ranked players.
   */
  private async currentRating(
    userId: string,
    gameId: string,
    season: string,
  ): Promise<number> {
    const entry = await this.rankingModel
      .findOne({ gameId, season, userId })
      .select('elo')
      .lean<{ elo: number } | null>()
      .exec();
    if (entry) return entry.elo;

    const anchor = seasonResetAnchor(this.config);
    const factor = seasonResetFactor(this.config);

    const prior = await this.rankingModel
      .findOne({ gameId, season: { $lt: season }, userId })
      .sort({ season: -1 })
      .select('elo')
      .lean<{ elo: number } | null>()
      .exec();
    if (prior) return softResetRating(prior.elo, anchor, factor);

    const stats = await this.statsModel
      .findOne({ userId, gameId })
      .select('elo')
      .lean<{ elo?: number } | null>()
      .exec();
    if (typeof stats?.elo === 'number') {
      return softResetRating(stats.elo, anchor, factor);
    }
    return STARTING_ELO;
  }

  private async applyRating(
    outcome: RankedOutcome,
    gameId: string,
    season: string,
  ): Promise<void> {
    const isWin = outcome.score === 1;
    const isLoss = outcome.score === 0;
    const isDraw = outcome.score === 0.5;

    await Promise.all([
      this.rankingModel
        .findOneAndUpdate(
          { gameId, season, userId: outcome.userId },
          {
            $set: { elo: outcome.elo, tier: outcome.tier },
            $inc: {
              wins: isWin ? 1 : 0,
              losses: isLoss ? 1 : 0,
              draws: isDraw ? 1 : 0,
              rankedGames: 1,
            },
            $max: { peakElo: outcome.elo },
          },
          { upsert: true },
        )
        .exec(),
      this.statsModel
        .updateOne(
          { userId: outcome.userId, gameId },
          { $set: { elo: outcome.elo } },
          { upsert: true },
        )
        .exec(),
    ]);
  }
}
