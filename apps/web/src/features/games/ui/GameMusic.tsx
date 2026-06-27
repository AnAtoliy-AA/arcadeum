'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  TRACKS,
  trackIndexForGame,
  DEFAULT_VOLUME,
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
  const [index, setIndex] = useState(() => trackIndexForGame(gameId));
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [miniMode, setMiniMode] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [enabledTracks, setEnabledTracks] = useState<Set<number>>(
    () => new Set(TRACKS.map((_, i) => i)),
  );
  const [shuffleOrder, setShuffleOrder] = useState<number[]>(() =>
    shuffleArray(TRACKS.length),
  );

  const volumeRef = useRef(volume);
  const track = TRACKS[index];
  const { pos, onPointerDown, onPointerMove, onPointerUp } = useDraggable({
    x: 16,
    y: typeof window !== 'undefined' ? window.innerHeight - 200 : 600,
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

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    const result = audio.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [track.src, musicEnabled, repeat]);

  useEffect(() => {
    if (!musicEnabled) return;
    const nextIdx = shuffle
      ? shuffleOrder[(shuffleOrder.indexOf(index) + 1) % shuffleOrder.length]
      : (index + 1) % TRACKS.length;
    const nextSrc = TRACKS[nextIdx].src;
    const preloader = new Audio(nextSrc);
    preloader.preload = 'auto';
    return () => {
      preloader.src = '';
    };
  }, [index, musicEnabled, shuffle, shuffleOrder]);

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
      let safety = TRACKS.length;
      while (!enabledTracks.has(idx) && safety > 0) {
        idx = shuffle
          ? shuffleOrder[(shuffleOrder.indexOf(idx) + 1) % shuffleOrder.length]
          : (idx + 1) % TRACKS.length;
        safety--;
      }
      setIndex(idx);
    },
    [enabledTracks, shuffle, shuffleOrder],
  );

  const next = useCallback(() => {
    const nextIdx = shuffle
      ? shuffleOrder[(shuffleOrder.indexOf(index) + 1) % shuffleOrder.length]
      : (index + 1) % TRACKS.length;
    playIndex(nextIdx);
  }, [index, shuffle, shuffleOrder, playIndex]);

  const prev = useCallback(() => {
    const prevIdx = shuffle
      ? shuffleOrder[
          (shuffleOrder.indexOf(index) - 1 + shuffleOrder.length) %
            shuffleOrder.length
        ]
      : (index - 1 + TRACKS.length) % TRACKS.length;
    playIndex(prevIdx);
  }, [index, shuffle, shuffleOrder, playIndex]);

  useEffect(() => {
    if (!isPlaying || repeat !== 'all') return;
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => next();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [isPlaying, repeat, next]);

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
      if (!s) setShuffleOrder(shuffleArray(TRACKS.length));
      return !s;
    });
  }, []);

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
      return next;
    });
  }, []);

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

  if (!musicEnabled) return null;

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
        className="game-music-player"
        testID="game-music-player"
        position="fixed"
        zIndex={1000}
        width={miniMode ? 160 : 280}
        gap="$2"
        paddingVertical="$2.5"
        paddingHorizontal="$3"
        borderRadius={16}
        backgroundColor="rgba(15,17,26,0.92)"
        borderWidth={1}
        borderColor="rgba(255,255,255,0.1)"
        style={{
          backdropFilter: 'blur(12px)',
          left: pos.x,
          top: pos.y,
          touchAction: 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <XStack
          data-drag-handle
          alignItems="center"
          gap="$2"
          cursor="grab"
          paddingVertical={2}
        >
          <EqualizerVisualization isPlaying={isPlaying} audioRef={audioRef} />
          <YStack flex={1} overflow="hidden">
            <Text
              className="game-music-title"
              fontSize={12}
              fontWeight="600"
              color="#ffffff"
            >
              {track.title}
            </Text>
          </YStack>
        </XStack>

        {!miniMode && (
          <>
            {playlistOpen && (
              <Playlist
                index={index}
                isPlaying={isPlaying}
                enabledTracks={enabledTracks}
                onToggleTrack={toggleTrack}
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
          </>
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
