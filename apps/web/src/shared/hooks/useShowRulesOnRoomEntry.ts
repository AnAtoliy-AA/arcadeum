import { useCallback, useSyncExternalStore } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
} from '../lib/settings-storage';

export function useShowRulesOnRoomEntry() {
  const showRulesOnRoomEntry = useSyncExternalStore(
    subscribeToSettings,
    () => loadStoredSettings().showRulesOnRoomEntry ?? true,
    () => true,
  );

  const setShowRulesOnRoomEntry = useCallback((value: boolean) => {
    saveStoredSettings({ showRulesOnRoomEntry: value });
  }, []);

  return { showRulesOnRoomEntry, setShowRulesOnRoomEntry };
}
