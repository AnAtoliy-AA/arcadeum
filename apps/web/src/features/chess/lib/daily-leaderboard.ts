export type SpeedBadge = 'demon' | 'tactician' | 'thinker' | 'steadfast';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  timeMs: number;
  badge: SpeedBadge;
  date: string;
  rank: number;
}

export interface BadgeInfo {
  badge: SpeedBadge;
  label: string;
  icon: string;
  description: string;
  colorClass: string;
}

export const BADGE_DETAILS: Record<SpeedBadge, BadgeInfo> = {
  demon: {
    badge: 'demon',
    label: 'Speed Demon',
    icon: '⚡',
    description: 'Solved in under 15 seconds',
    colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  tactician: {
    badge: 'tactician',
    label: 'Sharp Tactician',
    icon: '🎯',
    description: 'Solved in under 30 seconds',
    colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  thinker: {
    badge: 'thinker',
    label: 'Deep Thinker',
    icon: '🧠',
    description: 'Solved in under 60 seconds',
    colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  steadfast: {
    badge: 'steadfast',
    label: 'Steadfast Solver',
    icon: '🛡️',
    description: 'Carefully solved with full precision',
    colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
};

export function getSpeedBadge(timeMs: number): SpeedBadge {
  if (timeMs < 15000) return 'demon';
  if (timeMs < 30000) return 'tactician';
  if (timeMs < 60000) return 'thinker';
  return 'steadfast';
}

const STORAGE_PB_PREFIX = 'arcadeum_chess_daily_pb_';

export function getPersonalBest(puzzleId: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PB_PREFIX}${puzzleId}`);
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function savePersonalBest(
  puzzleId: string,
  timeMs: number,
): { isNewPb: boolean; previousPb: number | null; pb: number } {
  const previousPb = getPersonalBest(puzzleId);
  const isNewPb = previousPb === null || timeMs < previousPb;
  const pb = isNewPb ? timeMs : previousPb;

  if (typeof window !== 'undefined' && isNewPb) {
    try {
      localStorage.setItem(`${STORAGE_PB_PREFIX}${puzzleId}`, String(pb));
    } catch {}
  }

  return { isNewPb, previousPb, pb };
}

export function formatTimeSeconds(timeMs: number): string {
  return `${(timeMs / 1000).toFixed(1)}s`;
}

export function getDailyLeaderboard(
  dateStr: string,
  userTimeMs?: number,
): LeaderboardEntry[] {
  const seed = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  const baselineEntries: Array<{ username: string; timeMs: number }> = [
    { username: 'GrandmasterFlow', timeMs: 8200 + (seed % 2000) },
    { username: 'TacticalWizard', timeMs: 11400 + (seed % 3000) },
    { username: 'LightningKnight', timeMs: 14700 + (seed % 2500) },
    { username: 'CheckmateArtist', timeMs: 19800 + (seed % 4000) },
    { username: 'BlunderBuster', timeMs: 27500 + (seed % 5000) },
    { username: 'EndgameAce', timeMs: 34200 + (seed % 6000) },
  ];

  if (userTimeMs !== undefined && userTimeMs > 0) {
    baselineEntries.push({ username: 'You', timeMs: userTimeMs });
  }

  baselineEntries.sort((a, b) => a.timeMs - b.timeMs);

  return baselineEntries.map((e, idx) => ({
    id: `lb_${idx}_${e.username}`,
    userId: e.username === 'You' ? 'current-user' : `bot_${idx}`,
    username: e.username,
    timeMs: e.timeMs,
    badge: getSpeedBadge(e.timeMs),
    date: dateStr,
    rank: idx + 1,
  }));
}
