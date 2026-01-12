import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export const getStatusStyles = (palette: Palette) => {
  const {
    isLight,
    gameRoom: { surfaceShadow, statusLobby, statusInProgress, statusCompleted },
  } = palette;

  return {
    statusPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.35 : 0.5,
        radius: 8,
        offset: { width: 0, height: 2 },
        elevation: 1,
      }),
    },
    statusLobby: {
      backgroundColor: statusLobby,
    },
    statusInProgress: {
      backgroundColor: statusInProgress,
    },
    statusCompleted: {
      backgroundColor: statusCompleted,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
  };
};
