export type LeagueTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';

export interface LeagueParticipant {
  rank: number;
  userId: string;
  username: string;
  trophies: number;
  isCurrentUser?: boolean;
}

export function getLeagueZone(
  rank: number,
  totalParticipants = 30,
): 'promotion' | 'safe' | 'demotion' {
  if (rank <= 5) return 'promotion';
  if (rank > totalParticipants - 5) return 'demotion';
  return 'safe';
}

export function getWeeklyLeagueTimeRemaining(now = Date.now()): number {
  const date = new Date(now);
  const day = date.getUTCDay();
  const daysUntilSunday = (7 - day) % 7;

  const nextSunday = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday),
      23,
      59,
      59,
      999,
    ),
  );

  return Math.max(0, nextSunday.getTime() - now);
}

export function formatLeagueTimeRemaining(remainingMs: number): string {
  if (remainingMs <= 0) return 'Resetting...';

  const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function getTierColorClass(tier: LeagueTier): string {
  switch (tier) {
    case 'bronze':
      return 'text-amber-600 bg-amber-600/10 border-amber-600/30';
    case 'silver':
      return 'text-slate-300 bg-slate-300/10 border-slate-300/30';
    case 'gold':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'diamond':
      return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
    case 'master':
      return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
  }
}
