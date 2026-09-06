'use client';

import { useState, useCallback, useEffect } from 'react';
import { chessSounds, type SoundType } from './sounds';

const STORAGE_KEY = 'chess-sound-settings';

interface SoundSettings {
  muted: boolean;
  volume: number;
}

function loadSettings(): SoundSettings {
  if (typeof window === 'undefined') return { muted: false, volume: 0.5 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as SoundSettings;
  } catch {}
  return { muted: false, volume: 0.5 };
}

function saveSettings(settings: SoundSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function useChessSounds() {
  const [settings, setSettings] = useState<SoundSettings>(loadSettings);

  useEffect(() => {
    chessSounds.setMuted(settings.muted);
    chessSounds.setVolume(settings.volume);
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    void chessSounds.loadAll();
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      chessSounds.play(type);
    },
    [],
  );

  const toggleMute = useCallback(() => {
    setSettings((prev) => ({ ...prev, muted: !prev.muted }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings((prev) => ({ ...prev, volume }));
  }, []);

  return {
    muted: settings.muted,
    volume: settings.volume,
    playSound,
    toggleMute,
    setVolume,
  };
}
