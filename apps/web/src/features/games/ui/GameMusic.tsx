'use client';

import { useEffect, useRef } from 'react';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';

// Real royalty-free tracks (added to public/sounds). Add more files here and
// they join the rotation automatically.
const TRACKS = [
  '/sounds/fleet-at-dawn-1.mp3',
  '/sounds/fleet-at-dawn-2.mp3',
] as const;

const VOLUME = 0.3;

/**
 * Pick a track for a game. Deterministic per game id (stable hash) so a given
 * game always plays the same song, while different games vary across the set.
 * Falls back to the first track when no game id is available.
 */
export function trackForGame(gameId?: string | null): string {
  const id = gameId ?? '';
  if (!id) return TRACKS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return TRACKS[hash % TRACKS.length];
}

/**
 * Background music for the game room. Loops a track (chosen per game) while the
 * user has Music enabled (Settings / in-game control panel). Renders nothing.
 *
 * Autoplay policy: by the time a game room mounts the player has clicked into
 * it, and toggling Music on is itself a gesture — so `play()` is allowed. Any
 * rejection is swallowed.
 */
export function GameMusic({ gameId }: { gameId?: string | null }) {
  const { musicEnabled } = useMusicSetting();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const src = trackForGame(gameId);

  useEffect(() => {
    if (!musicEnabled) return;
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = 'auto';
    audioRef.current = audio;
    const result = audio.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [src, musicEnabled]);

  return null;
}
