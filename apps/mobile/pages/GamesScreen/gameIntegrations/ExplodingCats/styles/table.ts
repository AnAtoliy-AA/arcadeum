import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export const getTableStyles = (palette: Palette) => {
  const {
    isLight,
    gameRoom: {
      border: borderColor,
      surfaceShadow,
    },
  } = palette;

  return {
    fullscreenTableWrapper: {
      flex: 1,
    },
    tableOnlyCloseButton: {
      position: 'absolute',
      left: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: palette.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.85 : 0.75,
        radius: 12,
        offset: { width: 0, height: 6 },
        elevation: 3,
      }),
    },
    tableOnlyCloseIcon: {
      color: palette.text,
    },
    tableOnlyCloseText: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 13,
    },
  };
};
