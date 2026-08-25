import type { GameResultStats } from '../ui/GameResultStatsGrid';

export type StateExtractor = (
  state: Record<string, unknown>,
  currentUserId: string,
) => GameResultStats | null;

export function countLogs(logs: unknown): number {
  if (!Array.isArray(logs)) return 0;
  return logs.filter(
    (l): l is Record<string, unknown> =>
      typeof l === 'object' &&
      l !== null &&
      'type' in l &&
      (l as Record<string, unknown>).type === 'action',
  ).length;
}
