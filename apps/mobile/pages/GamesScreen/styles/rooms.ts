import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';
import { platformShadow } from '@/lib/platformShadow';

export const getRoomsStyles = (palette: Palette) => {
  const {
    isLight,
    cardBackground,
    cardBorder: borderColor,
    gameRoom: { surfaceShadow },
    gameDetail: { raisedBackground },
  } = palette;

  return {
    roomsCard: {
      backgroundColor: cardBackground,
      borderRadius: 20,
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
    roomsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    roomsRefreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    roomsRefreshText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 13,
    },
    roomsCaption: {
      color: palette.icon,
      lineHeight: 20,
    },
    roomsSkeletonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    roomsSkeletonSpinner: {
      color: palette.tint,
    },
    roomsSkeletonText: {
      color: palette.icon,
    },
    roomsErrorCard: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      borderRadius: 16,
      padding: 16,
      backgroundColor: raisedBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
    },
    roomsErrorIcon: {
      color: '#F97316',
    },
    roomsErrorCopy: {
      flex: 1,
      gap: 4,
    },
    roomsErrorTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomsErrorText: {
      color: palette.icon,
    },
    roomsRetryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      backgroundColor: cardBackground,
    },
    roomsRetryText: {
      color: palette.tint,
      fontWeight: '600',
    },
    roomsEmptyState: {
      borderRadius: 18,
      padding: 20,
      alignItems: 'center',
      gap: 12,
      backgroundColor: raisedBackground,
    },
    roomsEmptyIcon: {
      color: palette.tint,
    },
    roomsEmptyTitle: {
      color: palette.text,
      fontWeight: '600',
    },
    roomsEmptyText: {
      color: palette.icon,
      textAlign: 'center',
      lineHeight: 20,
    },
    roomsEmptyButton: {
      marginTop: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: palette.tint,
    },
    roomsEmptyButtonDisabled: {
      opacity: 0.45,
    },
    roomsEmptyButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    roomsEmptyButtonTextDisabled: {
      opacity: 0.75,
    },
  };
};
