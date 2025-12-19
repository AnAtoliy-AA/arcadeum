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
      paddingTop: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
      paddingTop: 12,
    },
    listContent: {
      paddingVertical: 12,
    },
    chatItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.icon,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    chatItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    chatAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.tint,
    },
    chatTextContainer: {
      flex: 1,
      gap: 4,
    },
    chatTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    chatSubtitle: {
      fontSize: 14,
      color: palette.icon,
    },
    chatTimestamp: {
      fontSize: 12,
      color: palette.icon,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
    },
    placeholderText: {
      fontSize: 14,
      color: palette.icon,
    },
    errorText: {
      fontSize: 14,
      color: palette.error,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 12,
      marginBottom: 12,
    },
    searchInput: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: palette.text,
      backgroundColor: palette.background,
    },
    searchStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchResultsContainer: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      borderRadius: 8,
      overflow: 'hidden',
    },
    searchResultItem: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: palette.background,
    },
    searchResultItemDisabled: {
      opacity: 0.6,
    },
    searchResultContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    searchResultAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.tint,
    },
    searchResultTextContainer: {
      flex: 1,
      gap: 2,
    },
    searchResultTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    searchResultSubtitle: {
      fontSize: 14,
      color: palette.icon,
    },
  });
}

export type ChatListScreenStyles = ReturnType<typeof createStyles>;
