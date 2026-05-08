import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LeaderboardEntry,
  type GameMode,
  GAME_MODE_VALUES,
} from './schemas/leaderboard-entry.schema';
import { Cup } from './schemas/cup.schema';
import { Squad } from './schemas/squad.schema';
import { TickerEvent } from './schemas/ticker-event.schema';
import { LeaderboardsGateway } from './leaderboards.gateway';
import { LeaderboardsCacheService } from './leaderboards.cache';
import { GameHistoryStatsService } from '../games/history/game-history-stats.service';
import {
  MODE_TO_GAME_ID,
  aggregateRegionsFromReal,
  hydratePlayer,
  type RealLeaderboardEntry,
} from './leaderboards.hydrate';
import type {
  CupSnapshotDto,
  LeaderboardPlayerDto,
  LeaderboardSnapshotDto,
  MythicPlayerDto,
  PlayerProfileDto,
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
  q?: string;
  scope?: string;
  range?: string;
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
    private readonly cache: LeaderboardsCacheService,
    @Inject(forwardRef(() => GameHistoryStatsService))
    private readonly historyStats: GameHistoryStatsService,
  ) {}

  // De-dupe in-flight upstream calls so concurrent requests don't all run
  // the full-collection scan.
  private inFlight = new Map<
    string,
    Promise<Awaited<ReturnType<GameHistoryStatsService['getLeaderboard']>>>
  >();

  /**
   * Cached + de-duped wrapper around historyStats.getLeaderboard. The
   * upstream scans every completed GameSession + GameRoom; without this
   * each request would pay that cost. Cache TTL matches the snapshot
   * cache (30s) and capture / markInMatch invalidate both layers.
   */
  private async cachedRealLeaderboard(
    limit: number,
    offset: number,
    gameId: string | undefined,
  ) {
    const key = LeaderboardsCacheService.rawKeyFor({ gameId, limit, offset });
    const cached =
      this.cache.getRaw<
        Awaited<ReturnType<GameHistoryStatsService['getLeaderboard']>>
      >(key);
    if (cached) return cached;
    const existing = this.inFlight.get(key);
    if (existing) return existing;
    const fresh = this.historyStats
      .getLeaderboard(limit, offset, gameId)
      .then((value) => {
        this.cache.setRaw(key, value);
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });
    this.inFlight.set(key, fresh);
    return fresh;
  }

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
    if (matched > 0) {
      this.cache.invalidateAll();
      if (mode) {
        const season = currentSeason();
        for (const userId of userIds) {
          this.gateway.emitEntryUpdated({ userId, mode, season, isInMatch });
        }
      }
    }
    return matched;
  }

  invalidateCache(): void {
    this.cache.invalidateAll();
  }

  async getPlayer(userId: string): Promise<PlayerProfileDto | null> {
    // Pull all leaderboards (one per mode) and find the player by id; the
    // user's primary rank is whatever the 'all' tab shows. Per-mode ranks
    // come from the per-game leaderboards.
    const perMode = await Promise.all(
      GAME_MODE_VALUES.map(async (mode) => {
        const gameId = MODE_TO_GAME_ID[mode];
        const board = await this.cachedRealLeaderboard(500, 0, gameId);
        const entry = board.entries.find((e) => e.playerId === userId);
        return entry ? { mode, entry } : null;
      }),
    );
    const found = perMode.filter(
      (m): m is { mode: GameMode; entry: RealLeaderboardEntry } => m != null,
    );
    if (found.length === 0) return null;

    const primary =
      found.find((m) => m.mode === 'all') ??
      [...found].sort((a, b) => b.entry.wins - a.entry.wins)[0];
    const modeRanks = found.map(({ mode, entry }) => ({
      mode,
      rank: entry.rank,
      rating: 1500 + entry.wins * 12 - entry.losses * 4,
    }));

    const squadDoc = await this.squadModel
      .findOne({ memberUserIds: userId })
      .lean()
      .exec();

    const squad: SquadDto | undefined = squadDoc
      ? {
          id: squadDoc.squadId,
          name: squadDoc.name,
          tag: squadDoc.tag,
          rating: squadDoc.rating,
          memberCount: squadDoc.memberCount,
          rank: squadDoc.rank ?? 0,
          isYou: true,
        }
      : undefined;

    return {
      player: hydratePlayer(primary.entry),
      modeRanks,
      squad,
    };
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
    const trimmedQ = args.q?.trim();
    // TODO(ARC-588-scope-range): scope ('global'|'friends'|...) and range
    // ('week'|'month'|...) are accepted on the wire and bust the cache, but
    // are not yet applied to the upstream filter. Implement once the
    // games-history layer supports them.

    const cacheKey = LeaderboardsCacheService.keyFor({
      mode,
      page,
      pageSize,
      q: trimmedQ,
      scope: args.scope,
      range: args.range,
      selfUserId: args.selfUserId,
    });
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Pull a window of real leaderboard data from completed game history.
    // Same source the Stats page uses, so the new page never falls out of
    // sync with the stats tab.
    const gameId = MODE_TO_GAME_ID[mode];
    const realLimit = Math.min(500, pageSize * page + pageSize);
    const real = await this.cachedRealLeaderboard(realLimit, 0, gameId);

    const filtered = trimmedQ
      ? real.entries.filter((e) =>
          e.username.toLowerCase().includes(trimmedQ.toLowerCase()),
        )
      : real.entries;

    const totalRows = trimmedQ ? filtered.length : real.total;
    const start = (page - 1) * pageSize;
    const pageEntries = filtered.slice(start, start + pageSize);
    const rows = pageEntries.map((e) => hydratePlayer(e));

    // Mythic + podium come from page 1's top of the unfiltered window so a
    // search that hides the top players still shows the real mythic.
    const top = real.entries.slice(0, 3).map((e) => hydratePlayer(e));
    const podium: LeaderboardSnapshotDto['podium'] =
      page === 1 && top[0] && top[1] && top[2]
        ? [top[0], top[1], top[2]]
        : null;
    const mythic: MythicPlayerDto | null =
      page === 1 && top[0] && top[1]
        ? {
            ...top[0],
            ratingDelta: top[0].rating - top[1].rating,
            streak: top[0].streak ?? 0,
          }
        : null;

    // Climbers / fallers / cup / squads / ticker / regions don't have a real
    // signal yet — leave the rails empty rather than show fabricated data.
    // Synthetic sources (cup, squads, ticker) still come from the seed
    // collections so dev still sees the cinematic frame.
    const [cup, squadsDocs, tickerEvents] = await Promise.all([
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
    ]);

    const regionAgg = aggregateRegionsFromReal(real.entries);

    const squadsDto: SquadDto[] = squadsDocs.map((s, i) => ({
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
          qualified: top,
        }
      : null;

    const selfRaw = args.selfUserId
      ? real.entries.find((e) => e.playerId === args.selfUserId)
      : undefined;
    const self: LeaderboardPlayerDto | null = selfRaw
      ? hydratePlayer(selfRaw)
      : null;

    const tickerEventsDto: TickerEventDto[] = tickerEvents.map((e) => ({
      who: e.who,
      what: e.what,
      color: e.color,
    }));

    const snapshot: LeaderboardSnapshotDto = {
      capturedAt: new Date().toISOString(),
      mode,
      page,
      mythic,
      podium,
      rows,
      totalRows,
      cup: cupDto,
      rewards: REWARDS,
      regions: regionAgg,
      climbers: [],
      fallers: [],
      squads: squadsDto,
      self,
      tickerEvents: tickerEventsDto,
      topRating: top[0]?.rating ?? 0,
    };
    this.cache.set(cacheKey, snapshot);
    return snapshot;
  }

  private async findActiveCup() {
    const now = new Date();
    return this.cupModel
      .findOne({ active: true, endsAt: { $gte: now } })
      .sort({ endsAt: 1 })
      .lean()
      .exec();
  }
}

function currentSeason(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const q = Math.floor(now.getUTCMonth() / 3) + 1;
  return `${y}Q${q}`;
}
