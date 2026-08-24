'use client';

import { useStatsReplay } from '@/features/stats/hooks/useStatsReplay';

/**
 * Mounts once at the app root; replays locally-recorded game results
 * (including offline bot games) to the backend whenever connectivity is
 * restored. Renders nothing.
 */
export function StatsReplay() {
  useStatsReplay();
  return null;
}
