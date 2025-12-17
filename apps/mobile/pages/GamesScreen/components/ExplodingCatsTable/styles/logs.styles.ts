import { StyleSheet } from 'react-native';
import type { StyleThemeContext } from './theme';

/**
 * Game logs section styles.
 */
export function createLogsStyles(ctx: StyleThemeContext) {
  const {
    raised,
    titleText,
    heroBadgeText,
    decorPlay,
    primaryBgColor,
    primaryTextColor,
  } = ctx;

  return StyleSheet.create({
    logsSection: {
      gap: 12,
    },
    logsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logsHeaderText: {
      color: heroBadgeText,
      fontWeight: '600',
    },
    logsEmptyText: {
      color: heroBadgeText,
      fontSize: 12,
      fontStyle: 'italic',
    },
    logsList: {
      maxHeight: 260,
      marginTop: 12,
    },
    logsListContent: {
      gap: 12,
      paddingBottom: 8,
    },
    logRow: {
      flexDirection: 'row',
      gap: 10,
    },
    logTimestamp: {
      color: heroBadgeText,
      fontSize: 11,
      width: 52,
      fontVariant: ['tabular-nums'],
    },
    logMessage: {
      flex: 1,
      color: titleText,
      fontSize: 12,
    },
    logMessageColumn: {
      flex: 1,
      gap: 4,
    },
    logMessageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logMessageSender: {
      color: titleText,
      fontWeight: '600',
      fontSize: 12,
    },
    logScopeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: raised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: `${decorPlay}44`,
    },
    logScopeBadgeText: {
      color: heroBadgeText,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    logMessageText: {
      color: heroBadgeText,
      fontSize: 12,
      lineHeight: 16,
    },
    logsComposer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
    },
    logsInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 96,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: raised,
      color: titleText,
      fontSize: 13,
    },
    logsInputPlaceholder: {
      color: heroBadgeText,
    },
    logsSendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: primaryBgColor,
    },
    logsSendButtonDisabled: {
      opacity: 0.5,
    },
    logsSendButtonText: {
      color: primaryTextColor,
      fontWeight: '700',
      fontSize: 13,
    },
    logsCheckboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
  });
}

export type LogsStyles = ReturnType<typeof createLogsStyles>;
