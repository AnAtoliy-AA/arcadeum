'use client';

import { useEffect, useRef, useState } from 'react';
import { Text, XStack } from 'tamagui';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
import { useTranslation } from '@/shared/lib/useTranslation';

export interface MusicTrack {
  /** Public URL of the audio file. */
  src: string;
  /** Display name shown in the "Now playing" chip (a proper noun, not i18n). */
  title: string;
}

// Real royalty-free tracks (added to public/sounds). Add more entries here and
// they join the rotation automatically.
const TRACKS: readonly MusicTrack[] = [
  { src: '/sounds/fleet-at-dawn-1.mp3', title: 'Fleet at Dawn' },
  { src: '/sounds/fleet-at-dawn-2.mp3', title: 'Fleet at Dawn — Reprise' },
] as const;

const VOLUME = 0.3;
// How long the "Now playing" chip stays on screen after playback starts.
const NOW_PLAYING_MS = 4000;

// Entrance animation + reduced-motion fallback for the chip.
const chipStyles = `
@keyframes gameMusicChipIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
.game-music-chip { animation: gameMusicChipIn 240ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .game-music-chip { animation: none; }
}
`;

/**
 * Pick a track for a game. Deterministic per game id (stable hash) so a given
 * game always plays the same song, while different games vary across the set.
 * Falls back to the first track when no game id is available.
 */
export function trackForGame(gameId?: string | null): MusicTrack {
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
 * user has Music enabled (Settings / in-game control panel), and surfaces a
 * brief "Now playing" chip the moment playback actually begins.
 *
 * Autoplay policy: by the time a game room mounts the player has clicked into
 * it, and toggling Music on is itself a gesture — so `play()` is usually
 * allowed. We key the chip off the `playing` event (not mount) so it only
 * appears once audio is genuinely audible; any `play()` rejection is swallowed.
 */
export function GameMusic({ gameId }: { gameId?: string | null }) {
  const { musicEnabled } = useMusicSetting();
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const track = trackForGame(gameId);

  useEffect(() => {
    if (!musicEnabled) return;
    const audio = new Audio(track.src);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = 'auto';
    audioRef.current = audio;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const handlePlaying = () => {
      setNowPlaying(track.title);
      hideTimer = setTimeout(() => setNowPlaying(null), NOW_PLAYING_MS);
    };
    audio.addEventListener('playing', handlePlaying);

    const result = audio.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      audio.removeEventListener('playing', handlePlaying);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      setNowPlaying(null);
    };
  }, [track.src, track.title, musicEnabled]);

  if (!musicEnabled || !nowPlaying) return null;

  return (
    <>
      <style>{chipStyles}</style>
      <XStack
        className="game-music-chip"
        testID="game-music-now-playing"
        position="fixed"
        bottom={16}
        left={16}
        zIndex={1000}
        alignItems="center"
        gap="$2"
        paddingVertical="$2"
        paddingHorizontal="$3"
        borderRadius={999}
        backgroundColor="rgba(15,17,26,0.82)"
        borderWidth={1}
        borderColor="rgba(255,255,255,0.12)"
        style={{ backdropFilter: 'blur(8px)' }}
        pointerEvents="none"
      >
        <Text fontSize={16} aria-hidden>
          🎵
        </Text>
        <Text fontSize={11} color="rgba(255,255,255,0.6)" letterSpacing={0.4}>
          {t('settings.musicNowPlaying')}
        </Text>
        <Text fontSize={13} fontWeight="700" color="#ffffff">
          {nowPlaying}
        </Text>
      </XStack>
    </>
  );
}
