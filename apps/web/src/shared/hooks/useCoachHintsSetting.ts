import { useCallback, useSyncExternalStore } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
} from '../lib/settings-storage';

export function useCoachHintsSetting() {
  // Coach hints are opt-out — a hint is only ever shown after the player
  // clicks the button, so defaulting to enabled keeps the feature discoverable.
  const coachHintsEnabled = useSyncExternalStore(
    subscribeToSettings,
    () => loadStoredSettings().coachHintsEnabled ?? true,
    () => true,
  );

  const setCoachHintsEnabled = useCallback((value: boolean) => {
    saveStoredSettings({ coachHintsEnabled: value });
  }, []);

  return { coachHintsEnabled, setCoachHintsEnabled };
}
