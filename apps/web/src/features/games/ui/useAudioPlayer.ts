'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
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

function shuffleArray(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface AudioPlayerState {
  tracks: readonly MusicTrack[];
  index: number;
  isPlaying: boolean;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  miniMode: boolean;
  playlistOpen: boolean;
  visible: boolean;
  currentTime: number;
  duration: number;
  enabledTracks: Set<number>;
  shuffleOrder: number[];
  track: MusicTrack | undefined;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export interface AudioPlayerActions {
  togglePlay: () => void;
  stop: () => void;
  playIndex: (nextIndex: number) => void;
  next: () => void;
  prev: () => void;
  onVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSeek: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleTrack: (trackIndex: number) => void;
  reorderTracks: (newTracks: readonly MusicTrack[]) => void;
  setMiniMode: React.Dispatch<React.SetStateAction<boolean>>;
  setPlaylistOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  closePlayer: () => void;
  seekTo: (time: number) => void;
  skipForward: () => void;
  skipBack: () => void;
}

export function useAudioPlayer(
  gameId?: string | null,
): AudioPlayerState & AudioPlayerActions {
  const { musicEnabled } = useMusicSetting();
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
    return () =>
      window.removeEventListener('arcadeum:toggle-music', handleToggle);
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
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);
  const shuffleOrderRef = useRef(shuffleOrder);
  const tracksLengthRef = useRef(tracks.length);
  const track = tracks[index];

  useEffect(() => {
    enabledTracksRef.current = enabledTracks;
    repeatRef.current = repeat;
    shuffleRef.current = shuffle;
    shuffleOrderRef.current = shuffleOrder;
    tracksLengthRef.current = tracks.length;
  });

  useEffect(() => {
    if (!musicEnabled) return;
    const audio = new Audio(track.src);
    audio.loop = repeatRef.current === 'one';
    audio.volume = volumeRef.current;
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      if (repeatRef.current === 'one') return;
      const nextIdx = shuffleRef.current
        ? shuffleOrderRef.current[
            (shuffleOrderRef.current.indexOf(index) + 1) %
              shuffleOrderRef.current.length
          ]
        : (index + 1) % tracksLengthRef.current;
      let idx = nextIdx;
      let safety = tracksLengthRef.current;
      while (!enabledTracksRef.current.has(idx) && safety > 0) {
        idx = shuffleRef.current
          ? shuffleOrderRef.current[
              (shuffleOrderRef.current.indexOf(idx) + 1) %
                shuffleOrderRef.current.length
            ]
          : (idx + 1) % tracksLengthRef.current;
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
      result.catch(() => {});
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
  }, [track.src, musicEnabled, index]);

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
      if (idx === index) {
        const audio = audioRef.current;
        if (audio && audio.paused) {
          audio.play().catch(() => {});
        }
        return;
      }
      setIndex(idx);
    },
    [index, enabledTracks, shuffle, shuffleOrder, tracks.length],
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

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 10, audio.duration || 0);
  }, []);

  const skipBack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
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

  useEffect(() => {
    if (!musicEnabled || !visible) return;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) prev();
          else seekTo(Math.max((audioRef.current?.currentTime ?? 0) - 10, 0));
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) next();
          else
            seekTo(
              Math.min(
                (audioRef.current?.currentTime ?? 0) + 10,
                audioRef.current?.duration ?? 0,
              ),
            );
          break;
        case 'ArrowUp':
          e.preventDefault();
          volumeRef.current = Math.min(volumeRef.current + 0.05, 1);
          setVolume(volumeRef.current);
          if (audioRef.current) audioRef.current.volume = volumeRef.current;
          break;
        case 'ArrowDown':
          e.preventDefault();
          volumeRef.current = Math.max(volumeRef.current - 0.05, 0);
          setVolume(volumeRef.current);
          if (audioRef.current) audioRef.current.volume = volumeRef.current;
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [musicEnabled, visible, togglePlay, seekTo, prev, next]);

  return {
    tracks,
    index,
    isPlaying,
    volume,
    shuffle,
    repeat,
    miniMode,
    playlistOpen,
    visible,
    currentTime,
    duration,
    enabledTracks,
    shuffleOrder,
    track,
    audioRef,
    togglePlay,
    stop,
    playIndex,
    next,
    prev,
    onVolumeChange,
    onSeek,
    toggleShuffle,
    cycleRepeat,
    toggleTrack,
    reorderTracks,
    setMiniMode,
    setPlaylistOpen,
    setVisible,
    closePlayer,
    seekTo,
    skipForward,
    skipBack,
  };
}
