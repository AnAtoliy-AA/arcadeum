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
 * Total XP required to reach a given level.
 * Formula: xpForLevel = round(103 * level^2.5), level 1 = 0 XP.
 *
 * Target: ~100,000 PvP wins to reach level 99 (~1 year of dedicated play)
 *
 * Thresholds (total XP to REACH the level):
 *   Lv 2:       583 XP  (6 wins at 100 XP)
 *   Lv 3:     1,606 XP
 *   Lv 4:     3,296 XP  (33 wins)
 *   Lv 5:     5,758 XP
 *   Lv 10:   32,571 XP
 *   Lv 99: 10,044,428 XP (~100,000 wins)
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(103 * Math.pow(level, 2.5));
}

export function levelFromXp(xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 1;
  // Closed-form estimate, then correct against the exact (rounded) thresholds:
  // the floating-point inverse can land one level off at exact boundaries.
  let level = Math.max(Math.floor(Math.pow(xp / 103, 1 / 2.5)), 1);
  while (xp >= xpForLevel(level + 1)) level++;
  while (level > 1 && xp < xpForLevel(level)) level--;
  return level;
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
