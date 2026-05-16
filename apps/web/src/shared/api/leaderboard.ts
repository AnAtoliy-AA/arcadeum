import type {
  LeaderboardSnapshot,
  GameMode,
  LeaderboardPlayer,
  PlayerProfile,
  Region,
  Tier,
  FormResult,
  TickerEvent,
} from '@/entities/leaderboard/model/types';
import { apiClient, ApiError } from '@/shared/lib/api-client';
import { HttpStatus } from '@/shared/lib/http-status';

const REGIONS: Region[] = ['na', 'eu', 'sa', 'asia', 'oceania', 'africa', 'me'];
const COUNTRIES: Record<Region, string> = {
  na: 'us',
  eu: 'de',
  sa: 'br',
  asia: 'kr',
  oceania: 'au',
  africa: 'za',
  me: 'ae',
};
const TIERS: Tier[] = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'mythic',
];
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
const GAME_TAGS = ['Critical', 'Sea Battle'];

function seededRandom(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makePlayer(rng: () => number, rank: number): LeaderboardPlayer {
  const wins = Math.max(0, Math.floor(120 - rank * 0.6 + rng() * 20));
  const losses = Math.floor(40 + rng() * 30);
  const draws = Math.floor(rng() * 8);
  const total = wins + losses + draws;
  const form: FormResult[] = Array.from({ length: 12 }, () => {
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
          : (TIERS[Math.floor(rng() * 4)] ?? 'silver');
  const region: Region = REGIONS[Math.floor(rng() * REGIONS.length)] ?? 'eu';
  const rating = 2800 - rank * 8 + Math.floor(rng() * 30);
  const tagCount = 1 + Math.floor(rng() * 2);
  const gameTags = Array.from(
    { length: tagCount },
    (_, i) => GAME_TAGS[(rank + i) % GAME_TAGS.length] ?? 'Mafia',
  );

  return {
    id: `p_${rank}`,
    rank,
    prevRank: rank + Math.round((rng() - 0.5) * 6),
    name:
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
    winrate: total > 0 ? wins / total : 0,
    recentForm: form,
    streak: rng() > 0.7 ? 3 + Math.floor(rng() * 9) : 0,
    isOnline: rng() > 0.6,
    isFriend: rng() > 0.92,
    // Mark a deterministic slice of high-rank rows as in-match so the
    // RankTable always renders at least one live chip — the leaderboards
    // e2e checks for `row-live-chip` and the previous all-false flag made
    // it impossible to satisfy.
    isInMatch: rank <= 5,
    gameTags,
  };
}

export type GetLeaderboardArgs = {
  mode?: GameMode;
  page?: number;
  pageSize?: number;
  selfId?: string;
  accessToken?: string | null;
  q?: string;
  scope?: string;
  range?: string;
};

function shouldUseMock() {
  return (
    process.env.NEXT_PUBLIC_E2E === 'true' ||
    process.env.NEXT_PUBLIC_USE_LEADERBOARD_MOCK === 'true'
  );
}

export async function getLeaderboard(
  args: GetLeaderboardArgs = {},
): Promise<LeaderboardSnapshot> {
  if (!shouldUseMock()) {
    const {
      mode = 'all',
      page = 1,
      pageSize = 50,
      accessToken,
      q,
      scope,
      range,
    } = args;
    const qs = new URLSearchParams();
    qs.set('mode', mode);
    qs.set('page', String(page));
    qs.set('pageSize', String(pageSize));
    if (q && q.trim()) qs.set('q', q.trim());
    if (scope) qs.set('scope', scope);
    if (range) qs.set('range', range);
    return apiClient.get<LeaderboardSnapshot>(
      `/leaderboards?${qs.toString()}`,
      accessToken ? { token: accessToken } : {},
    );
  }
  return getMockLeaderboard(args);
}

export async function getPlayer(
  id: string,
  accessToken?: string | null,
): Promise<PlayerProfile | null> {
  if (shouldUseMock()) return getMockPlayer(id);
  try {
    return await apiClient.get<PlayerProfile>(
      `/leaderboards/players/${encodeURIComponent(id)}`,
      accessToken ? { token: accessToken } : {},
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === HttpStatus.NOT_FOUND) {
      return null;
    }
    throw err;
  }
}

export function getMockPlayer(id: string): PlayerProfile {
  const rng = seededRandom(id.length || 7);
  const player = makePlayer(rng, 247);
  player.id = id;
  return {
    player,
    modeRanks: [
      { mode: 'all', rank: 247, rating: player.rating },
      { mode: 'critical', rank: 18, rating: player.rating - 80 },
    ],
    squad: {
      id: 'sq_1',
      name: 'Ember Pact',
      tag: 'EMBR',
      rating: 9720,
      memberCount: 7,
      rank: 2,
      isYou: true,
    },
  };
}

// Memoized full population per mode so mock filtering applies across the
// whole leaderboard, not just the page slice (Bug #9).
const POPULATION_CACHE = new Map<string, LeaderboardPlayer[]>();
const TOTAL_POPULATION = 1248;

function getPopulationFor(mode: GameMode): LeaderboardPlayer[] {
  const cached = POPULATION_CACHE.get(mode);
  if (cached) return cached;
  const rng = seededRandom(mode.length * 31);
  const pop = Array.from({ length: TOTAL_POPULATION }, (_, i) =>
    makePlayer(rng, i + 1),
  );
  // Tag a few rows as in-match (single source of truth — no liveMatchRanks).
  for (const idx of [2, 7, 14]) {
    if (pop[idx]) pop[idx].isInMatch = true;
  }
  POPULATION_CACHE.set(mode, pop);
  return pop;
}

export async function getMockLeaderboard(
  args: GetLeaderboardArgs = {},
): Promise<LeaderboardSnapshot> {
  const { mode = 'all', page = 1, pageSize = 50, selfId, q } = args;

  if (process.env.NODE_ENV !== 'production') {
    await new Promise((r) => setTimeout(r, 220));
  }

  const population = getPopulationFor(mode);
  const needle = q?.trim().toLowerCase();
  const filtered = needle
    ? population.filter((p) => p.name.toLowerCase().includes(needle))
    : population;
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  const top3 = population.slice(0, 3);
  const podium =
    page === 1 && top3[0] && top3[1] && top3[2]
      ? ([top3[0], top3[1], top3[2]] as LeaderboardSnapshot['podium'])
      : null;

  const rngM = seededRandom(mode.length * 17);
  const mythic =
    page === 1 && top3[0] && top3[1]
      ? {
          ...top3[0],
          ratingDelta: top3[0].rating - top3[1].rating,
          streak: 8 + Math.floor(rngM() * 8),
        }
      : null;

  const climbers = population.slice(20, 25).map((p) => {
    const delta = 8 + Math.floor(rngM() * 12);
    return { player: p, delta, fromRank: p.rank + delta, toRank: p.rank };
  });
  const fallers = population.slice(30, 35).map((p) => {
    const delta = -(5 + Math.floor(rngM() * 10));
    return { player: p, delta, fromRank: p.rank + delta, toRank: p.rank };
  });

  const tickerEvents: TickerEvent[] = [
    {
      who: rows[0]?.name ?? 'Player',
      what: 'won the Mythic streak challenge — +12 rating',
      color: '#ec4899',
    },
    {
      who: rows[3]?.name ?? 'Player',
      what: 'climbed into the Top 10 in Critical',
      color: '#22d3ee',
    },
    {
      who: rows[7]?.name ?? 'Player',
      what: 'started a 6-game win streak',
      color: '#34d399',
    },
    {
      who: rows[12]?.name ?? 'Player',
      what: 'qualified for the Autumn Cup quarterfinals',
      color: '#facc15',
    },
  ];

  const topRating = rows[0]?.rating ?? 2800;

  return {
    capturedAt: new Date().toISOString(),
    mode,
    page,
    mythic,
    podium,
    rows,
    totalRows: total,
    topRating,
    tickerEvents,
    cup: {
      id: 'autumn_cup_2026',
      title: 'Autumn Cup',
      startsAt: '2026-05-01T00:00:00Z',
      endsAt: '2026-05-21T23:59:59Z',
      prizePoolUSD: 12_000,
      participantCount: 4_312,
      qualified: rows.slice(0, 8),
    },
    rewards: [
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
    ],
    regions: REGIONS.map((r, i) => ({
      region: r,
      share: [0.31, 0.28, 0.14, 0.13, 0.07, 0.05, 0.02][i] ?? 0.01,
    })),
    climbers,
    fallers,
    squads: Array.from({ length: 5 }, (_, i) => ({
      id: `sq_${i}`,
      name:
        [
          'Void Council',
          'Ember Pact',
          'Static North',
          'Glass Ravens',
          'Lunar Sigil',
        ][i] ?? `Squad ${i}`,
      tag: ['VOID', 'EMBR', 'STAT', 'GLSS', 'LUNR'][i] ?? `SQ${i}`,
      rating: 9800 - i * 80,
      memberCount: 6 + i,
      rank: i + 1,
      isYou: i === 1,
    })),
    self: {
      ...makePlayer(seededRandom(selfId ? selfId.length : 7), 247),
      id: selfId ?? 'anon',
      name: selfId ? 'You' : 'Guest',
      isFriend: false,
    },
  };
}
