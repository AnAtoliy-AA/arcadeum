import { useCallback, useSyncExternalStore } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
} from '../lib/settings-storage';

/**
 * Background-music preference. Mirrors {@link useSoundSetting} but tracks a
 * separate `musicEnabled` flag so players can control SFX and music
 * independently. Opt-in — disabled by default.
 */
export function useMusicSetting() {
  const musicEnabled = useSyncExternalStore(
    subscribeToSettings,
    () => loadStoredSettings().musicEnabled ?? false,
    () => false,
  );

  const setMusicEnabled = useCallback((enabled: boolean) => {
    saveStoredSettings({ musicEnabled: enabled });
  }, []);

  return { musicEnabled, setMusicEnabled };
}
