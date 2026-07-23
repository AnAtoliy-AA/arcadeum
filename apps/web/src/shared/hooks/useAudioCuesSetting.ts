import { useCallback, useSyncExternalStore } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
} from '../lib/settings-storage';

export function useAudioCuesSetting() {
  const audioCuesEnabled = useSyncExternalStore(
    subscribeToSettings,
    () => loadStoredSettings().audioCuesEnabled ?? false,
    () => false,
  );

  const setAudioCuesEnabled = useCallback((enabled: boolean) => {
    saveStoredSettings({ audioCuesEnabled: enabled });
  }, []);

  return { audioCuesEnabled, setAudioCuesEnabled };
}
