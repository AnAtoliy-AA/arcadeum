import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  LeaderboardEntry,
  GAME_MODE_VALUES,
  REGION_VALUES,
  TIER_VALUES,
  type GameMode,
  type Region,
  type Tier,
  type FormResult,
} from './schemas/leaderboard-entry.schema';
import { Cup } from './schemas/cup.schema';
import { Squad } from './schemas/squad.schema';
import { TickerEvent } from './schemas/ticker-event.schema';

const NAMES = [
  'Nightblade',
  'Frostbyte',
  'VoidPriest',
  'EmberQueen',
  'PixelMage',
  'GhostRoot',
  'NeonRunes',
  'StaticPulse',
  'WolfsBane',
  'OracleX',
  'CrimsonOwl',
  'AzurePhantom',
  'IronVeil',
  'CipherFang',
  'MoonRift',
  'Specter',
  'Vortex',
  'Glimmer',
  'Hollowind',
  'Tessera',
];
const COUNTRIES: Record<Region, string> = {
  na: 'us',
  eu: 'de',
  sa: 'br',
  asia: 'kr',
  oceania: 'au',
  africa: 'za',
  me: 'ae',
};
const GAME_TAGS = ['Critical', 'Sea Battle'];

function seededRandom(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export type SeedOptions = {
  rowsPerMode?: number;
  season?: string;
};

export type SeedSummary = {
  season: string;
  modes: GameMode[];
  entriesInserted: number;
  cupsInserted: number;
  squadsInserted: number;
  tickerEventsInserted: number;
};

@Injectable()
export class LeaderboardsSeederService implements OnModuleInit {
  private readonly logger = new Logger(LeaderboardsSeederService.name);

  constructor(
    @InjectModel(LeaderboardEntry.name)
    private readonly entryModel: Model<LeaderboardEntry>,
    @InjectModel(Cup.name) private readonly cupModel: Model<Cup>,
    @InjectModel(Squad.name) private readonly squadModel: Model<Squad>,
    @InjectModel(TickerEvent.name)
    private readonly tickerEventModel: Model<TickerEvent>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;
    if (process.env.NODE_ENV === 'test') return;
    if (process.env.LEADERBOARDS_AUTO_SEED === 'false') return;
    try {
      await this.seedIfEmpty();
    } catch (err) {
      // Mongo not running yet, or some other infra issue — don't crash boot.
      this.logger.warn(
        `Auto-seed skipped: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  /**
   * Seed only when the current season has no entries. Idempotent across
   * BE restarts: a populated DB is never touched.
   */
  async seedIfEmpty(options: SeedOptions = {}): Promise<SeedSummary | null> {
    const season = options.season ?? currentSeason();
    const existing = await this.entryModel.countDocuments({ season }).exec();
    if (existing > 0) {
      this.logger.debug(
        `Auto-seed skipped — season=${season} already has ${existing} entries.`,
      );
      return null;
    }
    this.logger.log(`Auto-seeding leaderboards for season=${season}.`);
    return this.seed({ ...options, season });
  }

  async seed(options: SeedOptions = {}): Promise<SeedSummary> {
    const rowsPerMode = options.rowsPerMode ?? 200;
    const season = options.season ?? currentSeason();

    // Idempotent — clear current season + cup/squads/events before re-inserting.
    await Promise.all([
      this.entryModel.deleteMany({ season }).exec(),
      this.cupModel.deleteMany({}).exec(),
      this.squadModel.deleteMany({}).exec(),
      this.tickerEventModel.deleteMany({}).exec(),
    ]);

    const entries: Partial<LeaderboardEntry>[] = [];
    for (const mode of GAME_MODE_VALUES) {
      const rng = seededRandom(mode.length * 1009 + season.length);
      for (let i = 0; i < rowsPerMode; i++) {
        entries.push(buildEntry(rng, mode, season, i + 1));
      }
    }
    await this.entryModel.insertMany(entries);

    const cup = await this.cupModel.create({
      cupId: `autumn_cup_${new Date().getUTCFullYear()}`,
      title: 'Autumn Cup',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      prizePoolUSD: 12_000,
      participantCount: 4_312,
      qualifiedUserIds: entries.slice(0, 8).map((e) => e.userId ?? ''),
      active: true,
    });

    const squadNames = [
      { name: 'Void Council', tag: 'VOID' },
      { name: 'Ember Pact', tag: 'EMBR' },
      { name: 'Static North', tag: 'STAT' },
      { name: 'Glass Ravens', tag: 'GLSS' },
      { name: 'Lunar Sigil', tag: 'LUNR' },
    ];
    const squads = await this.squadModel.insertMany(
      squadNames.map((s, i) => ({
        squadId: `sq_${i}`,
        name: s.name,
        tag: s.tag,
        rating: 9800 - i * 80,
        memberCount: 6 + i,
        memberUserIds: [],
        rank: i + 1,
      })),
    );

    const top4 = entries.slice(0, 4);
    const tickerInputs = [
      {
        who: top4[0]?.username ?? 'Player',
        what: 'won the Mythic streak challenge — +12 rating',
        color: '#ec4899',
      },
      {
        who: top4[1]?.username ?? 'Player',
        what: 'climbed into the Top 10 in Critical',
        color: '#22d3ee',
      },
      {
        who: top4[2]?.username ?? 'Player',
        what: 'started a 6-game win streak',
        color: '#34d399',
      },
      {
        who: top4[3]?.username ?? 'Player',
        what: 'qualified for the Autumn Cup quarterfinals',
        color: '#facc15',
      },
    ];
    const tickerExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const tickers = await this.tickerEventModel.insertMany(
      tickerInputs.map((e) => ({
        ...e,
        occurredAt: new Date(),
        expiresAt: tickerExpiresAt,
      })),
    );

    const summary: SeedSummary = {
      season,
      modes: [...GAME_MODE_VALUES],
      entriesInserted: entries.length,
      cupsInserted: cup ? 1 : 0,
      squadsInserted: squads.length,
      tickerEventsInserted: tickers.length,
    };
    this.logger.log(
      `Leaderboards seeded — season=${season} entries=${summary.entriesInserted}`,
    );
    return summary;
  }
}

function buildEntry(
  rng: () => number,
  mode: GameMode,
  season: string,
  rank: number,
): Partial<LeaderboardEntry> {
  const wins = Math.max(0, Math.floor(120 - rank * 0.6 + rng() * 20));
  const losses = Math.floor(40 + rng() * 30);
  const draws = Math.floor(rng() * 8);
  const recentForm: FormResult[] = Array.from({ length: 12 }, () => {
    const r = rng();
    return r > 0.4 ? 'W' : r > 0.15 ? 'L' : 'D';
  });
  const tier: Tier =
    rank <= 1
      ? 'mythic'
      : rank <= 10
        ? 'diamond'
        : rank <= 50
          ? 'platinum'
          : (TIER_VALUES[Math.floor(rng() * 4)] ?? 'silver');
  const region: Region =
    REGION_VALUES[Math.floor(rng() * REGION_VALUES.length)] ?? 'eu';
  const rating = 2800 - rank * 8 + Math.floor(rng() * 30);
  const tagCount = 1 + Math.floor(rng() * 2);
  const gameTags = Array.from(
    { length: tagCount },
    (_, i) => GAME_TAGS[(rank + i) % GAME_TAGS.length] ?? 'Critical',
  );
  return {
    userId: `seed_${mode}_${rank}`,
    mode,
    season,
    username:
      (NAMES[(rank - 1) % NAMES.length] ?? 'Player') +
      (rank > NAMES.length ? rank : ''),
    region,
    countryCode: COUNTRIES[region],
    tier,
    rating,
    elo: rating + 80,
    wins,
    losses,
    draws,
    recentForm,
    streak: rng() > 0.7 ? 3 + Math.floor(rng() * 9) : 0,
    isOnline: rng() > 0.6,
    isInMatch: false,
    gameTags,
    rank,
    prevRank: rank + Math.round((rng() - 0.5) * 6),
  };
}

function currentSeason(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const q = Math.floor(now.getUTCMonth() / 3) + 1;
  return `${y}Q${q}`;
}
