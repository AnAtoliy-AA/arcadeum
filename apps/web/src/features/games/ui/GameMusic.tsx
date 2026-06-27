'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  loadStoredSettings,
  saveStoredSettings,
} from '@/shared/lib/settings-storage';
import {
  fetchTracks,
  FALLBACK_TRACKS,
  trackIndexForGame,
  DEFAULT_VOLUME,
  type MusicTrack,
  type RepeatMode,
} from './GameMusicUtils';
import {
  TransportControls,
  MiniControls,
  ProgressBar,
} from './GameMusicControls';
import { Playlist } from './GameMusicPlaylist';
import { EqualizerVisualization } from './GameMusicVisuals';
import { useDraggable } from './useDraggable';
import { playerStyles } from './GameMusicStyles';

function shuffleArray(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function GameMusic({ gameId }: { gameId?: string | null }) {
  const { musicEnabled } = useMusicSetting();
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<readonly MusicTrack[]>(FALLBACK_TRACKS);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [miniMode, setMiniMode] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [enabledTracks, setEnabledTracks] = useState<Set<number>>(() => {
    const saved = loadStoredSettings().musicEnabledTracks;
    if (saved && saved.length > 0) return new Set(saved);
    return new Set(FALLBACK_TRACKS.map((_, i) => i));
  });
  const [shuffleOrder, setShuffleOrder] = useState<number[]>(() =>
    shuffleArray(FALLBACK_TRACKS.length),
  );

  useEffect(() => {
    const handleToggle = () => setVisible((v) => !v);
    window.addEventListener('arcadeum:toggle-music', handleToggle);
    return () => window.removeEventListener('arcadeum:toggle-music', handleToggle);
  }, []);

  useEffect(() => {
    fetchTracks().then((data) => {
      const savedOrder = loadStoredSettings().musicTrackOrder;
      let orderedData = data;
      if (savedOrder && savedOrder.length === data.length) {
        orderedData = savedOrder.map((i) => data[i]).filter(Boolean);
        if (orderedData.length !== data.length) {
          orderedData = data;
        }
      }
      setTracks(orderedData);
      setIndex(trackIndexForGame(gameId, orderedData.length));
      const saved = loadStoredSettings().musicEnabledTracks;
      if (saved && saved.length > 0) {
        const valid = saved.filter((i) => i < orderedData.length);
        setEnabledTracks(
          new Set(valid.length > 0 ? valid : orderedData.map((_, i) => i)),
        );
      } else {
        setEnabledTracks(new Set(orderedData.map((_, i) => i)));
      }
      setShuffleOrder(shuffleArray(orderedData.length));
    });
  }, [gameId]);

  const volumeRef = useRef(volume);
  const enabledTracksRef = useRef(enabledTracks);
  const track = tracks[index];
  const { pos, onPointerDown, onPointerMove, onPointerUp } = useDraggable({
    x: 16,
    y: typeof window !== 'undefined' ? window.innerHeight - 200 : 600,
  });

  useEffect(() => {
    enabledTracksRef.current = enabledTracks;
  });

  useEffect(() => {
    if (!musicEnabled) return;
    const audio = new Audio(track.src);
    audio.loop = repeat === 'one';
    audio.volume = volumeRef.current;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      if (repeat === 'one') return;
      const nextIdx = shuffle
        ? shuffleOrder[(shuffleOrder.indexOf(index) + 1) % shuffleOrder.length]
        : (index + 1) % tracks.length;
      let idx = nextIdx;
      let safety = tracks.length;
      while (!enabledTracksRef.current.has(idx) && safety > 0) {
        idx = shuffle
          ? shuffleOrder[(shuffleOrder.indexOf(idx) + 1) % shuffleOrder.length]
          : (idx + 1) % tracks.length;
        safety--;
      }
      setIndex(idx);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    const result = audio.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        // Autoplay blocked — user must click play manually
      });
    }

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [
    track.src,
    musicEnabled,
    repeat,
    index,
    shuffle,
    shuffleOrder,
    tracks.length,
  ]);

  useEffect(() => {
    if (!musicEnabled) return;
    const nextIdx = shuffle
      ? shuffleOrder[(shuffleOrder.indexOf(index) + 1) % shuffleOrder.length]
      : (index + 1) % tracks.length;
    const nextSrc = tracks[nextIdx].src;
    const preloader = new Audio(nextSrc);
    preloader.preload = 'auto';
    return () => {
      preloader.src = '';
    };
  }, [index, musicEnabled, shuffle, shuffleOrder, tracks]);

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

  const playIndex = useCallback(
    (nextIndex: number) => {
      let idx = nextIndex;
      let safety = tracks.length;
      while (!enabledTracks.has(idx) && safety > 0) {
        idx = shuffle
          ? shuffleOrder[(shuffleOrder.indexOf(idx) + 1) % shuffleOrder.length]
          : (idx + 1) % tracks.length;
        safety--;
      }
      setIndex(idx);
    },
    [enabledTracks, shuffle, shuffleOrder, tracks.length],
  );

  const next = useCallback(() => {
    const nextIdx = shuffle
      ? shuffleOrder[(shuffleOrder.indexOf(index) + 1) % shuffleOrder.length]
      : (index + 1) % tracks.length;
    playIndex(nextIdx);
  }, [index, shuffle, shuffleOrder, tracks.length, playIndex]);

  const prev = useCallback(() => {
    const prevIdx = shuffle
      ? shuffleOrder[
          (shuffleOrder.indexOf(index) - 1 + shuffleOrder.length) %
            shuffleOrder.length
        ]
      : (index - 1 + tracks.length) % tracks.length;
    playIndex(prevIdx);
  }, [index, shuffle, shuffleOrder, tracks.length, playIndex]);

  const onVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(event.target.value) / 100;
      volumeRef.current = v;
      setVolume(v);
      if (audioRef.current) audioRef.current.volume = v;
    },
    [],
  );

  const onSeek = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(event.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      if (!s) setShuffleOrder(shuffleArray(tracks.length));
      return !s;
    });
  }, [tracks.length]);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  const toggleTrack = useCallback((trackIndex: number) => {
    setEnabledTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackIndex)) {
        if (next.size > 1) next.delete(trackIndex);
      } else {
        next.add(trackIndex);
      }
      saveStoredSettings({ musicEnabledTracks: Array.from(next) });
      return next;
    });
  }, []);

  const reorderTracks = useCallback(
    (newTracks: readonly MusicTrack[]) => {
      const currentSrc = tracks[index].src;
      setTracks(newTracks);
      const newIndex = newTracks.findIndex((t) => t.src === currentSrc);
      if (newIndex !== -1) {
        setIndex(newIndex);
      }
      saveStoredSettings({
        musicTrackOrder: newTracks.map((_, i) => {
          const originalIndex = tracks.findIndex(
            (t) => t.src === newTracks[i].src,
          );
          return originalIndex;
        }),
      });
    },
    [tracks, index],
  );

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
      } catch {}
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

  useEffect(() => {
    const ms =
      typeof navigator !== 'undefined' ? navigator.mediaSession : undefined;
    if (!ms) return;
    ms.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
    }
    setVisible(false);
  }, []);

  if (!musicEnabled || !visible) return null;

  const labels = {
    play: t('musicPlayer.play'),
    pause: t('musicPlayer.pause'),
    stop: t('musicPlayer.stop'),
    prev: t('musicPlayer.prev'),
    next: t('musicPlayer.next'),
    shuffleOn: t('musicPlayer.shuffleOn'),
    shuffleOff: t('musicPlayer.shuffleOff'),
    repeatOff: t('musicPlayer.repeatOff'),
    repeatAll: t('musicPlayer.repeatAll'),
    repeatOne: t('musicPlayer.repeatOne'),
    playlistShow: t('musicPlayer.playlistShow'),
    playlistHide: t('musicPlayer.playlistHide'),
    minimize: t('musicPlayer.minimize'),
    maximize: t('musicPlayer.maximize'),
    volume: t('musicPlayer.volume'),
    seek: t('musicPlayer.progress'),
  };

  return (
    <>
      <style>{playerStyles}</style>
      <YStack
        className={`game-music-player${isPlaying ? ' is-playing' : ''}`}
        testID="game-music-player"
        position="fixed"
        zIndex={1000}
        width={miniMode ? 160 : 320}
        gap={0}
        paddingVertical="$3"
        paddingHorizontal="$3"
        borderRadius={28}
        backgroundColor="rgba(255,255,255,0.18)"
        borderWidth={1}
        borderColor="rgba(255,255,255,0.5)"
        style={{
          backdropFilter: 'blur(50px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(50px) saturate(1.6)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.1), inset 0 0 0 0.5px rgba(255,255,255,0.3)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 35%, rgba(255,255,255,0.15) 100%)',
          left: pos.x,
          top: pos.y,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <XStack
          data-drag-handle
          alignItems="center"
          gap="$3"
          cursor="grab"
          paddingVertical="$1"
          paddingHorizontal="$1"
          style={{ touchAction: 'none' }}
        >
          <XStack
            width={40}
            height={40}
            borderRadius={10}
            backgroundColor="rgba(255,255,255,0.25)"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            style={{
              border: '1px solid rgba(255,255,255,0.45)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 0 12px rgba(255,255,255,0.08)',
            }}
          >
            <EqualizerVisualization isPlaying={isPlaying} audioRef={audioRef} />
          </XStack>
          <YStack flex={1} overflow="hidden" gap={1}>
            <Text
              className="game-music-title"
              fontSize={13}
              fontWeight="600"
              color="rgba(255,255,255,0.95)"
              numberOfLines={1}
            >
              {track.title}
            </Text>
            <Text
              fontSize={10}
              fontWeight="400"
              color="rgba(255,255,255,0.55)"
              numberOfLines={1}
            >
              Arcadeum
            </Text>
          </YStack>
          <button
            onClick={closePlayer}
            data-testid="game-music-close"
            aria-label="Close player"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.5)',
              transition: 'color 150ms ease, background-color 150ms ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </XStack>

        {!miniMode && (
          <YStack gap="$3" marginTop="$2">
            {playlistOpen && (
              <Playlist
                tracks={tracks}
                index={index}
                isPlaying={isPlaying}
                enabledTracks={enabledTracks}
                onToggleTrack={toggleTrack}
                onReorder={reorderTracks}
                onPlay={playIndex}
              />
            )}
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
              label={labels.seek}
            />
            <TransportControls
              isPlaying={isPlaying}
              shuffle={shuffle}
              repeat={repeat}
              playlistOpen={playlistOpen}
              volume={volume}
              onTogglePlay={togglePlay}
              onStop={stop}
              onNext={next}
              onPrev={prev}
              onToggleShuffle={toggleShuffle}
              onCycleRepeat={cycleRepeat}
              onTogglePlaylist={() => setPlaylistOpen((o) => !o)}
              onToggleMiniMode={() => setMiniMode(true)}
              onVolumeChange={onVolumeChange}
              labels={labels}
            />
          </YStack>
        )}

        {miniMode && (
          <MiniControls
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onToggleMiniMode={() => setMiniMode(false)}
            labels={labels}
          />
        )}
      </YStack>
    </>
  );
}
