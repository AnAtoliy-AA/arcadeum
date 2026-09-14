/**
 * XP required to reach a given level.
 * Formula: xpForLevel = 103 * level^2.5
 *
 * Target: ~100,000 PvP wins to reach level 99 (~1 year of dedicated play)
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(103 * Math.pow(level, 2.5));
}

export function levelFromXp(xp: number): number {
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

const ROMAN_NUMERALS: [number, string][] = [
  [90, 'XC'],
  [80, 'LXXX'],
  [70, 'LXX'],
  [60, 'LX'],
  [50, 'L'],
  [40, 'XL'],
  [30, 'XXX'],
  [20, 'XX'],
  [10, 'X'],
  [9, 'IX'],
  [8, 'VIII'],
  [7, 'VII'],
  [6, 'VI'],
  [5, 'V'],
  [4, 'IV'],
  [3, 'III'],
  [2, 'II'],
  [1, 'I'],
];

export function toRoman(num: number): string {
  if (num <= 0 || num > 99) return String(num);
  let result = '';
  let remaining = num;
  for (const [value, numeral] of ROMAN_NUMERALS) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }
  return result;
}
