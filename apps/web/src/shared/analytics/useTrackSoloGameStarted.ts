'use client';

// Fires the solo funnel start event when a single-player widget mounts
// (roadmap 6C). Solo play pages navigate via <Link>, so there is no click
// handler to instrument — the play-route mount is the reliable signal.

import { useEffect, useRef } from 'react';
import { trackSoloGameStarted } from './funnel';

export function useTrackSoloGameStarted(gameId: string): void {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    // Strict Mode / re-renders fire effects twice; key by gameId so a widget
    // remount for a different game still reports.
    if (trackedRef.current === gameId) return;
    trackedRef.current = gameId;
    trackSoloGameStarted(gameId);
  }, [gameId]);
}
