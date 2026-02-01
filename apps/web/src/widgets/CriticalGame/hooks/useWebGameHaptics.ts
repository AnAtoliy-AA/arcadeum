import { useEffect, useRef } from 'react';
import { loadStoredSettings } from '@/shared/lib/settings-storage';

export function useWebGameHaptics(isMyTurn: boolean) {
  const prevIsMyTurn = useRef(isMyTurn);

  useEffect(() => {
    if (isMyTurn && !prevIsMyTurn.current) {
      const settings = loadStoredSettings();
      // Default to false if undefined
      if (settings.hapticsEnabled === true) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          // Vibrate for 200ms
          navigator.vibrate(200);
        }
      }
    }
    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn]);
}
