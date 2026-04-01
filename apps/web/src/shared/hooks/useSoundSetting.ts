import { useCallback, useSyncExternalStore } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
} from '../lib/settings-storage';

export function useSoundSetting() {
  const soundEnabled = useSyncExternalStore(
    subscribeToSettings,
    () => loadStoredSettings().soundEnabled ?? true,
    () => true,
  );

  const setSoundEnabled = useCallback((enabled: boolean) => {
    saveStoredSettings({ soundEnabled: enabled });
  }, []);

  return { soundEnabled, setSoundEnabled };
}
