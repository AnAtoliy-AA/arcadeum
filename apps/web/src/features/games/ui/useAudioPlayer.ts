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
import { usePlayerKeyboard } from './usePlayerKeyboard';

const CROSSFADE_MS = 1200;

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
  trackDurations: Record<string, number>;
  enabledTracks: Set<number>;
  shuffleOrder: number[];
  loading: boolean;
  error: string | null;
  track: MusicTrack | undefined;
  audioRef: React.RefObject<HTMLAudioElement | null>;
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

export function useAudioPlayer(gameId?: string | null): AudioPlayerState {
  const { musicEnabled } = useMusicSetting();
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const activeSlotRef = useRef<'A' | 'B'>('A');
  const crossfadeRafRef = useRef<number>(0);
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
  const [trackDurations, setTrackDurations] = useState<Record<string, number>>(
    {},
  );
  const [enabledTracks, setEnabledTracks] = useState<Set<number>>(() => {
    const saved = loadStoredSettings().musicEnabledTracks;
    if (saved && saved.length > 0) return new Set(saved);
    return new Set(FALLBACK_TRACKS.map((_, i) => i));
  });
  const [shuffleOrder, setShuffleOrder] = useState<number[]>(() =>
    shuffleArray(FALLBACK_TRACKS.length),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleToggle = () => setVisible((v) => !v);
    window.addEventListener('arcadeum:toggle-music', handleToggle);
    return () =>
      window.removeEventListener('arcadeum:toggle-music', handleToggle);
  }, []);

  useEffect(() => {
    let dead = false;
    fetchTracks()
      .then((data) => {
        if (dead) return;
        const order = loadStoredSettings().musicTrackOrder;
        let d = data;
        if (order && order.length === data.length) {
          d = order.map((i) => data[i]).filter(Boolean);
          if (d.length !== data.length) d = data;
        }
        setTracks(d);
        setIndex(trackIndexForGame(gameId, d.length));
        const saved = loadStoredSettings().musicEnabledTracks;
        setEnabledTracks(
          saved?.length
            ? new Set(saved.filter((i) => i < d.length))
            : new Set(d.map((_, i) => i)),
        );
        setShuffleOrder(shuffleArray(d.length));
        setLoading(false);
      })
      .catch(() => {
        if (!dead) {
          setError('Failed to load music tracks');
          setLoading(false);
        }
      });
    return () => {
      dead = true;
    };
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

  const crossfadeTo = useCallback((newSrc: string, newVolume: number) => {
    const oldAudio =
      activeSlotRef.current === 'A' ? audioARef.current : audioBRef.current;
    const newAudio =
      activeSlotRef.current === 'A' ? audioBRef.current : audioARef.current;
    if (!newAudio || !oldAudio) return;

    cancelAnimationFrame(crossfadeRafRef.current);
    activeSlotRef.current = activeSlotRef.current === 'A' ? 'B' : 'A';

    newAudio.src = newSrc;
    newAudio.volume = 0;
    newAudio.loop = repeatRef.current === 'one';
    newAudio.play().catch(() => {});

    let start = -1;
    const oldStartVol = oldAudio.volume;

    const step = (now: number) => {
      if (start < 0) start = now;
      const elapsed = now - start;
      const t = Math.min(elapsed / CROSSFADE_MS, 1);
      oldAudio.volume = oldStartVol * (1 - t);
      newAudio.volume = newVolume * t;
      if (t < 1) {
        crossfadeRafRef.current = requestAnimationFrame(step);
      } else {
        oldAudio.pause();
        oldAudio.currentTime = 0;
        oldAudio.volume = 0;
      }
    };
    crossfadeRafRef.current = requestAnimationFrame(step);
    audioRef.current = newAudio;
  }, []);

  useEffect(() => {
    if (!musicEnabled) return;
    if (!audioARef.current) {
      audioARef.current = new Audio();
      audioARef.current.preload = 'metadata';
      audioBRef.current = new Audio();
      audioBRef.current.preload = 'metadata';
      audioRef.current = audioARef.current;
    }
    const onPlay = () => {
      setIsPlaying(true);
      setError(null);
    };
    const onPause = () => {
      if (audioRef.current && !audioRef.current.paused) return;
      setIsPlaying(false);
    };
    const onTimeUpdate = () => {
      const a = audioRef.current;
      if (a) setCurrentTime(a.currentTime);
    };
    const onLoadedMetadata = () => {
      const a = audioRef.current;
      if (a) {
        setDuration(a.duration);
        if (a.src)
          setTrackDurations((prev) => ({ ...prev, [a.src]: a.duration }));
      }
    };
    const onError = () => setError('Failed to load track');
    const onEnded = () => {
      if (repeatRef.current === 'one') return;
      const dir = (i: number) =>
        shuffleRef.current
          ? shuffleOrderRef.current[
              (shuffleOrderRef.current.indexOf(i) + 1) %
                shuffleOrderRef.current.length
            ]
          : (i + 1) % tracksLengthRef.current;
      let idx = dir(index);
      let safety = tracksLengthRef.current;
      while (!enabledTracksRef.current.has(idx) && safety-- > 0) idx = dir(idx);
      setIndex(idx);
    };

    const events = [
      ['play', onPlay],
      ['pause', onPause],
      ['timeupdate', onTimeUpdate],
      ['loadedmetadata', onLoadedMetadata],
      ['ended', onEnded],
      ['error', onError],
    ] as const;
    [audioARef.current, audioBRef.current].forEach((a) => {
      if (!a) return;
      events.forEach(([evt, fn]) => a.addEventListener(evt, fn));
    });

    const seekPos = audioRef.current?.currentTime ?? 0;
    const isReorder = audioRef.current?.src === track.src;
    crossfadeTo(track.src, volumeRef.current);
    if (isReorder && seekPos > 0) {
      const a = audioRef.current;
      if (a) a.currentTime = seekPos;
    }

    return () => {
      [audioARef.current, audioBRef.current].forEach((a) => {
        if (!a) return;
        events.forEach(([evt, fn]) => a.removeEventListener(evt, fn));
      });
    };
  }, [musicEnabled, index, crossfadeTo, track.src]);

  useEffect(
    () => () => {
      cancelAnimationFrame(crossfadeRafRef.current);
      [audioARef.current, audioBRef.current].forEach((a) => {
        if (a) {
          a.pause();
          a.src = '';
        }
      });
      audioARef.current = null;
      audioBRef.current = null;
      audioRef.current = null;
    },
    [],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
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
      while (!enabledTracks.has(idx) && safety-- > 0) {
        idx = shuffle
          ? shuffleOrder[(shuffleOrder.indexOf(idx) + 1) % shuffleOrder.length]
          : (idx + 1) % tracks.length;
      }
      if (idx === index) {
        audioRef.current?.play().catch(() => {});
        return;
      }
      setIndex(idx);
    },
    [index, enabledTracks, shuffle, shuffleOrder, tracks.length],
  );

  const next = useCallback(() => {
    const ni = shuffle
      ? shuffleOrder[(shuffleOrder.indexOf(index) + 1) % shuffleOrder.length]
      : (index + 1) % tracks.length;
    playIndex(ni);
  }, [index, shuffle, shuffleOrder, tracks.length, playIndex]);

  const prev = useCallback(() => {
    const pi = shuffle
      ? shuffleOrder[
          (shuffleOrder.indexOf(index) - 1 + shuffleOrder.length) %
            shuffleOrder.length
        ]
      : (index - 1 + tracks.length) % tracks.length;
    playIndex(pi);
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
      const ni = newTracks.findIndex((t) => t.src === currentSrc);
      if (ni !== -1) setIndex(ni);
      saveStoredSettings({
        musicTrackOrder: newTracks.map((_, i) =>
          tracks.findIndex((t) => t.src === newTracks[i].src),
        ),
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

  usePlayerKeyboard({
    enabled: musicEnabled,
    visible,
    audioRef,
    volumeRef,
    togglePlay,
    seekTo,
    prev,
    next,
    setVolume,
  });

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
    trackDurations,
    loading,
    error,
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
