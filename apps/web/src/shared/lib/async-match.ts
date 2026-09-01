export interface AsyncMatchItem {
  matchId: string;
  gameType: string;
  playerA: string;
  playerB: string;
  currentTurnPlayerId: string;
  status: 'active' | 'completed' | 'forfeited';
  turnDurationHours: number;
  lastTurnAt: string;
  turnExpiresAt: string;
  winnerId?: string;
}

export function getTurnTimeRemaining(
  turnExpiresAt: string | Date,
  now = Date.now(),
): number {
  const expires =
    typeof turnExpiresAt === 'string'
      ? new Date(turnExpiresAt).getTime()
      : turnExpiresAt.getTime();
  return Math.max(0, expires - now);
}

export function formatTurnTimeRemaining(remainingMs: number): string {
  if (remainingMs <= 0) return '0h 0m';

  const totalMinutes = Math.floor(remainingMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function getTurnUrgency(
  remainingMs: number,
): 'normal' | 'warning' | 'critical' | 'expired' {
  if (remainingMs <= 0) return 'expired';
  const hours = remainingMs / (1000 * 60 * 60);
  if (hours <= 2) return 'critical';
  if (hours <= 6) return 'warning';
  return 'normal';
}

export function isMyTurn(match: AsyncMatchItem, userId: string): boolean {
  return match.status === 'active' && match.currentTurnPlayerId === userId;
}
