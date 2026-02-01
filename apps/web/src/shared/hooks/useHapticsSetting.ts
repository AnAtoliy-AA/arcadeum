import { useCallback, useSyncExternalStore } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
} from '../lib/settings-storage';

export function useHapticsSetting() {
  const hapticsEnabled = useSyncExternalStore(
    subscribeToSettings,
    () => loadStoredSettings().hapticsEnabled ?? false,
    () => false,
  );

  const setHapticsEnabled = useCallback((enabled: boolean) => {
    saveStoredSettings({ hapticsEnabled: enabled });
  }, []);

  return { hapticsEnabled, setHapticsEnabled };
}
