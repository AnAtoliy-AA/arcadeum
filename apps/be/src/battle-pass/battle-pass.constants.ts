/**
 * Static definition of the current Battle Pass season. Seasons are not
 * admin-managed yet — the active one lives here. XP is derived read-only from a
 * player's match history (see {@link xpForStats}); progression is therefore a
 * reflection of real play rather than a separate write path.
 */

export type BattlePassReward = {
  /** 'coins' | 'gems' | 'cosmetic' — what the player receives. */
  type: 'coins' | 'gems' | 'cosmetic';
  /** Amount for currency rewards; omitted for cosmetics. */
  amount?: number;
  /** Display label (e.g. cosmetic name / "150 Coins"). */
  label: string;
};

export type BattlePassTier = {
  tier: number;
  xpRequired: number;
  freeReward: BattlePassReward;
  premiumReward: BattlePassReward;
};

export type BattlePassSeason = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  tiers: BattlePassTier[];
};

export const CURRENT_SEASON: BattlePassSeason = {
  id: 'season-1',
  title: 'Season 1 — Genesis',
  startsAt: '2026-05-01T00:00:00.000Z',
  endsAt: '2026-07-31T23:59:59.000Z',
  tiers: [
    {
      tier: 1,
      xpRequired: 0,
      freeReward: { type: 'coins', amount: 100, label: '100 Coins' },
      premiumReward: { type: 'coins', amount: 300, label: '300 Coins' },
    },
    {
      tier: 2,
      xpRequired: 150,
      freeReward: { type: 'coins', amount: 150, label: '150 Coins' },
      premiumReward: { type: 'gems', amount: 20, label: '20 Gems' },
    },
    {
      tier: 3,
      xpRequired: 400,
      freeReward: { type: 'coins', amount: 200, label: '200 Coins' },
      premiumReward: { type: 'cosmetic', label: 'Genesis Frame' },
    },
    {
      tier: 4,
      xpRequired: 750,
      freeReward: { type: 'coins', amount: 250, label: '250 Coins' },
      premiumReward: { type: 'gems', amount: 40, label: '40 Gems' },
    },
    {
      tier: 5,
      xpRequired: 1200,
      freeReward: { type: 'gems', amount: 10, label: '10 Gems' },
      premiumReward: { type: 'cosmetic', label: 'Aurora Aura' },
    },
    {
      tier: 6,
      xpRequired: 1800,
      freeReward: { type: 'coins', amount: 350, label: '350 Coins' },
      premiumReward: { type: 'gems', amount: 60, label: '60 Gems' },
    },
    {
      tier: 7,
      xpRequired: 2600,
      freeReward: { type: 'coins', amount: 450, label: '450 Coins' },
      premiumReward: { type: 'cosmetic', label: 'Genesis Banner' },
    },
    {
      tier: 8,
      xpRequired: 3600,
      freeReward: { type: 'gems', amount: 25, label: '25 Gems' },
      premiumReward: { type: 'cosmetic', label: 'Mythic Genesis Avatar' },
    },
  ],
};

/** Roles that unlock the premium reward lane. */
const PREMIUM_ROLES = new Set(['premium', 'vip', 'supporter']);

export function isPremiumRole(role?: string | null): boolean {
  return role ? PREMIUM_ROLES.has(role) : false;
}

/** Derive season XP from a player's lifetime match stats. */
export function xpForStats(totalGames: number, wins: number): number {
  return totalGames * 10 + wins * 40;
}

/** Highest tier number unlocked at the given XP (0 if none — tier 1 is xp 0). */
export function currentTierForXp(xp: number): number {
  let current = 0;
  for (const t of CURRENT_SEASON.tiers) {
    if (xp >= t.xpRequired) current = t.tier;
  }
  return current;
}
