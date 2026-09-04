'use client';

import { useStatsReplay } from '@/features/stats/hooks/useStatsReplay';
import { useSoloScoresReplay } from '@/features/stats/hooks/useSoloScoresReplay';

/**
 * Mounts once at the app root; replays locally-recorded game results
 * (including offline bot games) to the backend whenever connectivity is
 * restored. Also replays solo game scores. Renders nothing.
 */
export function StatsReplay() {
  useStatsReplay();
  useSoloScoresReplay();
  return null;
}
