import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface UseGameHapticsOptions {
  isMyTurn: boolean;
  enabled?: boolean;
}

export function useGameHaptics({
  isMyTurn,
  enabled = true,
}: UseGameHapticsOptions) {
  const prevIsMyTurn = useRef(isMyTurn);

  useEffect(() => {
    // Only run on mobile devices
    if (Platform.OS === 'web') return;

    if (!enabled) return;

    // Trigger haptic when turn changes to mine
    if (isMyTurn && !prevIsMyTurn.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn, enabled]);
}
