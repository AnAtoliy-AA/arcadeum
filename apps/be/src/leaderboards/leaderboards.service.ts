import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LeaderboardEntry,
  type GameMode,
  type Region,
  REGION_VALUES,
} from './schemas/leaderboard-entry.schema';
import { Cup } from './schemas/cup.schema';
import { Squad } from './schemas/squad.schema';
import { TickerEvent } from './schemas/ticker-event.schema';
import { LeaderboardsGateway } from './leaderboards.gateway';
import type {
  ClimberFallerDto,
  CupSnapshotDto,
  LeaderboardPlayerDto,
  LeaderboardSnapshotDto,
  MythicPlayerDto,
  RegionDistributionDto,
  RewardTierItemDto,
  SquadDto,
  TickerEventDto,
} from './dtos/leaderboard-snapshot.dto';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const REWARDS: RewardTierItemDto[] = [
  {
    tier: 'mythic',
    rankFrom: 1,
    rankTo: 1,
    rewardLabel: 'rewards.mythic',
    icon: '♛',
    color: '#ec4899',
  },
  {
    tier: 'diamond',
    rankFrom: 2,
    rankTo: 10,
    rewardLabel: 'rewards.diamond',
    icon: '◆',
    color: '#22d3ee',
  },
  {
    tier: 'platinum',
    rankFrom: 11,
    rankTo: 50,
    rewardLabel: 'rewards.platinum',
    icon: '◇',
    color: '#a78bfa',
  },
  {
    tier: 'gold',
    rankFrom: 51,
    rankTo: 200,
    rewardLabel: 'rewards.gold',
    icon: '★',
    color: '#facc15',
  },
  {
    tier: 'silver',
    rankFrom: 201,
    rankTo: 500,
    rewardLabel: 'rewards.silver',
    icon: '✦',
    color: '#94a3b8',
  },
];

export type GetLeaderboardArgs = {
  mode?: GameMode;
  page?: number;
  pageSize?: number;
  selfUserId?: string;
};

@Injectable()
export class LeaderboardsService {
  constructor(
    @InjectModel(LeaderboardEntry.name)
    private readonly entryModel: Model<LeaderboardEntry>,
    @InjectModel(Cup.name) private readonly cupModel: Model<Cup>,
    @InjectModel(Squad.name) private readonly squadModel: Model<Squad>,
    @InjectModel(TickerEvent.name)
    private readonly tickerEventModel: Model<TickerEvent>,
    @Inject(forwardRef(() => LeaderboardsGateway))
    private readonly gateway: LeaderboardsGateway,
  ) {}

  /**
   * Flip the in-match flag for a set of users. Called by GamesService when a
   * match starts/ends so the rank table can show LIVE chips in real time.
   */
  async markInMatch(
    userIds: string[],
    isInMatch: boolean,
    mode?: GameMode,
  ): Promise<number> {
    if (userIds.length === 0) return 0;
    const filter: { userId: { $in: string[] }; mode?: GameMode } = {
      userId: { $in: userIds },
    };
    if (mode) filter.mode = mode;
    const res = await this.entryModel
      .updateMany(filter, { $set: { isInMatch } })
      .exec();
    const matched = res.modifiedCount ?? 0;
    if (matched > 0 && mode) {
      const season = currentSeason();
      for (const userId of userIds) {
        this.gateway.emitEntryUpdated({ userId, mode, season, isInMatch });
      }
    }
    return matched;
  }

  async getSnapshot(
    args: GetLeaderboardArgs = {},
  ): Promise<LeaderboardSnapshotDto> {
    const mode: GameMode = args.mode ?? 'all';
    const page = Math.max(1, args.page ?? 1);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, args.pageSize ?? DEFAULT_PAGE_SIZE),
    );
    const season = currentSeason();

    const [
      entries,
      totalRows,
      topRow,
      cup,
      squads,
      tickerEvents,
      regionAgg,
      climbersRaw,
      fallersRaw,
      selfEntry,
    ] = await Promise.all([
      this.entryModel
        .find({ mode, season })
        .sort({ rating: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec(),
      this.entryModel.countDocuments({ mode, season }).exec(),
      this.entryModel
        .findOne({ mode, season })
        .sort({ rating: -1 })
        .lean()
        .exec(),
      this.findActiveCup(),
      this.squadModel.find().sort({ rating: -1 }).limit(5).lean().exec(),
      this.tickerEventModel
        .find({
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        })
        .sort({ occurredAt: -1 })
        .limit(8)
        .lean()
        .exec(),
      this.aggregateRegions(mode, season),
      this.entryModel
        .find({ mode, season, prevRank: { $exists: true, $ne: null } })
        .sort({ rating: -1 })
        .limit(200)
        .lean()
        .exec(),
      this.entryModel
        .find({ mode, season, prevRank: { $exists: true, $ne: null } })
        .sort({ rating: -1 })
        .limit(200)
        .lean()
        .exec(),
      args.selfUserId
        ? this.entryModel
            .findOne({ mode, season, userId: args.selfUserId })
            .lean()
            .exec()
        : Promise.resolve(null),
    ]);

    const rows = entries.map((e, i) =>
      toPlayerDto(e, (page - 1) * pageSize + i + 1),
    );

    const podium: LeaderboardSnapshotDto['podium'] =
      page === 1 && rows[0] && rows[1] && rows[2]
        ? [rows[0], rows[1], rows[2]]
        : null;

    const mythic: MythicPlayerDto | null =
      page === 1 && rows[0] && rows[1]
        ? {
            ...rows[0],
            ratingDelta: rows[0].rating - rows[1].rating,
            streak: rows[0].streak ?? 0,
          }
        : null;

    const climbers: ClimberFallerDto[] = climbersRaw
      .filter(
        (e) => typeof e.prevRank === 'number' && typeof e.rank === 'number',
      )
      .map((e) => {
        const fromRank = e.prevRank as number;
        const toRank = e.rank as number;
        return {
          player: toPlayerDto(e, toRank),
          delta: fromRank - toRank,
          fromRank,
          toRank,
        };
      })
      .filter((c) => c.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5);

    const fallers: ClimberFallerDto[] = fallersRaw
      .filter(
        (e) => typeof e.prevRank === 'number' && typeof e.rank === 'number',
      )
      .map((e) => {
        const fromRank = e.prevRank as number;
        const toRank = e.rank as number;
        return {
          player: toPlayerDto(e, toRank),
          delta: fromRank - toRank,
          fromRank,
          toRank,
        };
      })
      .filter((f) => f.delta < 0)
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 5);

    const squadsDto: SquadDto[] = squads.map((s, i) => ({
      id: s.squadId,
      name: s.name,
      tag: s.tag,
      rating: s.rating,
      memberCount: s.memberCount,
      rank: s.rank ?? i + 1,
      isYou: args.selfUserId
        ? s.memberUserIds.includes(args.selfUserId)
        : false,
    }));

    const cupDto: CupSnapshotDto | null = cup
      ? {
          id: cup.cupId,
          title: cup.title,
          startsAt: cup.startsAt.toISOString(),
          endsAt: cup.endsAt.toISOString(),
          prizePoolUSD: cup.prizePoolUSD,
          participantCount: cup.participantCount,
          qualified: cup.qualifiedUserIds.length
            ? await this.resolveQualifiedPlayers(
                mode,
                season,
                cup.qualifiedUserIds,
              )
            : [],
        }
      : null;

    const liveMatchRanks = rows.filter((r) => r.isInMatch).map((r) => r.rank);

    const self: LeaderboardPlayerDto | null = selfEntry
      ? toPlayerDto(selfEntry, selfEntry.rank ?? 0)
      : null;

    const tickerEventsDto: TickerEventDto[] = tickerEvents.map((e) => ({
      who: e.who,
      what: e.what,
      color: e.color,
    }));

    return {
      capturedAt: new Date().toISOString(),
      mode,
      mythic,
      podium,
      rows,
      totalRows,
      cup: cupDto,
      rewards: REWARDS,
      regions: regionAgg,
      climbers,
      fallers,
      squads: squadsDto,
      self,
      tickerEvents: tickerEventsDto,
      liveMatchRanks,
      topRating: topRow?.rating ?? 0,
    };
  }

  private async findActiveCup() {
    const now = new Date();
    return this.cupModel
      .findOne({ active: true, endsAt: { $gte: now } })
      .sort({ endsAt: 1 })
      .lean()
      .exec();
  }

  private async resolveQualifiedPlayers(
    mode: GameMode,
    season: string,
    userIds: string[],
  ): Promise<LeaderboardPlayerDto[]> {
    const limited = userIds.slice(0, 32);
    const docs = await this.entryModel
      .find({ mode, season, userId: { $in: limited } })
      .lean()
      .exec();
    const order = new Map(limited.map((id, i) => [id, i]));
    return docs
      .sort((a, b) => (order.get(a.userId) ?? 0) - (order.get(b.userId) ?? 0))
      .map((e, i) => toPlayerDto(e, e.rank ?? i + 1));
  }

  private async aggregateRegions(
    mode: GameMode,
    season: string,
  ): Promise<RegionDistributionDto> {
    const agg = await this.entryModel
      .aggregate<{
        _id: Region;
        count: number;
      }>([
        { $match: { mode, season } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
      ])
      .exec();
    const total = agg.reduce((sum, r) => sum + r.count, 0) || 1;
    const byRegion = new Map(agg.map((r) => [r._id, r.count]));
    return REGION_VALUES.map((region) => ({
      region,
      share: (byRegion.get(region) ?? 0) / total,
    })).filter((r) => r.share > 0);
  }
}

function toPlayerDto(
  e: Pick<
    LeaderboardEntry,
    | 'userId'
    | 'username'
    | 'region'
    | 'countryCode'
    | 'tier'
    | 'rating'
    | 'elo'
    | 'wins'
    | 'losses'
    | 'draws'
    | 'recentForm'
    | 'streak'
    | 'isOnline'
    | 'isInMatch'
    | 'gameTags'
    | 'prevRank'
  >,
  rank: number,
): LeaderboardPlayerDto {
  const total = e.wins + e.losses + e.draws;
  return {
    id: e.userId,
    rank,
    prevRank: e.prevRank,
    name: e.username,
    region: e.region,
    countryCode: e.countryCode,
    tier: e.tier,
    rating: e.rating,
    elo: e.elo,
    wins: e.wins,
    losses: e.losses,
    draws: e.draws,
    winrate: total > 0 ? e.wins / total : 0,
    recentForm: e.recentForm ?? [],
    streak: e.streak,
    isOnline: e.isOnline,
    isInMatch: e.isInMatch,
    gameTags: e.gameTags ?? [],
  };
}

function currentSeason(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const q = Math.floor(now.getUTCMonth() / 3) + 1;
  return `${y}Q${q}`;
}
