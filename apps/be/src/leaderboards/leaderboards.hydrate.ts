import {
  REGION_VALUES,
  type FormResult,
  type GameMode,
  type Region,
  type Tier,
} from './schemas/leaderboard-entry.schema';
import type {
  LeaderboardPlayerDto,
  RegionDistributionDto,
} from './dtos/leaderboard-snapshot.dto';

export const MODE_TO_GAME_ID: Record<GameMode, string | undefined> = {
  all: undefined,
  critical: 'critical_v1',
  sea_battle: 'sea_battle_v1',
};

const TIERS_BY_TOP: Tier[] = [
  'mythic',
  'diamond',
  'diamond',
  'platinum',
  'platinum',
  'gold',
  'gold',
  'silver',
  'silver',
  'bronze',
];

const COUNTRIES_BY_REGION: Record<Region, string> = {
  na: 'us',
  eu: 'de',
  sa: 'br',
  asia: 'kr',
  oceania: 'au',
  africa: 'za',
  me: 'ae',
};

export type RealLeaderboardEntry = {
  rank: number;
  playerId: string;
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
};

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h || 1;
}

function rngFor(input: string) {
  let s = hashSeed(input);
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return (s % 100_000) / 100_000;
  };
}

function tierForRank(rank: number): Tier {
  return (
    TIERS_BY_TOP[rank - 1] ??
    (rank <= 50
      ? 'platinum'
      : rank <= 200
        ? 'gold'
        : rank <= 500
          ? 'silver'
          : 'bronze')
  );
}

function synthesizeForm(rng: () => number, winRatePct: number): FormResult[] {
  const wr = Math.max(0, Math.min(1, winRatePct / 100));
  return Array.from({ length: 12 }, () => {
    const r = rng();
    if (r < wr * 0.85) return 'W';
    if (r < wr * 0.85 + 0.1) return 'D';
    return 'L';
  });
}

function computeStreak(form: FormResult[]): number {
  let n = 0;
  for (let i = form.length - 1; i >= 0; i--) {
    if (form[i] === 'W') n++;
    else break;
  }
  return n;
}

function pickRegion(rng: () => number): Region {
  return REGION_VALUES[Math.floor(rng() * REGION_VALUES.length)] ?? 'eu';
}

/**
 * Take a real leaderboard entry (computed from completed sessions) and
 * derive the synthetic per-player fields the page needs (region, tier,
 * recent form, streak, etc.) deterministically from the userId so they
 * stay stable across requests.
 */
export function hydratePlayer(
  real: RealLeaderboardEntry,
): LeaderboardPlayerDto {
  const rng = rngFor(real.playerId);
  const region = pickRegion(rng);
  const tier = tierForRank(real.rank);
  // Derive a rating from real wins/losses so it lines up with reality but
  // still differentiates ties on the page.
  const rating =
    1500 + real.wins * 12 - real.losses * 4 + Math.floor(rng() * 30);
  const recentForm = synthesizeForm(rng, real.winRate);
  return {
    id: real.playerId,
    rank: real.rank,
    name: real.username,
    region,
    countryCode: COUNTRIES_BY_REGION[region],
    tier,
    rating,
    elo: rating + 80,
    wins: real.wins,
    losses: real.losses,
    draws: 0,
    winrate: real.winRate / 100,
    recentForm,
    streak: computeStreak(recentForm),
    isOnline: rng() > 0.6,
    isFriend: false,
    isInMatch: false,
    gameTags: [],
  };
}

export function aggregateRegionsFromReal(
  entries: RealLeaderboardEntry[],
): RegionDistributionDto {
  if (entries.length === 0) return [];
  const counts = new Map<Region, number>();
  for (const e of entries) {
    const region = pickRegion(rngFor(e.playerId));
    counts.set(region, (counts.get(region) ?? 0) + 1);
  }
  const total = entries.length;
  return REGION_VALUES.flatMap((region) => {
    const count = counts.get(region) ?? 0;
    if (count === 0) return [];
    return [{ region, share: count / total }];
  });
}
