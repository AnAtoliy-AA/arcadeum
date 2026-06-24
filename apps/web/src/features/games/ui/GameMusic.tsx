'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import {
  IconButton,
  PlayIcon,
  PauseIcon,
  StopIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from '@arcadeum/ui';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
import { useTranslation } from '@/shared/lib/useTranslation';

export interface MusicTrack {
  /** Public URL of the audio file. */
  src: string;
  /** Display name shown in the player (a proper noun, not i18n). */
  title: string;
}

// Royalty-free tracks stored in public/music/. Add more entries and they join
// the player's rotation automatically.
export const TRACKS: readonly MusicTrack[] = [
  { src: '/music/clockwork-horizon.mp3', title: 'Clockwork Horizon' },
  { src: '/music/clockwork-horizon-v2.mp3', title: 'Brass Meridian' },
  { src: '/music/glass-grid.mp3', title: 'Glass Grid' },
  { src: '/music/glass-grid-v2.mp3', title: 'Crystal Dispatch' },
  { src: '/music/iron-tide.mp3', title: 'Iron Tide' },
  { src: '/music/iron-tide-v2.mp3', title: 'Steel Current' },
  { src: '/music/iron-wake.mp3', title: 'Iron Wake' },
  { src: '/music/iron-wake-v2.mp3', title: 'Ember Drift' },
  { src: '/music/iron-wake-v3.mp3', title: 'Ashen Signal' },
  { src: '/music/iron-wake-v4.mp3', title: 'Final Surge' },
] as const;

if (process.env.NODE_ENV !== 'production') {
  const titles = TRACKS.map((t) => t.title);
  const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
  if (dupes.length > 0) {
    console.error('[GameMusic] Duplicate track titles:', dupes);
  }
}

const DEFAULT_VOLUME = 0.3;

// Entrance animation (reduced-motion aware) + the volume range styling. The
// player is a fixed-width card so a long title truncates instead of pushing the
// transport buttons around.
const playerStyles = `
@keyframes gameMusicPlayerIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
.game-music-player { animation: gameMusicPlayerIn 240ms ease-out; }
@media (prefers-reduced-motion: reduce) {
  .game-music-player { animation: none; }
}
.game-music-volume {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  width: 100%;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  accent-color: #ffffff;
  cursor: pointer;
}
.game-music-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`;

/**
 * Index of the starting track for a game. Deterministic per game id (stable
 * hash) so a given game opens on the same song; different games vary across the
 * set. Falls back to the first track when no game id is available.
 */
export function trackIndexForGame(gameId?: string | null): number {
  const id = gameId ?? '';
  if (!id) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % TRACKS.length;
}

/** The starting track for a game (see {@link trackIndexForGame}). */
export function trackForGame(gameId?: string | null): MusicTrack {
  return TRACKS[trackIndexForGame(gameId)];
}

/**
 * In-game background music with a compact transport player (prev / play-pause /
 * next / stop) plus a volume slider and the current track title. Visible only
 * while the user has Music enabled (Settings / in-game control panel; off by
 * default), and mounted inside the fullscreen container so it stays reachable
 * in native fullscreen.
 *
 * Autoplay policy: by the time a game room mounts the player has clicked into
 * it, and enabling Music is itself a gesture, so playback usually starts on its
 * own. If the browser blocks autoplay, the player simply shows Play so the user
 * can start it with a tap; any `play()` rejection is swallowed.
 */
export function GameMusic({ gameId }: { gameId?: string | null }) {
  const { musicEnabled } = useMusicSetting();
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(() => trackIndexForGame(gameId));
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  // Latest volume, read when (re)creating the audio element without making it a
  // dependency of the creation effect (which would restart playback).
  const volumeRef = useRef(volume);
  const track = TRACKS[index];

  // Create / tear down the audio element when music is toggled or the track
  // changes (prev/next). Playback state is driven by the element's own events.
  useEffect(() => {
    if (!musicEnabled) return;
    const audio = new Audio(track.src);
    audio.loop = true;
    audio.volume = volumeRef.current;
    audio.preload = 'auto';
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    const result = audio.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [track.src, musicEnabled]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      const result = audio.play();
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const next = useCallback(() => setIndex((i) => (i + 1) % TRACKS.length), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + TRACKS.length) % TRACKS.length),
    [],
  );

  const onVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(event.target.value) / 100;
      volumeRef.current = v;
      setVolume(v);
      if (audioRef.current) audioRef.current.volume = v;
    },
    [],
  );

  // Wire OS / keyboard media keys (Mac F7/F8/F9, Bluetooth remotes, lock
  // screen) to the player. Browsers auto-map play/pause to a playing audio
  // element, which is why F8 already worked — but previous/next only fire once
  // we register Media Session action handlers, so F7/F9 were no-ops before.
  useEffect(() => {
    if (!musicEnabled) return;
    const ms =
      typeof navigator !== 'undefined' ? navigator.mediaSession : undefined;
    if (!ms) return;

    if (typeof MediaMetadata !== 'undefined') {
      ms.metadata = new MediaMetadata({
        title: track.title,
        artist: 'Arcadeum',
      });
    }

    const setHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null,
    ) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        // Not every browser supports every action — ignore the unsupported.
      }
    };

    setHandler('play', () => {
      if (audioRef.current?.paused) togglePlay();
    });
    setHandler('pause', () => {
      if (audioRef.current && !audioRef.current.paused) togglePlay();
    });
    setHandler('previoustrack', prev);
    setHandler('nexttrack', next);
    setHandler('stop', stop);

    return () => {
      (
        ['play', 'pause', 'previoustrack', 'nexttrack', 'stop'] as const
      ).forEach((action) => setHandler(action, null));
    };
  }, [musicEnabled, track.title, togglePlay, prev, next, stop]);

  // Keep the OS "now playing" indicator in sync with our playback state.
  useEffect(() => {
    const ms =
      typeof navigator !== 'undefined' ? navigator.mediaSession : undefined;
    if (!ms) return;
    ms.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  if (!musicEnabled) return null;

  const transportHover = { rotate: '0deg', scale: 1.12 } as const;

  return (
    <>
      <style>{playerStyles}</style>
      <YStack
        className="game-music-player"
        testID="game-music-player"
        position="fixed"
        bottom={16}
        left={16}
        zIndex={1000}
        width={264}
        gap="$2"
        paddingVertical="$2.5"
        paddingHorizontal="$3"
        borderRadius={16}
        backgroundColor="rgba(15,17,26,0.9)"
        borderWidth={1}
        borderColor="rgba(255,255,255,0.12)"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        {/* Title row — truncates so it never pushes the controls. */}
        <XStack alignItems="center" gap="$2">
          <Text fontSize={16} aria-hidden>
            🎵
          </Text>
          <YStack flex={1} overflow="hidden">
            <Text
              fontSize={10}
              color="rgba(255,255,255,0.55)"
              letterSpacing={0.4}
            >
              {t('musicPlayer.nowPlaying')}
            </Text>
            <Text
              className="game-music-title"
              fontSize={13}
              fontWeight="700"
              color="#ffffff"
            >
              {track.title}
            </Text>
          </YStack>
        </XStack>

        {/* Controls row — transport buttons stay anchored; volume fills the rest. */}
        <XStack alignItems="center" gap="$2">
          <XStack alignItems="center" gap="$1">
            <IconButton
              circular
              size="sm"
              onClick={prev}
              testId="game-music-prev"
              aria-label={t('musicPlayer.prev')}
              hoverStyle={transportHover}
              color="#ffffff"
            >
              <SkipBackIcon size={16} />
            </IconButton>
            <IconButton
              circular
              size="sm"
              onClick={togglePlay}
              testId="game-music-playpause"
              aria-label={
                isPlaying ? t('musicPlayer.pause') : t('musicPlayer.play')
              }
              hoverStyle={transportHover}
              color="#ffffff"
            >
              {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </IconButton>
            <IconButton
              circular
              size="sm"
              onClick={stop}
              testId="game-music-stop"
              aria-label={t('musicPlayer.stop')}
              hoverStyle={transportHover}
              color="#ffffff"
            >
              <StopIcon size={15} />
            </IconButton>
            <IconButton
              circular
              size="sm"
              onClick={next}
              testId="game-music-next"
              aria-label={t('musicPlayer.next')}
              hoverStyle={transportHover}
              color="#ffffff"
            >
              <SkipForwardIcon size={16} />
            </IconButton>
          </XStack>

          <XStack flex={1} alignItems="center" gap="$1.5">
            <Text fontSize={13} aria-hidden>
              🔊
            </Text>
            <input
              className="game-music-volume"
              data-testid="game-music-volume"
              type="range"
              min={0}
              max={100}
              step={5}
              value={Math.round(volume * 100)}
              onChange={onVolumeChange}
              aria-label={t('musicPlayer.volume')}
            />
          </XStack>
        </XStack>
      </YStack>
    </>
  );
}
