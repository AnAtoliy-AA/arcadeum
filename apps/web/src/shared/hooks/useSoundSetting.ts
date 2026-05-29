import { useCallback, useSyncExternalStore } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
} from '../lib/settings-storage';

export function useSoundSetting() {
  // Sound effects are opt-in — disabled until the user turns them on.
  const soundEnabled = useSyncExternalStore(
    subscribeToSettings,
    () => loadStoredSettings().soundEnabled ?? false,
    () => false,
  );

  const setSoundEnabled = useCallback((enabled: boolean) => {
    saveStoredSettings({ soundEnabled: enabled });
  }, []);

  return { soundEnabled, setSoundEnabled };
}
