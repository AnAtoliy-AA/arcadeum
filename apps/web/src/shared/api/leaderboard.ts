import type {
  LeaderboardSnapshot,
  GameMode,
  LeaderboardPlayer,
  Region,
  Tier,
  FormResult,
} from '@/entities/leaderboard/model/types';

const REGIONS: Region[] = ['na', 'eu', 'sa', 'asia', 'oceania', 'africa', 'me'];
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
  const form: FormResult[] = Array.from({ length: 7 }, () => {
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

  return {
    id: `p_${rank}`,
    rank,
    prevRank: rank + Math.round((rng() - 0.5) * 6),
    name:
      (NAMES[(rank - 1) % NAMES.length] ?? 'Player') +
      (rank > NAMES.length ? rank : ''),
    region: REGIONS[Math.floor(rng() * REGIONS.length)] ?? 'eu',
    tier,
    rating: 2800 - rank * 8 + Math.floor(rng() * 30),
    wins,
    losses,
    draws,
    winrate: total > 0 ? wins / total : 0,
    recentForm: form,
    isOnline: rng() > 0.6,
    isFriend: rng() > 0.92,
  };
}

export type GetLeaderboardArgs = {
  mode?: GameMode;
  page?: number;
  pageSize?: number;
  selfId?: string;
};

export async function getLeaderboard(
  args: GetLeaderboardArgs = {},
): Promise<LeaderboardSnapshot> {
  const { mode = 'all', page = 1, pageSize = 50, selfId } = args;
  const rng = seededRandom(mode.length * 31 + page);

  if (process.env.NODE_ENV !== 'production') {
    await new Promise((r) => setTimeout(r, 220));
  }

  const total = 1248;
  const start = (page - 1) * pageSize + 1;
  const rows = Array.from({ length: pageSize }, (_, i) =>
    makePlayer(rng, start + i),
  );

  const podium =
    page === 1
      ? ([rows[0], rows[1], rows[2]] as LeaderboardSnapshot['podium'])
      : null;

  const mythic =
    page === 1 && rows[0] && rows[1]
      ? {
          ...rows[0],
          ratingDelta: rows[0].rating - rows[1].rating,
          streak: 8 + Math.floor(rng() * 8),
        }
      : null;

  return {
    capturedAt: new Date().toISOString(),
    mode,
    mythic,
    podium,
    rows,
    totalRows: total,
    cup: {
      id: 'autumn_cup_2026',
      title: 'Autumn Cup',
      startsAt: '2026-05-01T00:00:00Z',
      endsAt: '2026-05-21T23:59:59Z',
      prizePoolUSD: 12_000,
      participantCount: 4_312,
    },
    rewards: [
      {
        tier: 'mythic',
        rankFrom: 1,
        rankTo: 1,
        rewardLabel: 'rewards.mythic',
      },
      {
        tier: 'diamond',
        rankFrom: 2,
        rankTo: 10,
        rewardLabel: 'rewards.diamond',
      },
      {
        tier: 'platinum',
        rankFrom: 11,
        rankTo: 50,
        rewardLabel: 'rewards.platinum',
      },
      {
        tier: 'gold',
        rankFrom: 51,
        rankTo: 200,
        rewardLabel: 'rewards.gold',
      },
    ],
    regions: REGIONS.map((r, i) => ({
      region: r,
      share: [0.31, 0.28, 0.14, 0.13, 0.07, 0.05, 0.02][i] ?? 0.01,
    })),
    climbers: rows.slice(20, 25).map((p) => ({
      player: p,
      delta: 8 + Math.floor(rng() * 12),
    })),
    fallers: rows.slice(30, 35).map((p) => ({
      player: p,
      delta: -(5 + Math.floor(rng() * 10)),
    })),
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
    })),
    self: {
      ...makePlayer(seededRandom(selfId ? selfId.length : 7), 247),
      id: selfId ?? 'anon',
      name: selfId ? 'You' : 'Guest',
      isFriend: false,
    },
  };
}

// TODO(ARC-588-be): replace with real call:
//   const res = await apiClient.get('/leaderboard', { params: args });
//   return res.data as LeaderboardSnapshot;
