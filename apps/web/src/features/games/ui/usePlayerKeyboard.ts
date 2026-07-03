'use client';

import { useEffect, type RefObject } from 'react';

interface UsePlayerKeyboardOpts {
  enabled: boolean;
  visible: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  volumeRef: RefObject<number>;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  prev: () => void;
  next: () => void;
  setVolume: (v: number) => void;
}

export function usePlayerKeyboard({
  enabled,
  visible,
  audioRef,
  volumeRef,
  togglePlay,
  seekTo,
  prev,
  next,
  setVolume,
}: UsePlayerKeyboardOpts) {
  useEffect(() => {
    if (!enabled || !visible) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs and setState setters are stable
  }, [enabled, visible, togglePlay, seekTo, prev, next]);
}
