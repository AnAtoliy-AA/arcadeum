import {
  GAME_MODE_VALUES,
  type FormResult,
  type GameMode,
  type Region,
  type Tier,
} from './schemas/leaderboard-entry.schema';
import { regionForCountry } from './country-regions';
import type {
  LeaderboardPlayerDto,
  RegionDistributionDto,
} from './dtos/leaderboard-snapshot.dto';

export const MODE_TO_GAME_ID: Record<GameMode, string | undefined> =
  Object.fromEntries(
    GAME_MODE_VALUES.map((mode) => [mode, mode === 'all' ? undefined : mode]),
  );

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

export type RealLeaderboardEntry = {
  rank: number;
  playerId: string;
  username: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  elo?: number;
  /** Real ISO 3166-1 alpha-2 country code from the user's IP (lowercase). */
  countryCode?: string | null;
  role?: string | null;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
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

/**
 * Take a real leaderboard entry (computed from completed sessions) and
 * derive the per-player fields the page needs (tier, recent form, streak,
 * rating, etc.). Region and country come from the user's real geo data
 * resolved via IP lookup — never fabricated. Players without a known
 * country get no region/country and the UI falls back gracefully.
 */
export function hydratePlayer(
  real: RealLeaderboardEntry,
): LeaderboardPlayerDto {
  const rng = rngFor(real.playerId);
  const countryCode = real.countryCode?.toLowerCase() || undefined;
  const region: Region | undefined = regionForCountry(countryCode);
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
    countryCode,
    tier,
    rating,
    elo: real.elo ?? rating + 80,
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
    role: real.role ?? null,
    equippedAvatarId: real.equippedAvatarId ?? null,
    equippedBadgeId: real.equippedBadgeId ?? null,
    equippedNameColorId: real.equippedNameColorId ?? null,
    equippedFrameId: real.equippedFrameId ?? null,
    equippedAuraId: real.equippedAuraId ?? null,
    equippedBannerId: real.equippedBannerId ?? null,
  };
}

export function aggregateRegionsFromReal(
  entries: RealLeaderboardEntry[],
): RegionDistributionDto {
  if (entries.length === 0) return [];
  const counts = new Map<Region, number>();
  let known = 0;
  for (const e of entries) {
    const region = regionForCountry(e.countryCode);
    if (!region) continue;
    known++;
    counts.set(region, (counts.get(region) ?? 0) + 1);
  }
  if (known === 0) return [];
  return [...counts.entries()]
    .map(([region, count]) => ({ region, share: count / known }))
    .sort((a, b) => b.share - a.share);
}
