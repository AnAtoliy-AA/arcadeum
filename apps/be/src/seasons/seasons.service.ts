import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Season } from './schemas/season.schema';
import { RankingEntry } from '../ranking/ranking.schema';
import { User } from '../auth/schemas/user.schema';
import { OCI_CONNECTION } from '../common/providers/mongo-connections.provider';
import {
  defaultRewardTiers,
  seasonEndFor,
  seasonIdFor,
  seasonNumberFor,
  seasonStartFor,
  themeForSeason,
} from './seasons.constants';
import type {
  SeasonBoardSnapshotDto,
  SeasonChampionView,
  SeasonDetailView,
  SeasonStandingRow,
  SeasonView,
} from './dtos/seasons.dto';

interface LeanSeason {
  _id?: Types.ObjectId;
  seasonId: string;
  number: number;
  status: Season['status'];
  theme: Season['theme'];
  startsAt: Date;
  endsAt: Date;
  rewardTiers?: Season['rewardTiers'];
  champions?: Season['champions'];
  archivedAt?: Date | null;
}

interface LeanBoardRow {
  _id: string;
  elo: number;
  wins: number;
  rankedGames: number;
}

interface LeanTopPerGameRow {
  _id: string;
  /** RankingEntry.userId is a plain string column. */
  userId?: string;
  elo: number;
}

const SEASON_ID_PATTERN = /^\d{4}Q[1-4]$/;

@Injectable()
export class SeasonsService implements OnModuleInit {
  private readonly logger = new Logger(SeasonsService.name);

  constructor(
    @InjectModel(Season.name, OCI_CONNECTION)
    private readonly seasonModel: Model<Season>,
    @InjectModel(RankingEntry.name, OCI_CONNECTION)
    private readonly rankingModel: Model<RankingEntry>,
    @InjectModel(User.name, OCI_CONNECTION)
    private readonly userModel: Model<User>,
  ) {}

  /**
   * Guarantees a season document exists for the current quarter (and that
   * ended ones are archived + crowned). Runs on boot and hourly via cron so
   * rollover happens even without traffic.
   */
  async onModuleInit(): Promise<void> {
    await this.rollOverIfNeeded();
  }

  async rollOverIfNeeded(): Promise<void> {
    try {
      await this.archiveEndedSeasons();
      await this.findOrCreateCurrent();
    } catch (err) {
      this.logger.warn(`Season rollover failed: ${String(err)}`);
    }
  }

  async getCurrentSeason(): Promise<SeasonDetailView> {
    const season = await this.findOrCreateCurrent();
    return this.mapDetail(season);
  }

  async listSeasons(limit = 10): Promise<SeasonView[]> {
    const docs = await this.seasonModel
      .find()
      .sort({ endsAt: -1 })
      .limit(Math.min(50, Math.max(1, limit)))
      .lean<LeanSeason[]>()
      .exec();
    return docs.map((s) => this.mapSummary(s));
  }

  async getSeasonById(seasonId: string): Promise<SeasonDetailView | null> {
    if (!SEASON_ID_PATTERN.test(seasonId)) return null;
    const doc = await this.seasonModel
      .findOne({ seasonId })
      .lean<LeanSeason | null>()
      .exec();
    return doc ? this.mapDetail(doc) : null;
  }

  /** Convenience wrapper for the live season's board. */
  async getLeaderboardForCurrent(
    query: { gameId?: string; limit?: number; offset?: number } = {},
  ): Promise<SeasonBoardSnapshotDto> {
    return this.getLeaderboard(seasonIdFor(), query);
  }

  /**
   * Seasonal leaderboard aggregated from the per-season `RankingEntry`
   * collection. Without `gameId` it is a cross-game board (peak Elo ranks
   * first); with one it mirrors that game's ranked ladder.
   */
  async getLeaderboard(
    seasonId: string,
    query: { gameId?: string; limit?: number; offset?: number } = {},
  ): Promise<SeasonBoardSnapshotDto> {
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const offset = Math.max(0, query.offset ?? 0);
    if (!SEASON_ID_PATTERN.test(seasonId)) {
      return { seasonId, gameId: query.gameId ?? null, total: 0, entries: [] };
    }

    const filter: Record<string, unknown> = { season: seasonId };
    if (query.gameId) filter.gameId = query.gameId;

    const [result] = await this.rankingModel
      .aggregate<{
        entries: LeanBoardRow[];
        total: Array<{ count: number }>;
      }>([
        { $match: filter },
        {
          $group: {
            _id: '$userId',
            elo: { $max: '$elo' },
            wins: { $sum: '$wins' },
            rankedGames: { $sum: '$rankedGames' },
          },
        },
        { $sort: { elo: -1, wins: -1, _id: 1 } },
        {
          $facet: {
            entries: [{ $skip: offset }, { $limit: limit }],
            total: [{ $count: 'count' }],
          },
        },
      ])
      .exec();

    const rows = result?.entries ?? [];
    const total = result?.total?.[0]?.count ?? 0;
    const userMap = await this.usernameMap(rows.map((r) => r._id));

    const entries: SeasonStandingRow[] = rows.map((r, i) => ({
      rank: offset + i + 1,
      userId: r._id,
      username: userMap.get(r._id) ?? r._id,
      elo: r.elo,
      wins: r.wins ?? 0,
      rankedGames: r.rankedGames ?? 0,
    }));

    return { seasonId, gameId: query.gameId ?? null, total, entries };
  }

  /**
   * Archives every `active` season whose window ended and crowns its
   * champions before flipping status. Idempotent.
   */
  private async archiveEndedSeasons(): Promise<void> {
    const now = new Date();
    const stale = await this.seasonModel
      .find({ status: 'active', endsAt: { $lte: now } })
      .lean<LeanSeason[]>()
      .exec();

    await Promise.all(
      stale.map(async (season) => {
        const champions = await this.computeChampions(season.seasonId);
        await this.seasonModel
          .updateOne(
            { seasonId: season.seasonId, status: 'active' },
            { $set: { status: 'archived', archivedAt: new Date(), champions } },
          )
          .exec();
        this.logger.log(
          `Season ${season.seasonId} archived with ${champions.length} champion(s).`,
        );
      }),
    );
  }

  private async findOrCreateCurrent(): Promise<LeanSeason> {
    const seasonId = seasonIdFor();
    const existing = await this.seasonModel
      .findOne({ seasonId })
      .lean<LeanSeason | null>()
      .exec();
    if (existing) return existing;

    const created = await this.seasonModel
      .findOneAndUpdate(
        { seasonId },
        {
          $setOnInsert: {
            seasonId,
            number: seasonNumberFor(seasonId),
            status: 'active',
            theme: themeForSeason(seasonId),
            startsAt: seasonStartFor(seasonId),
            endsAt: seasonEndFor(seasonId),
            rewardTiers: defaultRewardTiers(),
            champions: [],
            archivedAt: null,
          },
        },
        { upsert: true, new: true },
      )
      .lean<LeanSeason | null>()
      .exec();
    if (created) {
      this.logger.log(`Season ${seasonId} created.`);
      return created;
    }

    // Lost an upsert race — re-read.
    const fallback = await this.seasonModel
      .findOne({ seasonId })
      .lean<LeanSeason | null>()
      .exec();
    if (!fallback) throw new Error(`Failed to create season ${seasonId}`);
    return fallback;
  }

  /** Top player per game for an ended season, usernames hydrated. */
  private async computeChampions(
    seasonId: string,
  ): Promise<Season['champions']> {
    const tops = await this.rankingModel
      .aggregate<LeanTopPerGameRow>([
        { $match: { season: seasonId, rankedGames: { $gt: 0 } } },
        { $sort: { elo: -1, wins: -1 } },
        {
          $group: {
            _id: '$gameId',
            userId: { $first: '$userId' },
            elo: { $first: '$elo' },
          },
        },
      ])
      .exec();

    const rows = tops
      .map((row) => ({
        gameId: row._id,
        userId: row.userId ?? '',
        elo: row.elo,
      }))
      .filter((row) => row.userId.length > 0);

    const userMap = await this.usernameMap(rows.map((r) => r.userId));
    return rows.map((row) => ({
      gameId: row.gameId,
      userId: row.userId,
      username: userMap.get(row.userId) ?? null,
      elo: row.elo,
    }));
  }

  private async usernameMap(userIds: string[]): Promise<Map<string, string>> {
    const valid = userIds.filter((id) => Types.ObjectId.isValid(id));
    if (valid.length === 0) return new Map();
    const users = await this.userModel
      .find({ _id: { $in: valid } })
      .select('_id username displayName')
      .lean<Array<{ _id: unknown; username?: string; displayName?: string }>>()
      .exec();
    return new Map(
      users.map((u) => [
        String(u._id),
        u.displayName || u.username || String(u._id),
      ]),
    );
  }

  private mapSummary(s: LeanSeason): SeasonView {
    return {
      id: s.seasonId,
      number: s.number,
      theme: s.theme,
      status: s.status,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      rewardTiers: (s.rewardTiers ?? []).map((r) => ({
        rankFrom: r.rankFrom,
        rankTo: r.rankTo,
        rewardId: r.rewardId,
        kind: r.kind,
        icon: r.icon,
        color: r.color,
      })),
    };
  }

  private mapDetail(s: LeanSeason): SeasonDetailView {
    return {
      ...this.mapSummary(s),
      archivedAt: s.archivedAt ? s.archivedAt.toISOString() : null,
      champions: (s.champions ?? []).map((c): SeasonChampionView => ({
        gameId: c.gameId,
        userId: String(c.userId),
        username: c.username ?? null,
        elo: c.elo,
      })),
    };
  }
}
