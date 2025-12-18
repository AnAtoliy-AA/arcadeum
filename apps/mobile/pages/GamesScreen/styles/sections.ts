import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export const getSectionsStyles = (palette: Palette) => {
  const {
    isLight,
    cardBackground,
    cardBorder: borderColor,
    gameRoom: { surfaceShadow },
    gameDetail: { raisedBackground },
  } = palette;

  return {
    sectionCard: {
      backgroundColor: cardBackground,
      borderRadius: 18,
      padding: 20,
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
    },
    sectionTitle: {
      color: palette.text,
    },
    sectionDescription: {
      color: palette.icon,
      lineHeight: 20,
    },
    sectionContent: {
      gap: 16,
    },
    listItem: {
      flexDirection: 'row',
      gap: 12,
    },
    listIcon: {
      color: palette.tint,
    },
    listCopy: {
      flex: 1,
      gap: 4,
    },
    listTitle: {
      color: palette.text,
    },
    listBody: {
      color: palette.icon,
      lineHeight: 20,
    },
    stepItem: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
    },
    stepBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: raisedBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBadgeText: {
      color: palette.tint,
      fontWeight: '700',
    },
    stepCopy: {
      flex: 1,
      gap: 4,
    },
    emptyCard: {
      backgroundColor: cardBackground,
      borderRadius: 18,
      padding: 24,
      alignItems: 'center',
      gap: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    emptyIcon: {
      color: palette.tint,
    },
    emptyTitle: {
      textAlign: 'center',
    },
    emptyCopy: {
      color: palette.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
  };
};
