import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export const getMetaStyles = (palette: Palette) => {
  const {
    isLight,
    gameRoom: { actionBackground, actionBorder, surfaceShadow },
  } = palette;

  return {
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minWidth: '45%',
      padding: 12,
      borderRadius: 16,
      backgroundColor: actionBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: actionBorder,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 0.3 : 0.5,
        radius: 8,
        offset: { width: 0, height: 3 },
        elevation: 2,
      }),
    },
    metaItemIcon: {
      color: palette.tint,
    },
    metaItemCopy: {
      gap: 2,
    },
    metaItemLabel: {
      color: palette.icon,
      fontSize: 12,
      fontWeight: '600',
    },
    metaItemValue: {
      color: palette.text,
      fontWeight: '600',
    },
  };
};
