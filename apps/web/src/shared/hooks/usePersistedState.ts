import { useCallback, useSyncExternalStore } from 'react';
import {
  loadStoredSettings,
  saveStoredSettings,
  subscribeToSettings,
  type StoredSettings,
} from '../lib/settings-storage';

type MusicKey = 'musicVolume' | 'musicShuffle' | 'musicRepeat';

export function usePersistedState<K extends MusicKey>(
  key: K,
  defaultValue: NonNullable<StoredSettings[K]>,
): [
  NonNullable<StoredSettings[K]>,
  (value: NonNullable<StoredSettings[K]>) => void,
] {
  const value = useSyncExternalStore(
    subscribeToSettings,
    () =>
      (loadStoredSettings()[key] ?? defaultValue) as NonNullable<
        StoredSettings[K]
      >,
    () => defaultValue,
  );

  const setValue = useCallback(
    (v: NonNullable<StoredSettings[K]>) => {
      saveStoredSettings({ [key]: v } as Partial<StoredSettings>);
    },
    [key],
  );

  return [value, setValue];
}
