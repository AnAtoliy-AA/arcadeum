import { useEffect, useRef } from 'react';
import { loadStoredSettings } from '@/shared/lib/settings-storage';

export function useWebGameHaptics(isMyTurn: boolean) {
  const prevIsMyTurn = useRef(isMyTurn);
  const hapticsEnabledRef = useRef<boolean | null>(null);

  useEffect(() => {
    const settings = loadStoredSettings();
    hapticsEnabledRef.current = settings.hapticsEnabled === true;
  }, []);

  useEffect(() => {
    if (isMyTurn && !prevIsMyTurn.current) {
      if (hapticsEnabledRef.current) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(200);
        }
      }
    }
    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn]);
}
