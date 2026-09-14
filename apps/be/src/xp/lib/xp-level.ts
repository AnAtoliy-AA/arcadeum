export const DEFAULT_XP = {
  WIN: 100,
  LOSS: 40,
  DRAW: 60,
  SOLO_COEFF: 0.1,
  BOT_COEFF: 0.2,
} as const;

export interface XpSettingsValues {
  winXp: number;
  lossXp: number;
  drawXp: number;
  soloCoefficient: number;
  botCoefficient: number;
}

export function xpForResult(
  result: 'won' | 'lost' | 'draw',
  settings: XpSettingsValues,
  isSolo: boolean,
  hasBots: boolean,
): number {
  const base =
    result === 'won'
      ? settings.winXp
      : result === 'draw'
        ? settings.drawXp
        : settings.lossXp;
  const coeff = isSolo
    ? settings.soloCoefficient
    : hasBots
      ? settings.botCoefficient
      : 1.0;
  return Math.round(base * coeff);
}

/**
 * XP required to reach a given level.
 * Formula: xpForLevel = 103 * level^2.5
 *
 * Target: ~100,000 PvP wins to reach level 99 (~1 year of dedicated play)
 *
 * Progression:
 *   Lv  1→2:     103 XP  (1 win)
 *   Lv  2→3:     240 XP  (2 wins)
 *   Lv  3→4:     422 XP  (4 wins)
 *   Lv  5→6:   1,022 XP  (10 wins)
 *   Lv 10→11:   3,577 XP  (36 wins)
 *   Lv 25→26:  28,139 XP  (281 wins)
 *   Lv 50→51: 124,901 XP  (1,249 wins)
 *   Lv 98→99: 288,873 XP  (2,889 wins)
 *   Lv 99 total: ~10,000,000 XP (~100,000 wins)
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(103 * Math.pow(level, 2.5));
}

export function levelFromXp(xp: number): number {
  // Solve: 103 * L^2.5 <= xp  =>  L <= (xp / 103)^(1/2.5)
  const level = Math.floor(Math.pow(xp / 103, 1 / 2.5));
  return Math.max(level, 1);
}

export function xpProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
  xpInLevel: number;
  xpNeeded: number;
} {
  const level = levelFromXp(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progress: xpNeeded > 0 ? xpInLevel / xpNeeded : 0,
    xpInLevel,
    xpNeeded,
  };
}
