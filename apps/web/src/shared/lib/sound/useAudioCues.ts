'use client';

import { useRef, useCallback, useEffect, useMemo } from 'react';
import { useAudioCuesSetting } from '@/shared/hooks/useAudioCuesSetting';
import { createSoundPlayer, type SoundPlayer } from './createSoundPlayer';

export type AudioCueId =
  | 'move'
  | 'turn'
  | 'hit'
  | 'miss'
  | 'sink'
  | 'gameStart';

export type AudioCuesPlayer = {
  playCue: (id: AudioCueId) => void;
};

export function useAudioCues(): AudioCuesPlayer {
  const { audioCuesEnabled } = useAudioCuesSetting();
  const playerRef = useRef<SoundPlayer | null>(null);
  if (playerRef.current === null) {
    playerRef.current = createSoundPlayer();
  }

  const enabledRef = useRef(audioCuesEnabled);
  useEffect(() => {
    enabledRef.current = audioCuesEnabled;
  }, [audioCuesEnabled]);

  const preloadedRef = useRef(false);

  const playCue = useCallback((id: AudioCueId) => {
    if (!preloadedRef.current) {
      preloadedRef.current = true;
      playerRef.current?.preloadAll();
    }
    playerRef.current?.play(id, enabledRef.current);
  }, []);

  return useMemo(() => ({ playCue }), [playCue]);
}
