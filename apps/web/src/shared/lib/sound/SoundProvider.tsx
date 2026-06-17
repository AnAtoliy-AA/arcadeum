'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

import { useSoundSetting } from '@/shared/hooks/useSoundSetting';
import { createSoundPlayer, type SoundPlayer } from './createSoundPlayer';
import type { SoundId } from './sound-manifest';

type SoundContextValue = {
  play: (id: SoundId) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

/**
 * App-wide sound layer. Mounted once near the root so any client component can
 * `useSound()`. Respects the existing `soundEnabled` user setting — when the
 * user mutes sound in Settings, every `play()` becomes a no-op.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const { soundEnabled } = useSoundSetting();

  const playerRef = useRef<SoundPlayer | null>(null);
  if (playerRef.current === null) {
    playerRef.current = createSoundPlayer();
  }

  // Keep the latest mute state in a ref so the stable `play` closure below
  // always reads the current value without re-creating the context value.
  const enabledRef = useRef(soundEnabled);
  useEffect(() => {
    enabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const preloadedRef = useRef(false);

  const value = useMemo<SoundContextValue>(
    () => ({
      play: (id) => {
        if (!preloadedRef.current) {
          preloadedRef.current = true;
          playerRef.current?.preloadAll();
        }
        playerRef.current?.play(id, enabledRef.current);
      },
    }),
    [],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSoundContext(): SoundContextValue | null {
  return useContext(SoundContext);
}
