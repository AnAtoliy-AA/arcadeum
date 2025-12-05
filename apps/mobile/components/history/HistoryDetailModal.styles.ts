import { StyleSheet } from 'react-native';
import type { Palette } from '@/hooks/useThemedStyles';

export function createStyles(palette: Palette) {
  return StyleSheet.create({
    modalSafeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: palette.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.icon,
      gap: 12,
    },
    headerIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
    modalTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '600',
      textAlign: 'center',
    },
    modalLoading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
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
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: palette.tint,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    refreshButtonText: {
      color: palette.background,
      fontWeight: '600',
    },
    modalScroll: {
      flex: 1,
    },
    modalScrollContent: {
      padding: 16,
      gap: 24,
    },
    detailTimestamp: {
      fontSize: 13,
      color: palette.icon,
      textAlign: 'center',
      marginBottom: 8,
    },
    modalSection: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    sectionDescription: {
      fontSize: 14,
      color: palette.icon,
      lineHeight: 20,
    },
    rematchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: palette.tint,
      paddingVertical: 12,
      borderRadius: 12,
    },
    rematchButtonDisabled: {
      opacity: 0.6,
    },
    rematchButtonText: {
      color: palette.background,
      fontSize: 16,
      fontWeight: '600',
    },
    participantRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.icon,
    },
    participantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    participantName: {
      fontSize: 16,
      flex: 1,
    },
    hostBadge: {
      fontSize: 12,
      color: palette.tint,
      fontWeight: '600',
      backgroundColor: palette.background,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.tint,
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginTop: 8,
    },
    removeButtonDisabled: {
      opacity: 0.6,
    },
    removeButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    logItem: {
      padding: 12,
      backgroundColor: palette.background,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      gap: 4,
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    logTimestamp: {
      fontSize: 12,
      color: palette.icon,
    },
    logScope: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.tint,
    },
    logSender: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
    },
    logMessage: {
      fontSize: 14,
      lineHeight: 20,
    },
  });
}

export type HistoryDetailModalStyles = ReturnType<typeof createStyles>;
