import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';

export function createStyles(palette: Palette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
    },
    listContent: {
      paddingVertical: 16,
      gap: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      gap: 12,
    },
    placeholderText: {
      fontSize: 14,
      color: palette.icon,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: palette.error,
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.tint,
    },
    retryText: {
      color: palette.tint,
      fontSize: 14,
      fontWeight: '600',
    },
    footerLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
    },
    footerLoadingText: {
      fontSize: 13,
      color: palette.icon,
    },
    loadMoreButton: {
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadMoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.tint,
    },
  });
}
